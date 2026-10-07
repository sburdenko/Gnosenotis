/** Deep-dive lessons for the "C#" questions. Trusted static HTML — see `./index.ts`. */
export const csharpDeepDives: Record<number, string> = {

21: `<h3>Простыми словами</h3>
<p>Тестируемый код — это код, который можно запустить без сцены, без кадра и без мыши. Если для проверки «урон считается правильно» нужно нажать Play и ударить врага, значит, логика приклеена к MonoBehaviour. Рецепт один: <b>решения</b> живут в обычных C#-классах, а MonoBehaviour лишь подаёт им вход (время, ввод, коллизии) и забирает результат.</p>
<h3>Как это выглядит в коде</h3>
<pre><span class="cm">// Чистая логика: ни Unity, ни времени, ни сцены</span>
public sealed class Stamina
{
    public float Value { get; private set; }
    public Stamina(float max) => Value = max;
    public bool TrySpend(float cost) { if (Value &lt; cost) return false; Value -= cost; return true; }
    public void Regen(float perSecond, float dt) => Value = Math.Min(Value + perSecond * dt, 100f);
}

<span class="cm">// Адаптер: только склейка с движком</span>
public class StaminaBehaviour : MonoBehaviour
{
    readonly Stamina stamina = new(100f);
    void Update() => stamina.Regen(5f, Time.deltaTime);
}

<span class="cm">// Тест в Edit Mode: миллисекунды, без Play</span>
[Test] public void Spend_fails_when_empty() { var s = new Stamina(1f); Assert.IsFalse(s.TrySpend(2f)); }</pre>
<p>Всё недетерминированное — время, случайность, сеть — заходит через интерфейсы (<code>ITimeProvider</code>, <code>IRandom</code>): в тесте подставляется фиксированное значение, и результат повторяем.</p>
<h3>Пирамида тестов для Unity</h3>
<p>Снизу много Edit Mode тестов чистой логики. Выше — немного Play Mode тестов на интеграцию: физика, жизненный цикл компонентов, загрузка сцены. На вершине — пара смоук-тестов, которые грузят реальную сцену. Тестовые сборки объявляются отдельным <code>asmdef</code> с ссылкой на <code>nunit.framework</code> — тогда тесты не попадают в билд.</p>
<h3>Ловушки</h3>
<p><b>Тестировать движок.</b> «Transform двигается, когда я меняю position» — это тест Unity, а не ваш. Тестируйте свои правила.</p>
<p><b>Тесты, которые грузят сцену.</b> Медленные и хрупкие: переименовали объект — упали десять тестов. Держите такие единицами, как смоук.</p>
<p><b>Статика.</b> Синглтоны и статические менеджеры тащат состояние между тестами. Чистая логика на экземплярах решает это бесплатно.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Я разделяю решения и обвязку: чистые классы с явными зависимостями покрываю Edit Mode тестами, Play Mode оставляю для интеграции. Самые ценные тесты в Unity-проекте часто не юнит-, а валидационные: ссылки в префабах резолвятся, данные в ScriptableObject в диапазонах — это ловит ежедневную поломку контента».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Packages/com.unity.test-framework@latest" target="_blank">Unity Test Framework</a> <span>— официальная документация пакета: Edit/Play Mode, UnityTest, asmdef</span></li>
<li><a href="https://unity.com/how-to/testing-and-quality-assurance-tips-unity-projects" target="_blank">Unity: Testing and QA tips</a> <span>— как команды Unity выстраивают пирамиду тестов</span></li>
</ul></div>`,

22: `<h3>Простыми словами</h3>
<p>Dependency Injection — это когда объект не ищет свои зависимости сам (через <code>FindObjectOfType</code> или синглтон), а получает их снаружи: в конструктор, в поле или в метод. Кто «снаружи» — и есть разница между подходами.</p>
<h3>Четыре способа, от простого к тяжёлому</h3>
<p><b>1. Ссылки через [SerializeField].</b> Дизайнер тянет объект в поле. Просто и наглядно, но связи живут в сцене: префаб вне сцены не знает, откуда взять сервис, а переименование объекта ломает ссылку молча.</p>
<p><b>2. Composition root вручную.</b> Одна bootstrap-сцена или один класс, который создаёт все системы и соединяет их конструкторами. Зависимости явные, контейнера нет, но с ростом проекта этот класс превращается в 500 строк <code>new</code>.</p>
<p><b>3. Service locator.</b> <code>Services.Get&lt;IAudio&gt;()</code> из любого места. Удобно, но зависимости прячутся внутри методов: по сигнатуре класса не видно, что ему нужно, и тест обязан поднимать весь локатор.</p>
<p><b>4. Контейнер (VContainer, Zenject).</b> Регистрируете типы со временем жизни, контейнер строит граф и внедряет в конструкторы. VContainer сегодня предпочтительнее: почти без аллокаций, быстрый resolve, нет рефлексии в горячем пути.</p>
<pre><span class="cm">// VContainer: LifetimeScope — это и есть composition root</span>
public class GameLifetimeScope : LifetimeScope
{
    protected override void Configure(IContainerBuilder b)
    {
        b.Register&lt;IAudio, AudioService&gt;(Lifetime.Singleton);
        b.RegisterEntryPoint&lt;MatchFlow&gt;();     <span class="cm">// запускается как система, не как MonoBehaviour</span>
    }
}</pre>
<h3>Когда DI оправдан</h3>
<p>Когда много сквозных систем (аудио, сейвы, аналитика, сеть), когда нужны тесты без Play Mode, когда у систем разные времена жизни по сценам (матч живёт короче, чем профиль игрока). На прототипе на две недели контейнер — лишний слой: его настройка дороже проблем, которые он решает.</p>
<h3>Ловушки</h3>
<p><b>FindObjectOfType в Awake.</b> Самый дорогой и самый хрупкий способ «внедрения». Плюс статические синглтоны повсюду — это неявный глобальный граф, который нельзя ни протестировать, ни заменить.</p>
<p><b>Инъекция в MonoBehaviour.</b> У них нет конструктора; внедрять приходится в метод <code>[Inject]</code>, и порядок инициализации становится вопросом. Держите логику в plain-классах, а MonoBehaviour делайте тонким.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Я выбираю подход по размеру проекта: ссылки и ручной composition root для малого, VContainer для среднего и большого. Главное не контейнер, а правило: зависимости объявляются в конструкторе и видны по сигнатуре».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://vcontainer.hadashikick.jp/" target="_blank">VContainer</a> <span>— документация, сравнение с Zenject по производительности</span></li>
<li><a href="https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection" target="_blank">Microsoft: Dependency injection</a> <span>— базовые понятия и времена жизни, независимо от Unity</span></li>
</ul></div>`,

133: `<h3>Простыми словами</h3>
<p>«Struct на стеке, class в куче» — мем, который на собесе лучше не повторять дословно. Тип не решает, где лежат данные. Решает <b>контейнер</b>: где живёт переменная, там и её значение. Struct хранится прямо внутри того, кто его содержит; class хранится отдельно, а в контейнере лежит только ссылка.</p>
<h3>Где на самом деле оказывается struct</h3>
<pre>struct P { public float x, y; }

void M()
{
    P local;            <span class="cm">// на стеке (локальная переменная метода)</span>
    var arr = new P[8]; <span class="cm">// 8 структур лежат ПОДРЯД внутри массива — в куче</span>
    var e = new Enemy();<span class="cm">// Enemy.pos (поле типа P) — внутри объекта Enemy, в куче</span>
    object o = local;   <span class="cm">// boxing: отдельный объект в куче с копией P</span>
    Action a = () => local.x++; <span class="cm">// захват: local переехала в display class — в кучу</span>
}</pre>
<p>Точная формулировка: value type хранится inline в своём контейнере и копируется по значению; reference type всегда отдельный объект в куче, а переменная держит ссылку.</p>
<h3>Почему это важно для производительности</h3>
<p><code>struct[]</code> — это непрерывный блок данных: обход идёт по памяти последовательно, кэш-линии заполняются целиком, префетчер счастлив. <code>class[]</code> — массив указателей; каждый элемент — прыжок в случайное место кучи, и каждый прыжок может стоить cache miss (~100 нс). Это главный аргумент data-oriented design, и Unity построила на нём ECS.</p>
<h3>Ловушки</h3>
<p><b>Замыкание.</b> Локальная структура, захваченная лямбдой, больше не на стеке — компилятор создаёт класс-обёртку. Лямбда в Update с захватом — скрытая аллокация.</p>
<p><b>Поле ref-типа внутри struct.</b> Struct с полем <code>string</code> хранит ссылку: сама структура inline, но её данные — в куче, и GC всё равно её сканирует.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Место хранения определяет контейнер, а не тип. Для игр важно не “стек или куча”, а “inline или по ссылке”: inline-хранение даёт последовательную память и отсутствие работы для GC — поэтому Vector3 структура, а массив структур быстрее массива классов».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/archive/blogs/ericlippert/the-stack-is-an-implementation-detail-part-one" target="_blank">Eric Lippert: The Stack Is an Implementation Detail</a> <span>— каноническое разоблачение мифа</span></li>
<li><a href="https://jonskeet.uk/csharp/memory.html" target="_blank">Jon Skeet: Memory in .NET</a> <span>— что где живёт, коротко и точно</span></li>
</ul></div>`,

134: `<h3>Простыми словами</h3>
<p>Строка в .NET — это неизменяемый объект: создали — больше не меняется. Любая «правка» (<code>+</code>, <code>Replace</code>, <code>ToUpper</code>) создаёт новую строку. Интернирование — это оптимизация поверх иммутабельности: одинаковые литералы в коде хранятся один раз, в общем пуле.</p>
<h3>Как работает пул</h3>
<pre>string a = "hp";
string b = "hp";
ReferenceEquals(a, b);            <span class="cm">// true: оба литерала указывают на один объект пула</span>

string c = new string('h', 1) + "p";
ReferenceEquals(a, c);            <span class="cm">// false: собрано в рантайме, в пул не попало</span>
a == c;                           <span class="cm">// true: == у строк сравнивает содержимое</span>

string d = string.Intern(c);
ReferenceEquals(a, d);            <span class="cm">// true: принудительно положили в пул</span></pre>
<p>Литералы интернирует компилятор; всё, что собрано на лету, — нет, пока не вызвать <code>string.Intern</code>. Пул живёт до конца процесса: что туда попало, уже не освободится.</p>
<h3>Что даёт иммутабельность</h3>
<p>Строку можно безопасно читать из нескольких потоков без блокировок. Её хэш стабилен — поэтому строки надёжные ключи словаря. Подстроки и передача по ссылке безопасны: никто не изменит ваш экземпляр. Цена одна: каждая модификация — новый объект, и в цикле это превращается в мусор для GC. Отсюда <code>StringBuilder</code> и <code>SetText</code> в TMP.</p>
<h3>Ловушки</h3>
<p><b>Интернировать пользовательские данные.</b> Имена игроков, чат, id с сервера — это неограниченный поток уникальных строк; пул будет расти вечно.</p>
<p><b>Полагаться на ReferenceEquals.</b> Сравнение строк всегда через <code>==</code> или <code>string.Equals</code> с явным <code>StringComparison.Ordinal</code> — не через ссылку и не через культурно-зависимый метод.</p>
<p><b>string.Empty и "".</b> Это один и тот же объект; выбирайте по вкусу, разницы в производительности нет.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Иммутабельность покупает безопасный шаринг и стабильные хэши ценой аллокации на каждую правку. Интернирование — пул литералов для экономии памяти и быстрого сравнения; в рантайме я его почти не использую, а строковый мусор убираю StringBuilder-ом и типизированным SetText».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/api/system.string.intern" target="_blank">Microsoft: String.Intern</a> <span>— семантика пула и предупреждения</span></li>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/how-to/compare-strings" target="_blank">Microsoft: How to compare strings</a> <span>— почему Ordinal, а не культура</span></li>
</ul></div>`,

135: `<h3>Простыми словами</h3>
<p>Конкатенация в цикле копирует всё накопленное на каждом шаге — O(n²). <code>StringBuilder</code> вместо этого пишет в буфер и копирует один раз в конце. Но «без аллокаций» он не бывает: важно знать, где именно он всё-таки выделяет память.</p>
<h3>Как устроен внутри</h3>
<p>Современный StringBuilder — это связанный список чанков <code>char[]</code>. <code>Append</code> пишет в текущий чанк; когда он заполнен, выделяется новый (обычно размером с уже накопленное, с потолком 8000 символов). Поэтому «рост» дёшев — старые чанки не копируются. А <code>ToString()</code> собирает все чанки в одну новую строку — это всегда аллокация.</p>
<pre><span class="cm">// Создали один раз с запасом — чанков не будет</span>
readonly StringBuilder sb = new(256);

string BuildLabel(int score, int combo)
{
    sb.Clear();                     <span class="cm">// не аллоцирует, буфер остаётся</span>
    sb.Append("Score ").Append(score);   <span class="cm">// Append(int): без boxing и без строки</span>
    sb.Append(" x").Append(combo);
    return sb.ToString();           <span class="cm">// единственная аллокация</span>
}</pre>
<h3>Где StringBuilder всё же аллоцирует</h3>
<p>Каждый новый чанк при переполнении. <code>ToString()</code> — всегда. <code>Append(object)</code> — struct упакуется, поэтому число надо передавать через типизированную перегрузку, а не через <code>object</code>. <code>Append($"...{x}")</code> — интерполяция соберёт строку раньше, чем Append её увидит (в старых компиляторах; новые умеют писать в builder напрямую, но Unity это не гарантирует).</p>
<h3>Игровая дисциплина</h3>
<p>Один экземпляр на систему, ёмкость под худший случай, <code>Clear()</code> перед использованием. <code>ToString()</code> — только когда значение действительно изменилось. Для текста в UI ещё лучше <code>TMP_Text.SetText("{0}", value)</code>: он пишет число в свой буфер и строку не создаёт вовсе.</p>
<h3>Что сказать на собеседовании</h3>
<p>«StringBuilder убирает квадратичное копирование, но не аллокации: чанки, ToString и boxing через Append(object) остаются. В игре я держу один переиспользуемый builder с заранее заданной ёмкостью, а для HUD — SetText без строки».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/api/system.text.stringbuilder" target="_blank">Microsoft: StringBuilder</a> <span>— API и раздел про производительность</span></li>
<li><a href="https://docs.unity3d.com/Packages/com.unity.textmeshpro@latest" target="_blank">TextMeshPro</a> <span>— SetText и перегрузки без аллокаций</span></li>
</ul></div>`,

136: `<h3>Простыми словами</h3>
<p>Словарь не хранит ключи «по значению» — он хранит их по хэшу. <code>GetHashCode</code> отвечает «в какой корзине искать», <code>Equals</code> — «это тот самый ключ?». Если эти два метода не согласованы или хэш меняется после вставки, словарь не падает — он <b>тихо теряет</b> записи.</p>
<h3>Контракт</h3>
<p>Равные объекты обязаны давать равные хэши (обратное не требуется). Хэш не должен меняться, пока объект лежит в коллекции. <code>Equals</code> рефлексивен, симметричен, транзитивен и стабилен. Переопределили одно — переопределяйте второе; компилятор предупреждает именно об этом.</p>
<pre>public readonly struct ItemId : IEquatable&lt;ItemId&gt;
{
    public readonly int Value;
    public ItemId(int v) => Value = v;
    public bool Equals(ItemId other) => other.Value == Value;      <span class="cm">// без boxing</span>
    public override bool Equals(object o) => o is ItemId i &amp;&amp; Equals(i);
    public override int GetHashCode() => Value;
}</pre>
<h3>Что происходит с мутабельным ключом</h3>
<pre>var pos = new MutablePos { x = 1 };
dict[pos] = "spawn";      <span class="cm">// положили в корзину hash(1)</span>
pos.x = 2;                <span class="cm">// хэш теперь hash(2)</span>
dict.ContainsKey(pos);    <span class="cm">// false — ищем не в той корзине</span>
dict.Count;               <span class="cm">// 1 — запись на месте, но недостижима по ключу</span></pre>
<p>Запись видна при переборе, но не находится по ключу и не удаляется. Это классический «утекающий» словарь.</p>
<h3>Ловушки</h3>
<p><b>Структура без IEquatable.</b> Дефолтный <code>Equals</code> у struct работает через рефлексию по полям и боксит — в Dictionary с таким ключом каждая операция аллоцирует. Всегда реализуйте <code>IEquatable&lt;T&gt;</code>.</p>
<p><b>Хэш по мутабельным полям.</b> Если поле может измениться, в хэш его не включать — или сделать тип ключа иммутабельным (readonly struct, record).</p>
<p><b>HashCode.Combine.</b> Для составных ключей: <code>HashCode.Combine(a, b)</code> даёт хорошее распределение; XOR полей — нет (1^2 == 2^1).</p>
<h3>Что сказать на собеседовании</h3>
<p>«Равные — значит равные хэши, и хэш не меняется, пока ключ в коллекции. Ключи делаю иммутабельными readonly-структурами с IEquatable, чтобы не было ни boxing, ни потерянных записей».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/api/system.object.gethashcode" target="_blank">Microsoft: Object.GetHashCode</a> <span>— правила контракта из первоисточника</span></li>
<li><a href="https://learn.microsoft.com/en-us/dotnet/api/system.iequatable-1" target="_blank">Microsoft: IEquatable&lt;T&gt;</a> <span>— зачем он структурам</span></li>
</ul></div>`,

137: `<h3>Простыми словами</h3>
<p>Словарь сравнивает ключи через <code>EqualityComparer&lt;TKey&gt;.Default</code>. Если тип ключа не умеет сравнивать себя типизированно, компарер откатывается на <code>Object.Equals(object)</code> — а это значит упаковать ключ в объект при каждом поиске. Два поиска в кадре — незаметно; поиск на каждого врага каждый кадр — GC.Alloc в профайлере.</p>
<h3>Как это выглядит</h3>
<pre>struct Key { public int a, b; }           <span class="cm">// нет IEquatable — каждый lookup боксит</span>
var d = new Dictionary&lt;Key, int&gt;();
d.TryGetValue(k, out _);                   <span class="cm">// GC.Alloc: Key -> object</span>

<span class="cm">// Лечение: типизированное сравнение + хэш</span>
readonly struct Key : IEquatable&lt;Key&gt;
{
    public readonly int a, b;
    public bool Equals(Key o) => a == o.a &amp;&amp; b == o.b;
    public override int GetHashCode() => HashCode.Combine(a, b);
    public override bool Equals(object o) => o is Key k &amp;&amp; Equals(k);
}</pre>
<h3>Enum как ключ</h3>
<p>Исторически Mono в Unity боксил enum в дефолтном компарере — <code>Dictionary&lt;WeaponType, Stats&gt;</code> аллоцировал на каждом обращении. Современный .NET обрабатывает enum специально, и в свежих версиях Unity это тоже починено, но старые проекты на старых рантаймах всё ещё с этим живут. Два лекарства: свой <code>IEqualityComparer&lt;WeaponType&gt;</code>, который сравнивает через приведение к <code>int</code> (без boxing), либо ключ сразу <code>int</code>.</p>
<pre>sealed class WeaponTypeComparer : IEqualityComparer&lt;WeaponType&gt;
{
    public bool Equals(WeaponType x, WeaponType y) => (int)x == (int)y;
    public int GetHashCode(WeaponType v) => (int)v;
}
var stats = new Dictionary&lt;WeaponType, Stats&gt;(new WeaponTypeComparer());</pre>
<h3>Как проверить</h3>
<p>Profiler → CPU → колонка GC Alloc на методах с поиском в словаре. Если на <code>TryGetValue</code> есть байты — это оно. Второй признак: <code>EqualityComparer.ObjectEqualityComparer</code> в стеке вызовов.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Без IEquatable&lt;T&gt; дефолтный компарер боксит ключ-структуру; для enum то же делал старый Mono. Ключи-структуры у меня всегда readonly с IEquatable и GetHashCode, для enum — собственный компарер или int».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.equalitycomparer-1.default" target="_blank">Microsoft: EqualityComparer&lt;T&gt;.Default</a> <span>— как выбирается компарер</span></li>
<li><a href="https://docs.unity3d.com/Manual/performance-garbage-collection-best-practices.html" target="_blank">Unity: GC best practices</a> <span>— где искать скрытые аллокации</span></li>
</ul></div>`,

138: `<h3>Простыми словами</h3>
<p>GC убирает память — и только память. Файл, сокет, <code>NativeArray</code>, render texture — это ресурсы, о которых GC не знает. <code>IDisposable</code> — договор «я умею отдать ресурс сейчас, не дожидаясь сборщика». <code>using</code> — гарантия, что договор исполнят даже при исключении.</p>
<h3>Что из этого актуально в Unity</h3>
<p><b>IDisposable + using — да, постоянно.</b> <code>NativeArray</code>, <code>NativeList</code>, <code>UnityWebRequest</code>, стримы файлов. Для временных контейнеров в джобах using-декларация (C# 8) делает код плоским:</p>
<pre>using var distances = new NativeArray&lt;float&gt;(count, Allocator.TempJob);
var handle = new DistanceJob { Out = distances }.Schedule(count, 64);
handle.Complete();
<span class="cm">// Dispose вызовется при выходе из метода — и при исключении тоже</span></pre>
<p><b>Финализаторы — почти нет.</b> Они недетерминированы, выполняются в отдельном потоке, задерживают сборку объекта на целое поколение и в Unity не могут трогать движок. Если нужен unmanaged-хэндл — <code>SafeHandle</code> закрывает задачу без вашего финализатора.</p>
<p><b>Полный dispose-паттерн (<code>Dispose(bool)</code> + <code>GC.SuppressFinalize</code>) — редко.</b> Только когда класс напрямую владеет unmanaged-ресурсом. Обёртке над другим IDisposable достаточно простого Dispose, который вызывает Dispose у вложенного.</p>
<h3>UnityEngine.Object — отдельная история</h3>
<p>Он не IDisposable. Жизнью текстур, материалов, GameObject управляет <code>Destroy</code>/<code>DestroyImmediate</code>, а рантайм-созданные <code>Material</code>, <code>Mesh</code>, <code>RenderTexture</code> нужно уничтожать руками — GC их не трогает, и они текут в нативной памяти.</p>
<h3>Ловушки</h3>
<p><b>Забыть Dispose у NativeArray.</b> Safety-система в редакторе напишет «A Native Collection has not been disposed» со стеком — читайте его, это точное место утечки.</p>
<p><b>Dispose дважды.</b> Должен быть безопасен (идемпотентен). Держите флаг.</p>
<p><b>Dispose в многопоточном коде.</b> Контейнер, который ещё читает джоб, освобождать нельзя — сначала <code>Complete()</code>, или <code>Dispose(JobHandle)</code>, чтобы освобождение встало в очередь после джоба.</p>
<h3>Что сказать на собеседовании</h3>
<p>«IDisposable и using — ежедневный инструмент для нативных контейнеров и IO; финализаторов избегаю, SafeHandle покрывает интероп; полный паттерн пишу только для прямого владения unmanaged-ресурсом. А UnityEngine.Object живёт по Destroy, не по GC».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose" target="_blank">Microsoft: Implementing a Dispose method</a> <span>— паттерн и когда он нужен целиком</span></li>
<li><a href="https://docs.unity3d.com/Packages/com.unity.collections@latest" target="_blank">Unity Collections</a> <span>— аллокаторы, Dispose(JobHandle), safety-проверки</span></li>
</ul></div>`,

139: `<h3>Простыми словами</h3>
<p>Обычная ссылка говорит сборщику: «этот объект нужен, не трогай». Слабая ссылка говорит: «если никому больше не нужен — забирай, я переживу». <code>WeakReference&lt;T&gt;</code> держит объект, не мешая его сборке; <code>TryGetTarget</code> вернёт false, когда GC его уже забрал.</p>
<pre>readonly Dictionary&lt;int, WeakReference&lt;TextureMeta&gt;&gt; cache = new();

TextureMeta Get(int id)
{
    if (cache.TryGetValue(id, out var weak) &amp;&amp; weak.TryGetTarget(out var meta))
        return meta;                              <span class="cm">// ещё жив — отдали</span>
    meta = Build(id);                             <span class="cm">// собран — пересчитали</span>
    cache[id] = new WeakReference&lt;TextureMeta&gt;(meta);
    return meta;
}</pre>
<h3>Где это полезно в игре</h3>
<p><b>Кэши, которые не должны продлевать жизнь.</b> Метаданные по ассету, которые имеет смысл помнить, пока ассет жив, и не жалко потерять, когда он выгружен.</p>
<p><b>Событийные системы без утечек.</b> Weak event pattern: издатель держит подписчиков слабо, умерший подписчик отваливается сам. Цена — проверка живости и аллокация на каждую подписку, поэтому в горячих событиях так не делают.</p>
<p><b>Детекторы утечек.</b> В тесте: сохранили слабую ссылку, вызвали <code>GC.Collect()</code>, проверили, что объект исчез. Если жив — кто-то его держит, и это баг.</p>
<h3>Почему в Unity это реже, чем в .NET</h3>
<p>Жизнью <code>UnityEngine.Object</code> управляет <code>Destroy</code>, а не GC: уничтоженный объект остаётся managed-обёрткой, пока на него есть ссылки, но <code>== null</code> уже true. Поэтому обычный эквивалент слабого кэша в Unity — словарь по instance ID плюс явный коллбэк <code>OnDestroy</code>, который чистит запись.</p>
<h3>Ловушки</h3>
<p>Каждый <code>TryGetTarget</code> — не бесплатен; не ставьте слабую ссылку в путь, который дёргается каждый кадр. Слабые ссылки не заменяют Dispose: ресурсы всё равно нужно освобождать явно. И с финализаторами семантика тонкая — объект может «воскреснуть» на один цикл; не стройте на этом логику.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Слабая ссылка — для кэшей, которые не должны владеть, и для тестов на утечки. В Unity жизнь объектов определяет Destroy, поэтому чаще я использую instance ID и явные коллбэки, а WeakReference оставляю для чисто managed-данных».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/weak-references" target="_blank">Microsoft: Weak references</a> <span>— короткие и длинные слабые ссылки, когда применять</span></li>
</ul></div>`,

140: `<h3>Простыми словами</h3>
<p>Managed-объект может переехать: сборщик с компактированием двигает объекты, чтобы убрать дырки. Нативному коду это не объяснишь — он получил адрес и будет по нему писать. Пиннинг — «прибить» объект к месту на время, пока указатель у кого-то снаружи.</p>
<h3>Два способа</h3>
<pre><span class="cm">// fixed: пин на время блока, самый дешёвый</span>
unsafe void Send(byte[] packet)
{
    fixed (byte* p = packet)
        native_send(p, packet.Length);   <span class="cm">// после блока объект снова подвижен</span>
}

<span class="cm">// GCHandle: пин до явного Free — для долгоживущих буферов</span>
var handle = GCHandle.Alloc(buffer, GCHandleType.Pinned);
IntPtr addr = handle.AddrOfPinnedObject();
<span class="cm">// ... нативный код работает с addr ...</span>
handle.Free();                           <span class="cm">// забыли — объект прибит навсегда</span></pre>
<p>Маршалинг P/Invoke для blittable-массивов (<code>byte[]</code>, <code>float[]</code>, массивы структур без ссылок) пиннит сам на время вызова — руками это нужно, только если нативная сторона хранит указатель дольше вызова.</p>
<h3>Почему пиннинг дорог (и почему в Unity — не очень)</h3>
<p>В компактирующем GC (.NET Core) прибитые объекты — острова, которые нельзя сдвинуть: вокруг них копится фрагментация, и чем дольше и чаще пин, тем хуже. Boehm GC в Unity не компактирует вовсе, объекты никогда не двигаются, поэтому пиннинг там почти бесплатен. Но код, который может уехать на обычный .NET (серверы, тулы), должен соблюдать дисциплину.</p>
<h3>Правила</h3>
<p>Пин — на минимальное время. Никогда не кэшировать указатель дольше жизни пина. Для данных, которые нативный код видит долго (аудио-буферы, мешей для физики, буферы джобов), использовать <code>NativeArray</code> или unmanaged-память — GC там вообще не участвует, и пиннить нечего.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Пиннинг фиксирует адрес для интеропа: fixed для короткого, GCHandle для долгого. В компактирующем GC он фрагментирует кучу, поэтому долгоживущие нативные буферы я держу в NativeArray, а не в прибитых managed-массивах».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/api/system.runtime.interopservices.gchandle" target="_blank">Microsoft: GCHandle</a> <span>— типы хэндлов и их семантика</span></li>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/fixed" target="_blank">Microsoft: fixed statement</a> <span>— что можно пиннить и как</span></li>
</ul></div>`,

141: `<h3>Простыми словами</h3>
<p>Процессор читает память не по байту, а кэш-линиями по 64 байта. Поля структуры выравниваются по своему размеру: <code>double</code> хочет адрес, кратный 8. Из этих двух фактов вытекает всё: сколько места занимает структура, сколько структур попадёт в одну линию и почему два потока могут мешать друг другу, не трогая одни и те же данные.</p>
<h3>Паддинг: порядок полей — это размер</h3>
<pre>struct Bad  { bool a; double b; bool c; }   <span class="cm">// 1 + 7 паддинг + 8 + 1 + 7 паддинг = 24 байта</span>
struct Good { double b; bool a; bool c; }   <span class="cm">// 8 + 1 + 1 + 6 паддинг = 16 байт</span></pre>
<p>Для структур по умолчанию действует <code>[StructLayout(LayoutKind.Sequential)]</code> — порядок объявления сохраняется (и обязателен для интеропа). <code>Explicit</code> с <code>[FieldOffset]</code> позволяет класть поля вручную и строить union: два поля на одном смещении.</p>
<h3>Кэш-линии и data-oriented design</h3>
<p>Массив 16-байтовых структур: одна линия — 4 элемента, обход почти всегда попадает в кэш. Раздули структуру до 40 байт — в линии полтора элемента, половина пропускной способности памяти уходит на данные, которые в этом цикле не нужны. Отсюда правило ECS: хранить вместе то, что обрабатывается вместе, и не больше.</p>
<h3>False sharing</h3>
<p>Два потока пишут в <i>разные</i> поля, но они лежат в одной кэш-линии. Каждая запись одного ядра инвалидирует линию в кэше другого, и оба постоянно перечитывают её из памяти — это может быть в 10–50 раз медленнее, чем если бы данные были в разных линиях.</p>
<pre><span class="cm">// Пер-поточные счётчики: разнести по линиям</span>
[StructLayout(LayoutKind.Explicit, Size = 64)]
struct PaddedCounter { [FieldOffset(0)] public long Value; }</pre>
<p>В Job System это ловят, когда параллельные воркеры пишут в соседние ячейки одного <code>NativeArray</code>: батч на 64 элемента по <code>IJobParallelFor</code> это смягчает, но если каждый воркер пишет в «свой» слот результата, слоты лучше разнести.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Поля выравниваются, поэтому порядок объявления определяет размер; CPU читает линиями по 64 байта, поэтому плотные структуры в массиве — основа cache-friendly кода; false sharing — когда потоки делят линию, а не данные, и лечится паддингом».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/api/system.runtime.interopservices.structlayoutattribute" target="_blank">Microsoft: StructLayoutAttribute</a> <span>— Sequential, Explicit, Pack</span></li>
<li><a href="https://docs.unity3d.com/Packages/com.unity.entities@latest" target="_blank">Unity Entities</a> <span>— раздел про chunk-раскладку: кэш-линии на практике</span></li>
</ul></div>`,

142: `<h3>Простыми словами</h3>
<p>Оба модификатора — обещания компилятору. <code>readonly struct</code> обещает «я не меняюсь», и компилятор перестаёт делать защитные копии. <code>ref struct</code> обещает «я живу только на стеке», и компилятор запрещает всё, что могло бы утащить его в кучу. Первый — про скорость, второй — про безопасность указателей.</p>
<h3>readonly struct и защитные копии</h3>
<p>Когда структура доступна только для чтения (поле <code>readonly</code>, параметр <code>in</code>), а вы зовёте у неё метод, компилятор не знает, не изменит ли метод структуру. Чтобы ваш readonly не нарушился, он молча копирует её перед вызовом — на каждый вызов.</p>
<pre>struct Big { float a, b, c, d, e, f; public float Sum() => a + b + c; }
void M(in Big v) { var s = v.Sum(); }     <span class="cm">// скрытая копия 24 байт перед Sum()</span>

readonly struct Big2 { readonly float a, b, c, d, e, f; public float Sum() => a + b + c; }
void M2(in Big2 v) { var s = v.Sum(); }   <span class="cm">// копии нет: компилятор знает, что Sum не мутирует</span></pre>
<p>Правило: всё, что передаётся по <code>in</code> или лежит в readonly-полях и имеет методы, должно быть <code>readonly struct</code>. Именно так устроены типы <code>Unity.Mathematics</code>. Если делать структуру целиком readonly нельзя, можно пометить <code>readonly</code> отдельные члены.</p>
<h3>ref struct — только на стеке</h3>
<p><code>Span&lt;T&gt;</code> — классический пример. Он оборачивает кусок памяти (массив, stackalloc, нативный буфер), и если бы его можно было сохранить в поле класса, память могла бы умереть раньше ссылки. Поэтому ref struct нельзя: упаковать, сделать полем класса, захватить лямбдой, использовать через <code>await</code> и <code>yield</code>, положить в массив. Ограничения и есть гарантия.</p>
<pre>Span&lt;float&gt; tmp = stackalloc float[16];   <span class="cm">// стековая память, безопасно, потому что Span — ref struct</span></pre>
<h3>Когда какой</h3>
<p>Данные с value-семантикой (вектор, id, диапазон) — <code>readonly struct</code>. Представление чужой памяти без копирования (срезы буферов, парсеры, временные окна над NativeArray) — <code>ref struct</code>. Иногда оба сразу: <code>readonly ref struct</code>.</p>
<h3>Что сказать на собеседовании</h3>
<p>«readonly struct убирает защитные копии при передаче по in — это бесплатная производительность для математических типов. ref struct ограничен стеком, чтобы безопасно оборачивать временную память; Span — главный пример».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/struct" target="_blank">Microsoft: Structure types</a> <span>— readonly struct, ref struct, readonly-члены</span></li>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/write-safe-efficient-code" target="_blank">Microsoft: Write safe and efficient C# code</a> <span>— защитные копии разобраны на примерах</span></li>
</ul></div>`,

143: `<h3>Простыми словами</h3>
<p><code>stackalloc</code> — это «дай мне массив прямо в кадре стека». Он исчезает сам при выходе из метода, GC о нём не знает, аллокации нет. Для маленького временного буфера в горячем пути это идеальный инструмент — ровно до тех пор, пока вы помните, что стек маленький и не прощает ошибок.</p>
<h3>Современная форма — без unsafe</h3>
<pre>int CountHits(Vector3 origin)
{
    Span&lt;RaycastHit&gt; hits = stackalloc RaycastHit[8];   <span class="cm">// 8 * ~44 байта, на стеке</span>
    int n = Physics.RaycastNonAlloc(origin, Vector3.down, hits.ToArray()); <span class="cm">// (пример, в API нужен массив)</span>
    return n;
}

<span class="cm">// Парсинг без строки-копии</span>
Span&lt;char&gt; tmp = stackalloc char[32];
value.TryFormat(tmp, out int written);
label.SetCharArray(tmp.Slice(0, written));</pre>
<p>Присвоение в <code>Span&lt;T&gt;</code> делает stackalloc безопасным: Span — ref struct и не сможет пережить кадр стека (см. вопрос про ref struct).</p>
<h3>Правила безопасности</h3>
<p><b>Размер маленький и ограниченный.</b> Стек потока ~1 МБ (у воркеров меньше). Переполнение стека не ловится <code>try/catch</code> — процесс просто умирает. Длина, которая приходит извне (из пакета, из файла), в stackalloc попадать не должна.</p>
<p><b>Не возвращать и не хранить.</b> Span из stackalloc нельзя вернуть из метода — компилятор не даст; но указатель из unsafe-формы — даст, и это dangling pointer.</p>
<p><b>Не в рекурсии и не в цикле с большим телом.</b> Каждый вызов добавляет буфер к кадру; stackalloc в цикле внутри одного метода выделяет заново на каждой итерации без освобождения.</p>
<h3>Гибрид для переменных размеров</h3>
<pre>const int Threshold = 256;
T[] rented = null;
Span&lt;T&gt; buf = size &lt;= Threshold
    ? stackalloc T[size]
    : (rented = ArrayPool&lt;T&gt;.Shared.Rent(size));
try { Work(buf.Slice(0, size)); }
finally { if (rented != null) ArrayPool&lt;T&gt;.Shared.Return(rented); }</pre>
<h3>Что сказать на собеседовании</h3>
<p>«stackalloc — для маленьких временных буферов с известной верхней границей: хэширование, парсинг, сбор результатов запросов. Через Span он безопасен; размер извне — никогда; выше порога — ArrayPool».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/stackalloc" target="_blank">Microsoft: stackalloc expression</a> <span>— синтаксис, ограничения, примеры с Span</span></li>
</ul></div>`,

144: `<h3>Простыми словами</h3>
<p>Массив на 64 КБ, который нужен на один кадр, — худший клиент для GC: большой, короткоживущий, и таких много. <code>ArrayPool&lt;T&gt;</code> — склад таких массивов: взяли, поработали, вернули. Следующий запрос получит тот же массив без аллокации.</p>
<h3>Как это работает</h3>
<pre>byte[] buf = ArrayPool&lt;byte&gt;.Shared.Rent(1500);   <span class="cm">// вернёт массив >= 1500, например 2048</span>
try
{
    int n = socket.Receive(buf);                      <span class="cm">// работаем только с buf[0..n)</span>
    Parse(buf.AsSpan(0, n));
}
finally
{
    ArrayPool&lt;byte&gt;.Shared.Return(buf);              <span class="cm">// обязательно, иначе пул просто пуст</span>
}</pre>
<p>Пул хранит массивы по корзинам размеров (степени двойки). Выданный массив может быть <b>больше</b> запрошенного — поэтому длину всегда носите отдельно или работайте через <code>Span</code>/<code>Memory</code> среза.</p>
<h3>Когда брать из пула</h3>
<p>Временные буферы переменного размера: сборка и разбор сетевых пакетов, чтение файлов, staging вершин перед <code>Mesh.SetVertices</code>, черновики сериализации. Не для постоянных данных (им место в обычных полях) и не для буферов в 16 байт (там stackalloc).</p>
<h3>Ловушки</h3>
<p><b>Забыли Return.</b> Ничего не упадёт — пул просто аллоцирует заново при следующем Rent. Это тихая потеря выигрыша, которую находят только по GC.Alloc в профайлере.</p>
<p><b>Return при живой ссылке.</b> Кто-то ещё читает буфер, а его уже выдали другому — порча данных без исключений. Правило: вернул — забыл.</p>
<p><b>Старые данные.</b> Возвращённый массив не очищается; если в нём было что-то чувствительное или код полагается на нули — <code>Return(buf, clearArray: true)</code>.</p>
<h3>В Unity рядом</h3>
<p>Для данных джобов — <code>NativeArray</code> с <code>Allocator.Temp</code> (живёт один кадр, очень дёшево) или <code>TempJob</code> (до 4 кадров, с safety-проверками). И помните особенность Boehm GC: управляемая куча не отдаётся ОС, каждая избегнутая крупная аллокация — это навсегда меньший пик кучи.</p>
<h3>Что сказать на собеседовании</h3>
<p>«ArrayPool для временных буферов переменного размера: Rent в try, Return в finally, длину ношу отдельно. Для данных джобов — NativeArray с Temp-аллокатором. Главная ловушка — не краш, а тихая аллокация при забытом Return».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/api/system.buffers.arraypool-1" target="_blank">Microsoft: ArrayPool&lt;T&gt;</a> <span>— Shared, Create, семантика Rent/Return</span></li>
<li><a href="https://docs.unity3d.com/Packages/com.unity.collections@latest" target="_blank">Unity Collections</a> <span>— аллокаторы Temp, TempJob, Persistent</span></li>
</ul></div>`,

145: `<h3>Простыми словами</h3>
<p>В Java дженерики стираются: в рантайме <code>List&lt;Integer&gt;</code> и <code>List&lt;String&gt;</code> — один и тот же класс с Object внутри. В .NET дженерики <b>реифицированы</b>: <code>List&lt;int&gt;</code> и <code>List&lt;string&gt;</code> — разные типы, с полной информацией о <code>T</code>, и <code>List&lt;int&gt;</code> хранит int прямо в массиве, без boxing. За это платят размером кода.</p>
<h3>Специализация и разделение кода</h3>
<p>Для каждого <b>value type</b> аргумента рантайм генерирует отдельное нативное тело метода: <code>Sum&lt;int&gt;</code> и <code>Sum&lt;float&gt;</code> — разный машинный код, оптимальный для своего типа. Для всех <b>reference type</b> аргументов тело одно, общее: любая ссылка — это указатель одного размера, а конкретный тип приходит через скрытый аргумент (type handle).</p>
<pre>Sum&lt;int&gt;(a);      <span class="cm">// своя копия машинного кода</span>
Sum&lt;float&gt;(b);    <span class="cm">// ещё одна</span>
Sum&lt;Enemy&gt;(c);    <span class="cm">// общая с Sum&lt;Player&gt;, Sum&lt;string&gt;... + лёгкая косвенность</span></pre>
<h3>Модель стоимости</h3>
<p>Дженерики с value types — быстрые (без boxing, с инлайнингом), но умножают размер кода: каждая инстанциация — своё тело. Дженерики с reference types — компактные, но с небольшой косвенностью при обращении к статике или <code>typeof(T)</code>.</p>
<h3>Почему это важно под IL2CPP</h3>
<p>IL2CPP — AOT: JIT в рантайме нет, и каждая инстанциация с value type должна быть сгенерирована на этапе сборки. Раньше отсутствующая инстанциация (<code>List&lt;MyStruct&gt;</code>, созданный через рефлексию) бросала исключение на устройстве; generic sharing для value types это сильно смягчил. Второе следствие: тяжёлые дженерик-библиотеки (LINQ по десяткам типов, сериализаторы) раздувают IL2CPP-билд — тема вопроса про размер кода.</p>
<h3>Ловушки</h3>
<p><b>«Работает в редакторе».</b> Редактор — Mono с JIT, там любая инстанциация родится на лету. Проверяйте на устройстве.</p>
<p><b>Дженерик виртуальный метод.</b> <code>virtual void Do&lt;T&gt;()</code> — худшее сочетание для AOT: рантайм не может предсказать комбинации.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Дженерики реифицированы: value types получают специализированный код без boxing — поэтому List&lt;struct&gt; быстрее ArrayList; reference types делят одно тело. Под IL2CPP каждая value-type инстанциация должна существовать на момент сборки, и это же раздувает билд».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/generics" target="_blank">Microsoft: Generics</a> <span>— как они устроены в рантайме</span></li>
<li><a href="https://docs.unity3d.com/Manual/IL2CPP.html" target="_blank">Unity Manual: IL2CPP</a> <span>— AOT-ограничения и generic sharing</span></li>
</ul></div>`,

146: `<h3>Простыми словами</h3>
<p>Интерфейс — удобная абстракция, но вызов через интерфейсный тип у структуры стоит boxing, а у класса — косвенный вызов. Дженерик-ограничение даёт обе выгоды сразу: код написан в терминах интерфейса, а компилируется в прямой вызов конкретного метода структуры.</p>
<h3>Как это работает</h3>
<pre>interface IHandler { void Handle(int x); }
struct FastHandler : IHandler { public void Handle(int x) { /* ... */ } }

void Slow(IHandler h) { h.Handle(1); }           <span class="cm">// передали структуру -> boxing + интерфейсный вызов</span>

void Fast&lt;T&gt;(T h) where T : IHandler { h.Handle(1); }  <span class="cm">// constrained call</span>

Fast(new FastHandler());    <span class="cm">// для value type T: прямой вызов FastHandler.Handle, часто инлайн</span></pre>
<p>Компилятор эмитит <code>constrained. callvirt</code>. Для value type <code>T</code> рантайм биндит вызов напрямую на метод структуры — без упаковки; а поскольку для каждого value type генерируется отдельное тело (см. реификацию), метод может быть заинлайнен. Для reference type остаётся обычный виртуальный вызов.</p>
<h3>Где этот паттерн используют</h3>
<p>Инъекция стратегий: <code>Sort&lt;T, TComparer&gt;(...) where TComparer : struct, IComparer&lt;T&gt;</code> — компаратор-структура сравнивает на скорости прямого вызова. Кастомные абстракции джобов и систем в духе <code>Unity.Mathematics</code> и <code>Unity.Collections</code>. Событийные шины без аллокаций: обработчик — struct с ограничением.</p>
<h3>Другие полезные ограничения</h3>
<p><code>where T : unmanaged</code> — тип без ссылок; пропуск к указателям, <code>sizeof(T)</code>, <code>NativeArray&lt;T&gt;</code>. <code>where T : struct</code> / <code>class</code> — выбирает ветку специализации. <code>new()</code> — конструктор по умолчанию (но <code>new T()</code> внутри идёт через <code>Activator</code> — медленно, не в горячий путь). <code>notnull</code> — для nullable-анализа.</p>
<h3>Ловушки</h3>
<p>Если структура-обработчик мутирует своё состояние в <code>Handle</code>, а вы передали её по значению — изменится копия. Либо <code>ref T</code>, либо держите состояние снаружи.</p>
<h3>Что сказать на собеседовании</h3>
<p>«where T : IInterface со struct-реализациями даёт форму интерфейса на цене прямого вызова: constrained call без boxing, плюс инлайнинг благодаря специализации. Так я делаю компареры, стратегии и обработчики в горячих путях».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters" target="_blank">Microsoft: Constraints on type parameters</a> <span>— полный список ограничений</span></li>
</ul></div>`,

147: `<h3>Простыми словами</h3>
<p>Если каждый Cat — Animal, можно ли список котов отдать туда, где ждут список животных? Зависит от того, что с ним будут делать. Только читать — можно (ковариантность). Только писать — наоборот: обработчик животных сгодится там, где ждут обработчик котов (контравариантность). C# выражает это модификаторами <code>out</code> и <code>in</code> на параметрах типа.</p>
<h3>Ковариантность — out T</h3>
<pre>IEnumerable&lt;Cat&gt; cats = GetCats();
IEnumerable&lt;Animal&gt; animals = cats;     <span class="cm">// ок: из последовательности только читаем</span></pre>
<p><code>IEnumerable&lt;out T&gt;</code> отдаёт T наружу и никогда не принимает — поэтому подмена безопасна: всё, что вы достанете, точно Animal.</p>
<h3>Контравариантность — in T</h3>
<pre>IComparer&lt;Animal&gt; byWeight = new WeightComparer();
IComparer&lt;Cat&gt; catComparer = byWeight;  <span class="cm">// ок: компаратор животных умеет сравнить и котов</span>
Action&lt;Animal&gt; feed = a => a.Eat();
Action&lt;Cat&gt; feedCat = feed;             <span class="cm">// ок: функция, принимающая Animal, примет и Cat</span></pre>
<h3>Ограничения</h3>
<p>Вариантность есть только у интерфейсов и делегатов, и только для ссылочных типов. <code>IEnumerable&lt;int&gt;</code> — не <code>IEnumerable&lt;object&gt;</code>: int пришлось бы упаковывать, а это уже другое представление в памяти. <code>List&lt;T&gt;</code> инвариантен: он и читает, и пишет, подмена в любую сторону была бы небезопасна.</p>
<h3>Массивы — небезопасная ковариантность</h3>
<pre>Animal[] animals = new Cat[2];     <span class="cm">// компилируется (наследие Java-дизайна)</span>
animals[0] = new Dog();            <span class="cm">// ArrayTypeMismatchException в рантайме</span></pre>
<p>Чтобы это ловить, каждая запись в массив ссылочных типов делает проверку типа — ещё один довод геймплейного кода в пользу <code>List&lt;T&gt;</code>, точно типизированных массивов или массивов структур (у них проверки нет).</p>
<h3>Что сказать на собеседовании</h3>
<p>«out T — только на выходе, можно читать как базовый тип; in T — только на входе, обработчик базового подойдёт для производного. Только интерфейсы, делегаты и ссылочные типы. Массивы ковариантны небезопасно и платят проверкой на запись».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/standard/generics/covariance-and-contravariance" target="_blank">Microsoft: Covariance and contravariance in generics</a> <span>— с таблицей интерфейсов BCL</span></li>
</ul></div>`,

148: `<h3>Простыми словами</h3>
<p>Обычный вызов — прыжок по известному адресу. Виртуальный — сначала посмотреть, какого типа объект, найти в его таблице нужный метод и только потом прыгнуть. Это два лишних чтения памяти и ветвление, которое CPU должен угадать. На событии — ничто. На тысяче сущностей в кадре — заметно.</p>
<h3>Как устроено</h3>
<pre>animal.Speak();
<span class="cm">// 1. прочитать указатель на тип из заголовка объекта</span>
<span class="cm">// 2. прочитать адрес метода из vtable по фиксированному индексу</span>
<span class="cm">// 3. косвенный переход — инлайнинг невозможен</span>

handler.Handle();   <span class="cm">// интерфейсный вызов: ещё один уровень поиска (interface map)</span></pre>
<p>Косвенный переход мешает трём вещам: инлайнингу (компилятор не знает, что вызовет), предсказанию ветвлений (если в одной точке вызова встречаются разные типы — промахи), и префетчу (зависимая загрузка адреса).</p>
<h3>sealed и девиртуализация</h3>
<p><code>sealed</code> на классе (или на <code>override</code>) говорит: дальше переопределений нет. Если компилятор видит, что переменная точно этого типа, виртуальный вызов становится прямым и может быть заинлайнен. IL2CPP и современные JIT делают это, когда конкретный тип доказуем — локальная переменная после <code>new</code>, поле sealed-типа.</p>
<pre>sealed class Fireball : Projectile
{
    public override void Tick(float dt) { /* ... */ }
}
var f = new Fireball();
f.Tick(dt);        <span class="cm">// прямой вызов: тип известен, переопределений быть не может</span></pre>
<h3>Что делать в горячем пути</h3>
<p>Ориентир: виртуальный вызов нормален на событие, подозрителен на сущность-в-кадр. Альтернативы: <code>sealed</code>; структуры с дженерик-ограничениями (constrained call, см. соседний вопрос); делегат, закэшированный один раз; data-driven <code>switch</code> по enum-типу; и в пределе — ECS, где поведение выбирается системой, а не объектом.</p>
<h3>Ловушки</h3>
<p>Лепить <code>sealed</code> на всё карго-культом — бессмысленно и мешает тестам с моками. Сначала профайлер: если в кадре 50 виртуальных вызовов, проблема не в них.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Виртуальный вызов — косвенный переход через vtable: не инлайнится и может промахиваться в предсказателе. sealed делает тип терминальным и открывает девиртуализацию. В горячих циклах я предпочитаю структуры с ограничениями или data-driven switch, но решаю по профайлеру».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/sealed" target="_blank">Microsoft: sealed</a> <span>— семантика на классах и членах</span></li>
<li><a href="https://docs.unity3d.com/Manual/IL2CPP.html" target="_blank">Unity Manual: IL2CPP</a> <span>— где почитать про оптимизации AOT-генератора</span></li>
</ul></div>`,

149: `<h3>Простыми словами</h3>
<p>Абстрактный класс говорит «ты — один из нас»: общая реализация, общее состояние, одна цепочка наследования. Интерфейс говорит «ты умеешь это»: чистый контракт, сколько угодно на тип. В Unity выбор ещё жёстче, потому что единственный базовый слот у компонента уже занят <code>MonoBehaviour</code>.</p>
<h3>Что даёт каждый</h3>
<p><b>Абстрактный класс:</b> поля и protected-хелперы, конструкторы, template method (база делает каркас, наследник — шаги), версионирование — добавили виртуальный член с телом, наследники не сломались. Цена: одиночное наследование, жёсткая связь, тесты через моки сложнее.</p>
<p><b>Интерфейс:</b> несколько на тип, могут реализовывать структуры, идеальный шов для тестов и замены реализации. Цена: исторически без общего кода (default interface methods это частично изменили), интерфейсный вызов на структуре боксит без дженерик-ограничений, Unity не сериализует интерфейсные поля без <code>[SerializeReference]</code>.</p>
<h3>Практика в играх</h3>
<pre><span class="cm">// Способности — интерфейсы, находятся через TryGetComponent</span>
public interface IDamageable { void Take(DamageInfo info); }
public interface IInteractable { void Interact(Player by); }

if (hit.collider.TryGetComponent(out IDamageable target))
    target.Take(info);

<span class="cm">// Фреймворк с общим каркасом — абстрактный класс</span>
public abstract class WeaponBase : MonoBehaviour
{
    [SerializeField] protected float cooldown;
    float nextShot;
    public void TryFire() { if (Time.time &lt; nextShot) return; nextShot = Time.time + cooldown; Fire(); }
    protected abstract void Fire();          <span class="cm">// наследник реализует только это</span>
}</pre>
<h3>Правило выбора</h3>
<p>Описываете <i>роль</i> (что объект умеет для других систем) — интерфейс. Описываете <i>семейство</i> с общим кодом и состоянием — абстрактный класс. Сомневаетесь — интерфейс: его всегда можно дополнить базовым классом-помощником, а наоборот не выйдет.</p>
<h3>Ловушки</h3>
<p>Глубокие иерархии оружия/врагов с пятью уровнями абстрактных классов — классический долг: каждое исключение из правила требует нового уровня. Композиция компонентов плюс интерфейсы масштабируется лучше (см. вопрос о композиции).</p>
<h3>Что сказать на собеседовании</h3>
<p>«Интерфейсы — для способностей и швов тестирования, абстрактные классы — для каркасов с общим состоянием. В Unity базовый слот занят MonoBehaviour, поэтому по умолчанию интерфейс, а абстрактная база — только там, где есть настоящий общий код».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces" target="_blank">Microsoft: Interfaces</a> <span>— контракт и правила реализации</span></li>
<li><a href="https://docs.unity3d.com/ScriptReference/SerializeReference.html" target="_blank">Unity: SerializeReference</a> <span>— как сериализовать поля интерфейсного типа</span></li>
</ul></div>`,

150: `<h3>Простыми словами</h3>
<p>Явная реализация прячет член интерфейса: его нет на конкретном типе, он виден только через интерфейсную ссылку. Это полезно для чистоты API и опасно для структур, потому что «через интерфейсную ссылку» для структуры означает «через boxing».</p>
<h3>Как выглядит</h3>
<pre>struct Counter : IResettable
{
    public int Value;
    void IResettable.Reset() => Value = 0;    <span class="cm">// явная: Counter.Reset() не существует</span>
}

var c = new Counter { Value = 5 };
((IResettable)c).Reset();      <span class="cm">// 1) boxing — аллокация; 2) Reset применился к КОПИИ в коробке</span>
c.Value;                       <span class="cm">// всё ещё 5</span></pre>
<p>Две беды одновременно: тихая аллокация на каждом вызове и мутация, которая уходит в упакованную копию, а не в вашу переменную.</p>
<h3>Зачем явная реализация нужна</h3>
<p>Разрешить коллизию имён, когда два интерфейса объявляют одинаковый член. Спрятать инфраструктуру: <code>IEnumerable.GetEnumerator()</code> у fluent API, чтобы не мусорить автодополнение. Дать «худшую» общую перегрузку рядом с лучшей типизированной: у <code>List&lt;T&gt;</code> не-дженерик <code>IEnumerable.GetEnumerator()</code> явный и возвращает object-энумератор, а публичный — быструю структуру.</p>
<h3>Почему foreach по List не боксит</h3>
<p><code>List&lt;T&gt;.Enumerator</code> — публичная структура с публичными <code>MoveNext</code>/<code>Current</code>. <code>foreach</code> работает по паттерну, а не по интерфейсу: он зовёт <code>GetEnumerator()</code> у конкретного типа, получает структуру и вызывает её члены напрямую. Как только список передан как <code>IEnumerable&lt;T&gt;</code>, foreach идёт через интерфейс — и энумератор упаковывается. Отсюда правило: в горячих путях принимайте <code>List&lt;T&gt;</code>, а не <code>IEnumerable&lt;T&gt;</code>.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Явная реализация скрывает член за интерфейсом; у структуры это значит boxing при каждом вызове и мутацию копии. Поэтому у структур мутирующие члены — публичные, а явную реализацию я оставляю для коллизий имён и скрытия инфраструктуры».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/interfaces/explicit-interface-implementation" target="_blank">Microsoft: Explicit interface implementation</a> <span>— когда и зачем</span></li>
</ul></div>`,

151: `<h3>Простыми словами</h3>
<p>До C# 8 интерфейс был чистым списком подписей: добавили метод — сломали все реализации. Реализации по умолчанию позволяют добавить метод с телом: старые реализации продолжают компилироваться, новые могут переопределить. Это инструмент эволюции API, а не способ писать базовые классы.</p>
<pre>public interface ILogger
{
    void Log(string message);
    <span class="cm">// Добавили позже — старые реализации не сломались</span>
    void LogWarning(string message) => Log("[warn] " + message);
}

class ConsoleLogger : ILogger { public void Log(string m) => Console.WriteLine(m); }

ILogger l = new ConsoleLogger();
l.LogWarning("x");                 <span class="cm">// ок: через интерфейсный тип</span>
new ConsoleLogger().LogWarning("x"); <span class="cm">// ошибка: у класса этого члена нет</span></pre>
<h3>Ограничения</h3>
<p><b>Только через интерфейс.</b> Дефолтный член не становится публичным членом класса.</p>
<p><b>Без состояния.</b> Полей в интерфейсе нет, поэтому «трейты» бесстатусны: только вычисления из других членов.</p>
<p><b>Структуры боксят.</b> Вызов дефолтной реализации у структуры идёт через интерфейсную ссылку — аллокация и мутация копии (см. явную реализацию).</p>
<p><b>Ромб.</b> Два интерфейса дали дефолт одному методу — класс обязан выбрать явно, иначе ошибка компиляции.</p>
<p><b>Нужен рантайм.</b> Требует поддержки рантайма (.NET Core 3+); в Unity работает на современных версиях, но на старом scripting runtime — нет.</p>
<h3>Где им место в игре</h3>
<p>Публичный API плагина или общей библиотеки студии, который должен расти, не ломая потребителей. Маленькие бесстатусные удобства (<code>DebugName</code> из других свойств). Не место: геймплейная иерархия, где хочется общего состояния — это абстрактный класс или композиция.</p>
<h3>Что сказать на собеседовании</h3>
<p>«DIM — это версионирование интерфейсов: добавить член, не ломая реализации. Без состояния, видим только через интерфейс, у структур боксит. Использую экономно, в геймплее почти не нужен».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/interface-implementation/default-interface-methods-versions" target="_blank">Microsoft: Default interface methods</a> <span>— сценарий версионирования по шагам</span></li>
</ul></div>`,

152: `<h3>Простыми словами</h3>
<p><code>record</code> — тип, который компилятор достраивает за вас: сравнение по значению, <code>GetHashCode</code>, читаемый <code>ToString</code>, деконструкция и <code>with</code> — «такой же, но с другим полем». Это идеальная форма для данных, которые описывают факт, а не объект со временем жизни.</p>
<pre>public record SaveSlot(string Name, int Level, DateTime SavedAt);

var s1 = new SaveSlot("hero", 3, now);
var s2 = s1 with { Level = 4 };         <span class="cm">// новый объект, s1 не изменился</span>
s1 == new SaveSlot("hero", 3, now);     <span class="cm">// true: сравнение по полям</span>

public readonly record struct Damage(float Amount, DamageType Type);  <span class="cm">// value type без аллокаций</span></pre>
<h3>Где им место</h3>
<p>Иммутабельные конфиги и DTO, сетевые сообщения, модели сейвов, полезная нагрузка событий, ключи словарей (равенство уже есть). Везде, где value-семантика и дешёвые копии упрощают рассуждение о коде.</p>
<h3>Где осторожно</h3>
<p><b>record class аллоцирует на каждом with.</b> На частоте событий — нормально; в Update на тысячу сущностей — мусор. Там <code>record struct</code> или обычная структура.</p>
<p><b>Сгенерированное равенство сравнивает все поля.</b> Для большого record это дорого, а float-поля делают равенство условным: два «одинаковых» результата вычислений могут не совпасть.</p>
<p><b>Сериализация Unity.</b> Она работает с полями, а record с позиционным синтаксисом — это init-only свойства. В инспекторных типах records почти не встречаются; для них — обычный <code>[Serializable]</code> класс или структура.</p>
<p><b>Наследование records.</b> Возможно, но равенство учитывает тип — производный record не равен базовому с теми же полями.</p>
<h3>Доступность</h3>
<p><code>record</code> — C# 9 (Unity 2021.2+), <code>record struct</code> — C# 10 (включается через LangVersion, это чисто компиляторная фича).</p>
<h3>Что сказать на собеседовании</h3>
<p>«Records — для фактов: конфиги, сообщения, события, ключи. Равенство и with бесплатно по коду, но record class платит аллокацией за with, а сериализация Unity их не любит — поэтому в инспекторе их нет, а в горячем пути — record struct».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/record" target="_blank">Microsoft: Records</a> <span>— семантика равенства, with, наследование</span></li>
</ul></div>`,

153: `<h3>Простыми словами</h3>
<p>Есть две разные вещи: версия <b>компилятора</b> (какой синтаксис понимает) и версия <b>рантайма</b> (какие API и механизмы существуют во время выполнения). Unity обновляет компилятор быстрее, чем рантайм, и граница между ними — главное, что нужно понимать.</p>
<h3>Где Unity сейчас</h3>
<p>Официальный уровень языка — C# 9 (с Unity 2021.2; Unity 6 — тоже). Рантайм — Mono/IL2CPP с профилем API, эквивалентным .NET Standard 2.1. Экосистема .NET тем временем на .NET 8+, и многое новое просто отсутствует.</p>
<h3>Что компиляторное (можно включить), а что рантаймовое (нельзя)</h3>
<pre><span class="cm">// Чисто компиляторные фичи C# 10/11 — работают через LangVersion в csc.rsp:</span>
record struct, global using, file-scoped namespace, list patterns (частично), required members

<span class="cm">// Требуют рантайма — не работают, пока Unity не переедет на CoreCLR:</span>
Span-перегрузки новых API BCL, source-gen System.Text.Json, статические абстрактные члены интерфейсов,
новые перф-примитивы (Vector128 и т.п.), Native AOT-специфика</pre>
<p>Правило проверки: если фича — это только новый синтаксис, который компилятор разворачивает в старый IL, её можно бэкпортировать. Если ей нужны новые типы или новое поведение рантайма — нет. Иногда граница тонкая: <code>init</code>-сеттеры нужен атрибут <code>IsExternalInit</code>, которого в старом BCL нет, но его можно объявить самому в проекте.</p>
<h3>Что это значит на практике</h3>
<p>Библиотеки с NuGet проверяйте по target framework (<code>netstandard2.1</code> — ок, <code>net6.0+</code> — нет). Код, который «работает в редакторе», ещё раз проверяйте под IL2CPP: там AOT-ограничения (см. дженерики и рефлексию). И следите за переездом Unity на CoreCLR — это снимет большинство ограничений, но потребует миграции.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Unity 6 — C# 9 на рантайме уровня .NET Standard 2.1. Компиляторные фичи выше можно включить через LangVersion, рантаймовые — нет, пока не придёт CoreCLR. Я проверяю NuGet-пакеты по target framework и тестирую под IL2CPP».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/CSharpCompiler.html" target="_blank">Unity Manual: C# compiler</a> <span>— поддерживаемая версия языка и csc.rsp</span></li>
<li><a href="https://docs.unity3d.com/Manual/dotnetProfileSupport.html" target="_blank">Unity Manual: .NET profile support</a> <span>— что входит в профиль рантайма</span></li>
</ul></div>`,

154: `<h3>Простыми словами</h3>
<p>Pattern matching — это не «красивый if». Это способ записать условие так, чтобы на ревью было видно намерение и полноту: какие случаи обработаны, а какие нет. Компилируется в те же ветвления и jump-таблицы, что и ручной код, — без аллокаций и без цены.</p>
<h3>Четыре приёма, которые реально используют</h3>
<pre><span class="cm">// 1. Type pattern — вместо is + каст</span>
if (hit.collider.GetComponent&lt;IDamageable&gt;() is { } target)
    target.Take(info);

<span class="cm">// 2. Property pattern — декларативный guard</span>
if (state is { Health: &lt;= 0, IsInvulnerable: false })
    Die();

<span class="cm">// 3. Relational + switch-выражение — диапазоны</span>
var anim = speed switch
{
    &lt; 0.1f => Clip.Idle,
    &lt; 2f   => Clip.Walk,
    _      => Clip.Run,
};

<span class="cm">// 4. Позиционный паттерн по кортежу — таблица переходов стейт-машины</span>
var next = (current, input) switch
{
    (State.Idle, Input.Jump)    => State.Jump,
    (State.Idle, Input.Move)    => State.Walk,
    (State.Jump, Input.Land)    => State.Idle,
    (var s, _)                  => s,            <span class="cm">// явный «остаёмся» — исчерпываемость видна</span>
};</pre>
<h3>Что это даёт команде</h3>
<p>Switch-выражение обязано вернуть значение, поэтому компилятор предупреждает о необработанных случаях — таблица переходов становится проверяемой. Property patterns убирают каскад <code>&amp;&amp;</code>, который на ревью никто не читает. Type patterns убирают двойной <code>GetComponent</code> (один раз в <code>is</code>, второй — для каста).</p>
<h3>Ловушки</h3>
<p><b>Паттерн на структуре через интерфейс</b> боксит так же, как обычный каст — pattern matching здесь не спасает.</p>
<p><b>Слишком умный switch.</b> Шесть вложенных property-паттернов хуже, чем две функции с именами. Если паттерн нельзя прочитать вслух — разбейте.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Паттерны — про читаемость и исчерпываемость, а не про скорость: компилируются в те же ветвления. Главное применение у меня — таблицы переходов стейт-машин через позиционный switch и декларативные guard-условия».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/functional/pattern-matching" target="_blank">Microsoft: Pattern matching</a> <span>— все виды паттернов на примерах</span></li>
</ul></div>`,

155: `<h3>Простыми словами</h3>
<p>Nullable reference types — это не новый тип в рантайме, а статический анализ: компилятор следит, где ссылка может быть null, и предупреждает, когда вы её разыменовываете без проверки. В обычном .NET это убирает целый класс NRE. В Unity анализ спотыкается о две вещи: сериализацию и «фейковый null».</p>
<h3>Трение номер один: сериализуемые поля</h3>
<pre>#nullable enable
public class Player : MonoBehaviour
{
    [SerializeField] Rigidbody body;    <span class="cm">// предупреждение: не инициализировано в конструкторе</span>
    [SerializeField] Rigidbody body2 = null!;  <span class="cm">// «доверься мне» — обычное решение</span>
}</pre>
<p>Поля заполняет движок после конструктора; компилятор этого не знает и выдаёт шторм предупреждений. Их гасят <code>= null!</code>, подавлением на уровне файла или атрибутами анализатора.</p>
<h3>Трение номер два: фейковый null</h3>
<p>Уничтоженный <code>UnityEngine.Object</code> — это живая managed-ссылка, у которой перегруженный <code>==</code> возвращает true при сравнении с null. Для компилятора ссылка non-null, для игры — мёртвая. Хуже: <code>?.</code> и <code>??</code> работают с настоящей ссылкой и обходят перегрузку — <code>target?.transform</code> на уничтоженном объекте бросит MissingReferenceException, хотя NRT обещал безопасность.</p>
<h3>Как команды всё же применяют</h3>
<p>Включать NRT по сборкам, а не глобально: в чисто-C# asmdef (логика, модели, сетевые сообщения, парсеры) он честно убирает NRE. В сборках с MonoBehaviour — выключен или ослаблен до warnings. И анализатором (Microsoft.Unity.Analyzers, правило UNT0007/UNT0008) запрещать <code>?.</code> и <code>??</code> на типах, наследующих <code>UnityEngine.Object</code>.</p>
<h3>Что сказать на собеседовании</h3>
<p>«NRT — статика, рантайм не меняется. В Unity два конфликта: поля, которые заполняет движок, и фейковый null, который null-conditional обходит. Поэтому включаю NRT в чистых сборках, в движковых — нет, и анализатором запрещаю ?. на Unity-объектах».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/nullable-references" target="_blank">Microsoft: Nullable reference types</a> <span>— как работает анализ и аннотации</span></li>
<li><a href="https://github.com/microsoft/Microsoft.Unity.Analyzers" target="_blank">Microsoft.Unity.Analyzers</a> <span>— правила про null-conditional на Unity-объектах</span></li>
</ul></div>`,

156: `<h3>Простыми словами</h3>
<p><code>int?</code> — это сахар для <code>Nullable&lt;int&gt;</code>: обычная структура из двух полей, <code>bool hasValue</code> и <code>int value</code>. Кучи она не касается. Но рантайм относится к ней по-особому при boxing, и это стоит знать, потому что поведение неочевидно.</p>
<h3>Внутри</h3>
<pre>struct Nullable&lt;T&gt; where T : struct
{
    readonly bool hasValue;
    readonly T value;
    public bool HasValue => hasValue;
    public T Value => hasValue ? value : throw new InvalidOperationException();
    public T GetValueOrDefault() => value;     <span class="cm">// без проверки — быстрее Value</span>
}</pre>
<p>Размер: <code>int?</code> — 8 байт (4 + 1 + паддинг), <code>double?</code> — 16. В массиве на миллион элементов это заметно.</p>
<h3>Boxing: особые правила</h3>
<pre>int? a = null;
object o1 = a;        <span class="cm">// настоящий null, не коробка с HasValue=false</span>

int? b = 5;
object o2 = b;        <span class="cm">// упакован сам int, а не Nullable&lt;int&gt;</span>
o2.GetType();         <span class="cm">// System.Int32</span>
int x = (int)o2;      <span class="cm">// ок</span>
int? y = (int?)o2;    <span class="cm">// тоже ок — распаковка в nullable разрешена</span></pre>
<p>Рантайм намеренно «сплющивает» nullable при упаковке: в коробке никогда не лежит сама обёртка. Это то, почему <code>is int</code> на <code>object</code>, в который положили <code>int?</code>, возвращает true.</p>
<h3>В игровом коде</h3>
<p>В горячих структурах <code>float?</code> на сущность — плохая идея: ломает layout, добавляет ветвление на каждое чтение и удваивает размер. Лучше сентинел (<code>float.NaN</code>, <code>-1</code>), отдельная битовая маска «поле задано» или перестройка данных. На частоте событий и в API, где «нет значения» — осмысленное состояние, nullable уместен: он честнее сентинела.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Nullable&lt;T&gt; — структура bool + T, без кучи, но крупнее. При boxing null-nullable становится настоящим null, а с значением упаковывается сам T. В горячих данных предпочитаю сентинел или маску, в API — nullable для ясности».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-value-types" target="_blank">Microsoft: Nullable value types</a> <span>— семантика, включая boxing</span></li>
</ul></div>`,

157: `<h3>Простыми словами</h3>
<p>Перегрузка операторов нужна ровно для одного: чтобы математика читалась как математика. <code>a + b * t</code> для векторов — хорошо. <code>player + weapon</code> — плохо, потому что никто не угадает, что это значит. У Unity есть и образцовые перегрузки, и одна знаменитая неожиданная.</p>
<h3>Как это делают математические типы</h3>
<pre>public static Vector3 operator +(Vector3 a, Vector3 b) => new(a.x + b.x, a.y + b.y, a.z + b.z);
public static Vector3 operator *(Vector3 a, float d)   => new(a.x * d, a.y * d, a.z * d);
public static Vector3 operator *(float d, Vector3 a)   => a * d;     <span class="cm">// обе стороны</span>
public static Vector3 operator *(Quaternion q, Vector3 v) { /* поворот */ } <span class="cm">// конвенция: «применить поворот»</span></pre>
<p>Операторы — статические методы (<code>op_Addition</code> и т.д.), разрешаются на компиляции, полиморфизма нет. Они чистые и не аллоцируют: возвращают новую структуру, не трогая операнды.</p>
<h3>Неожиданная перегрузка: == у UnityEngine.Object</h3>
<p><code>obj == null</code> возвращает true для уничтоженного объекта, хотя managed-ссылка жива. Это удобно и одновременно источник багов: <code>?.</code>, <code>??</code> и <code>ReferenceEquals</code> перегрузку обходят. Пример того, что перегрузка с неочевидной семантикой — долг навсегда.</p>
<h3>Правила дизайна</h3>
<p>Перегружать только когда операция математически ожидаема. Всегда парами: <code>==</code> с <code>!=</code> (и с <code>Equals</code>/<code>GetHashCode</code>), <code>&lt;</code> с <code>&gt;</code>. Давать именованную альтернативу (<code>Add</code>), если тип используют из других языков. Не делать неявных преобразований с потерей данных: неявное <code>Vector3 → Vector2</code> в Unity молча теряет Z и регулярно бьёт по разрешению перегрузок. Конвенции вроде «quaternion * vector = поворот» документировать: по сигнатуре их не угадать.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Операторы — для математических типов: чистые, парные, без аллокаций, со статическим разрешением. Неявные преобразования с потерей информации не делаю. Перегрузка == у Unity-объектов — пример, почему неожиданная семантика оператора дорого обходится».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/operator-overloading" target="_blank">Microsoft: Operator overloading</a> <span>— какие операторы и как</span></li>
<li><a href="https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/operator-overloads" target="_blank">Microsoft: Operator overload guidelines</a> <span>— правила дизайна</span></li>
</ul></div>`,

158: `<h3>Простыми словами</h3>
<p>Три способа спросить «это T?»: <code>(T)x</code> — «точно T, иначе исключение», <code>x as T</code> — «T или null», <code>x is T</code> — «да/нет». Все три делают одну и ту же проверку типа в рантайме — прогулку по иерархии и картам интерфейсов. Дёшево, но не бесплатно, если это в цикле по тысяче разнородных объектов каждый кадр.</p>
<h3>Эволюция идиомы</h3>
<pre><span class="cm">// Старое: две проверки типа</span>
if (x is Enemy) { var e = (Enemy)x; e.Hit(); }

<span class="cm">// Лучше: одна проверка, но null-проверка отдельно</span>
var e = x as Enemy; if (e != null) e.Hit();

<span class="cm">// Современное: одна проверка, переменная в области видимости условия</span>
if (x is Enemy e) e.Hit();</pre>
<p><code>as</code> работает только с ссылочными и nullable-типами. Для структур — <code>is T t</code>.</p>
<h3>Распаковка — тоже каст</h3>
<pre>object o = 5;
long l = (long)o;     <span class="cm">// InvalidCastException: в коробке int, не long</span>
long ok = (int)o;     <span class="cm">// распаковать как int, потом расширить</span></pre>
<p>Unboxing требует точного совпадения value type (с оговоркой про nullable и enum к базовому типу).</p>
<h3>Ответ уровня дизайна</h3>
<p>Если в геймплейном цикле много проверок типов — не хватает абстракции. Варианты: интерфейсная диспетчеризация (<code>IDamageable</code>), раздельные типизированные списки вместо одного <code>List&lt;Entity&gt;</code>, реестр по типам, или enum-тег на структуре с <code>switch</code>. Оптимизировать сами касты — последнее, что стоит делать.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Каст бросает, as возвращает null, is проверяет; все три — рантайм-проверка иерархии. Пишу is T t. Если проверок типов много в кадре — это сигнал пересмотреть модель, а не ускорять касты».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/type-testing-and-cast" target="_blank">Microsoft: Type-testing operators and cast</a> <span>— is, as, typeof, касты</span></li>
</ul></div>`,

159: `<h3>Простыми словами</h3>
<p>Enum — это число с именами. Все его сюрпризы растут из этого факта: в него можно положить любое число, его имена живут только в метаданных, а флаги — просто биты в этом числе.</p>
<h3>Базовый тип и размер</h3>
<pre>enum Team : byte { None, Red, Blue }          <span class="cm">// 1 байт вместо 4 — в горячих структурах и пакетах это важно</span>

[Flags] enum Damage { None = 0, Fire = 1, Ice = 2, Shock = 4, All = Fire | Ice | Shock }
bool burns = (d &amp; Damage.Fire) != 0;          <span class="cm">// проверка без аллокаций</span>
d |= Damage.Ice;  d &amp;= ~Damage.Fire;         <span class="cm">// добавить, убрать</span></pre>
<p>В <code>[Flags]</code> значения — явные степени двойки; атрибут только меняет <code>ToString</code> и документирует намерение, битовую арифметику он не включает.</p>
<h3>История HasFlag</h3>
<p><code>d.HasFlag(Damage.Fire)</code> исторически боксил оба операнда — две аллокации на проверку. В современных рантаймах JIT это оптимизирует, но в Unity (Mono/IL2CPP разных версий) гарантии нет. Ручная маска быстрее и без аллокаций везде — это по-прежнему дефолт игрового кода.</p>
<h3>Валидация</h3>
<pre>var t = (Team)200;                 <span class="cm">// легально! никакой проверки</span>
Enum.IsDefined(typeof(Team), t);   <span class="cm">// false — но медленно и аллоцирует</span>
bool valid = (byte)t &lt;= (byte)Team.Blue;   <span class="cm">// для плотных enum — проверка диапазона</span></pre>
<p>Всё, что приходит извне (сейвы, сеть, конфиги), проверяйте. <code>Enum.IsDefined</code> идёт через рефлексию — кэшируйте набор допустимых значений или используйте диапазон.</p>
<h3>Ещё две ловушки</h3>
<p><b>ToString/Parse</b> — рефлексия и аллокации; для UI кэшируйте имена в словаре один раз. <b>Порядок членов в сериализованных данных</b> — Unity хранит числовое значение: вставили член в середину — все сохранённые значения сдвинулись. Задавайте значения явно и только добавляйте в конец.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Enum — число: кастуется без валидации, флаги проверяю маской, а не HasFlag, ToString кэширую, базовый тип ужимаю для горячих структур и пакетов, значения задаю явно и никогда не переставляю — Unity сериализует число».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/enum" target="_blank">Microsoft: Enumeration types</a> <span>— базовые типы, Flags, преобразования</span></li>
</ul></div>`,

160: `<h3>Простыми словами</h3>
<p>Extension-метод — статический метод, который вызывается как метод экземпляра. Это синтаксис, не магия: компилятор переписывает <code>v.WithY(0)</code> в <code>Ext.WithY(v, 0)</code>. Именно поэтому у них есть правила разрешения, о которых стоит знать.</p>
<h3>Правила разрешения</h3>
<p>Сначала настоящие методы экземпляра. Расширение берётся, только если ничего подходящего не нашлось. Отсюда ловушка версионирования: вы написали <code>transform.Reset()</code> как расширение, Unity в следующей версии добавила <code>Transform.Reset()</code> — все точки вызова молча переключились на другую реализацию, без единого предупреждения.</p>
<pre>public static class TransformExt
{
    public static void DestroyChildren(this Transform t)
    {
        for (int i = t.childCount - 1; i >= 0; i--) Object.Destroy(t.GetChild(i).gameObject);
    }
}
public static class VectorExt
{
    public static Vector3 WithY(this Vector3 v, float y) => new(v.x, y, v.z);
}</pre>
<h3>null-получатель</h3>
<p><code>this T self</code> может быть null — расширение вызовется и не упадёт. Это позволяет guard-хелперы (<code>go.SafeDestroy()</code>), но при злоупотреблении прячет NRE: код выглядит как вызов метода у живого объекта, а объект мёртв.</p>
<h3>Хорошие применения в игре</h3>
<p>Fluent-хелперы над типами, которые нельзя менять: Transform, Vector3, Color, Rect. LINQ-подобные операторы над своими контейнерами без аллокаций. Адаптеры читаемости над сгенерированными типами (протобуф, сетевые сообщения).</p>
<h3>Границы</h3>
<p>Состояния у расширений нет — не имитируйте его статическими словарями или <code>ConditionalWeakTable</code> в геймплее: это скрытый глобальный стейт. Сотни расширений в одном неймспейсе засоряют автодополнение; раскладывайте по неймспейсам, чтобы потребитель подключал осознанно. И расширения на <code>object</code> — почти всегда ошибка.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Расширения — статика с сахаром: метод экземпляра всегда побеждает, добавление его позже молча перехватывает вызовы. Использую для хелперов над чужими типами, не для состояния, и раскладываю по неймспейсам».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/extension-methods" target="_blank">Microsoft: Extension methods</a> <span>— правила привязки и рекомендации</span></li>
</ul></div>`,

161: `<h3>Простыми словами</h3>
<p>Разрешение перегрузок происходит на компиляции по статическим типам аргументов. Большинство сюрпризов — это ситуации, когда компилятор выбрал не то, что вы имели в виду, и ничего не сказал.</p>
<h3>Шесть сюрпризов</h3>
<p><b>1. params object[] ловит всё.</b> <code>Debug.Log("hp " + hp)</code> ещё ладно, но <code>string.Format("{0} {1}", a, b)</code> с value types — аллокация массива плюс boxing каждого аргумента. В горячем пути — типизированные перегрузки или StringBuilder.</p>
<p><b>2. Опциональные аргументы запекаются в точку вызова.</b></p>
<pre><span class="cm">// Библиотека v1</span>
public void Spawn(int count = 1) { }
<span class="cm">// Вызов скомпилирован как Spawn(1). В v2 дефолт стал 2 — старые вызовы всё ещё передают 1,</span>
<span class="cm">// пока их не перекомпилируют. Для плагинов и DLL это ловушка бинарной совместимости.</span></pre>
<p><b>3. Новая перегрузка перенаправляет старые вызовы.</b> Был <code>Log(object)</code>, добавили <code>Log(long)</code> — все вызовы с int теперь идут в long-версию (неявное расширение предпочтительнее boxing).</p>
<p><b>4. null неоднозначен.</b> <code>F(string)</code> и <code>F(Texture)</code>: <code>F(null)</code> не компилируется, нужен каст.</p>
<p><b>5. Пользовательские неявные преобразования участвуют.</b> Unity имеет implicit <code>Vector2 ↔ Vector3</code>; при перегрузках <code>Move(Vector2)</code> и <code>Move(Vector3)</code> неожиданный выбор или потеря Z — реальность.</p>
<p><b>6. Метод экземпляра бьёт расширение,</b> даже если расширение подходит лучше по типам.</p>
<h3>Защитные привычки</h3>
<p>Не смешивать опциональные аргументы с набором перегрузок — выбрать одно. Числовые наборы перегрузок держать полными (int, long, float, double), чтобы не было неявных расширений в неожиданную ветку. Публичные дефолты считать неизменяемыми после релиза. Для API, которое вызывают из других сборок, предпочитать перегрузки опциональным параметрам.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Главные сюрпризы: params object[] боксит, дефолты запекаются в вызывающий код, новая перегрузка перехватывает старые вызовы, неявные преобразования Unity участвуют в выборе. Поэтому в публичном API я не смешиваю опциональные аргументы и перегрузки».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/named-and-optional-arguments" target="_blank">Microsoft: Named and optional arguments</a> <span>— и раздел про разрешение перегрузок</span></li>
</ul></div>`,

162: `<h3>Простыми словами</h3>
<p><code>dynamic</code> говорит компилятору: «не проверяй, разберёмся в рантайме». Каждое обращение к члену превращается в вызов через DLR с построением и опросом кэша call-site. Игры покупают скорость и предсказуемость ценой гибкости; dynamic продаёт ровно наоборот.</p>
<h3>Что происходит под капотом</h3>
<pre>dynamic d = GetThing();
d.Update(dt);
<span class="cm">// компилируется примерно в:</span>
<span class="cm">// if (site == null) site = CallSite&lt;...&gt;.Create(Binder.InvokeMember("Update", ...));</span>
<span class="cm">// site.Target(site, d, dt);   — поиск по типу, аллокации, на порядки дороже прямого вызова</span></pre>
<h3>Почему в Unity это ещё хуже</h3>
<p>IL2CPP — AOT: генерировать код в рантайме он не может, а DLR именно это и делает. Код с dynamic компилируется в редакторе и падает на iOS, консолях и WebGL. Даже под Mono вы теряете IntelliSense, рефакторинг и весь слой ошибок компилятора — то есть всё, за что мы выбрали статический язык.</p>
<h3>Что вместо</h3>
<p>Известная форма — интерфейс. Статический полиморфизм без boxing — дженерики с ограничениями. По-настоящему динамический контент (моды, скрипты дизайнеров) — встроенный скриптовый слой (Lua через MoonSharp/xLua) или data-driven интерпретация: и то и другое песочнично, AOT-безопасно и контролируемо. Интероп с COM, ради которого dynamic появился, в играх не встречается.</p>
<h3>Что сказать на собеседовании</h3>
<p>«dynamic — это DLR-вызовы с кэшами и аллокациями, а под IL2CPP ещё и падение на AOT. Он меняет все гарантии компиляции на рантайм-цену. Для динамики в играх — интерфейсы, дженерики или отдельный скриптовый слой».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/interop/using-type-dynamic" target="_blank">Microsoft: Using type dynamic</a> <span>— что он делает и как разрешается</span></li>
<li><a href="https://docs.unity3d.com/Manual/ScriptingRestrictions.html" target="_blank">Unity Manual: Scripting restrictions</a> <span>— ограничения AOT-платформ</span></li>
</ul></div>`,

163: `<h3>Простыми словами</h3>
<p>Рефлексия — это поиск членов типа по строкам и вызов через универсальный <code>Invoke</code>. Поиск — обходы словарей со сравнением строк. Вызов — упаковка аргументов в <code>object[]</code>, проверки и диспетчеризация. Итог: в сотни раз медленнее прямого вызова. Для инициализации — приемлемо. Для кадра — никогда.</p>
<h3>Что стоит сколько</h3>
<pre>var m = obj.GetType().GetMethod("Tick");       <span class="cm">// поиск: строки, словари — дорого</span>
m.Invoke(obj, new object[] { dt });            <span class="cm">// boxing dt + массив + проверки — очень дорого</span>
Activator.CreateInstance(type);                <span class="cm">// то же самое для конструктора</span></pre>
<h3>Лестница смягчения</h3>
<p><b>1. Кэшировать MemberInfo.</b> Поиск один раз при старте, хранить в словаре по типу.</p>
<p><b>2. Конвертировать в типизированный делегат.</b></p>
<pre>var tick = (Action&lt;Entity, float&gt;)Delegate.CreateDelegate(typeof(Action&lt;Entity, float&gt;), m);
tick(obj, dt);     <span class="cm">// после разовой настройки — почти прямой вызов, без boxing</span></pre>
<p><b>3. Expression.Compile</b> — для доступа к свойствам на JIT-платформах; под IL2CPP компиляции выражений нет, этот путь закрыт.</p>
<p><b>4. Source generators.</b> Современный ответ: код привязки генерируется на компиляции, рефлексии в рантайме нет вовсе. Так работают актуальные сериализаторы (MemoryPack, MessagePack с генератором) и DI-контейнеры (VContainer).</p>
<h3>Стриппинг</h3>
<p>Члены, которые используются только через рефлексию, для линкера выглядят мёртвыми и вырезаются из IL2CPP-билда. Работает в редакторе, падает на устройстве с <code>MissingMethodException</code>. Согласуйте: <code>[Preserve]</code> на членах или <code>link.xml</code> на сборках.</p>
<h3>Где рефлексии место</h3>
<p>Редакторные инструменты, разовая инициализация, тесты, генерация кода. Не в Update, не в обработчиках событий на высокой частоте.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Поиск по строкам и Invoke с boxing — сотни раз медленнее прямого вызова. Кэширую MemberInfo, конвертирую в делегаты, а там, где можно, заменяю source generators. И помню про стриппинг: рефлексия без Preserve ломается только на устройстве».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/ManagedCodeStripping.html" target="_blank">Unity Manual: Managed code stripping</a> <span>— link.xml и Preserve</span></li>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/roslyn-sdk/source-generators-overview" target="_blank">Microsoft: Source generators</a> <span>— замена рефлексии на компиляции</span></li>
</ul></div>`,

164: `<h3>Простыми словами</h3>
<p>Атрибут — это класс-метка, прикреплённый к типу, члену или параметру. Сам по себе он ничего не делает и ничего не стоит: экземпляр создаётся лениво, когда кто-то запросит его через рефлексию. «Кто-то» в Unity — движок и редактор, которые читают атрибуты постоянно.</p>
<h3>Атрибуты, которые обязан знать сеньор</h3>
<pre><span class="cm">// Сериализация</span>
[SerializeField] float speed;             <span class="cm">// приватное поле в инспектор и в префаб</span>
[SerializeReference] IAbility ability;    <span class="cm">// полиморфная ссылка по значению</span>
[NonSerialized] int runtimeCache;         <span class="cm">// публичное поле, но не сохранять</span>

<span class="cm">// Поведение компонента</span>
[RequireComponent(typeof(Rigidbody))]
[DisallowMultipleComponent]
[DefaultExecutionOrder(-100)]             <span class="cm">// порядок без правки Project Settings</span>
[ExecuteAlways]                           <span class="cm">// Update и в редакторе</span>

<span class="cm">// Бутстрап без сцены</span>
[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
static void ResetStatics() { /* ключ к корректности при выключенном domain reload */ }

<span class="cm">// Сборка</span>
[Preserve]                                <span class="cm">// не вырезать стриппингом</span>
[Conditional("UNITY_EDITOR")] static void DebugDraw() { } <span class="cm">// вызовы исчезают из билда</span>
[BurstCompile] struct Job : IJob { }
[MethodImpl(MethodImplOptions.AggressiveInlining)]</pre>
<p>Плюс инспекторные: <code>[Range]</code>, <code>[Tooltip]</code>, <code>[HideInInspector]</code>, <code>[Header]</code> и свои атрибуты с <code>PropertyDrawer</code> — дешёвый способ сделать UX дизайнерам.</p>
<h3>Свои атрибуты как правила команды</h3>
<p><code>[MustBeAssigned]</code> на поле плюс редакторная валидация при сборке — и пустая ссылка в префабе ловится до QA. <code>[HotPath]</code> плюс Roslyn-анализатор, запрещающий аллокации внутри, — правило, которое проверяется, а не обсуждается на ревью.</p>
<h3>Ловушки</h3>
<p>Атрибуты читаются рефлексией, поэтому <code>GetCustomAttributes</code> в Update — то же, что любая рефлексия в кадре. И <code>[RuntimeInitializeOnLoadMethod]</code> с неправильным типом загрузки срабатывает позже, чем вы думаете: для сброса статики нужен <code>SubsystemRegistration</code>.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Атрибуты — метаданные, которые читает движок: сериализация, порядок выполнения, бутстрап через RuntimeInitializeOnLoadMethod, стриппинг через Preserve, кодогенерация через BurstCompile. Свои атрибуты с валидацией — способ закодировать правила команды».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/ScriptReference/RuntimeInitializeOnLoadMethodAttribute.html" target="_blank">Unity: RuntimeInitializeOnLoadMethod</a> <span>— типы загрузки и порядок</span></li>
<li><a href="https://docs.unity3d.com/Manual/script-Serialization.html" target="_blank">Unity Manual: Script serialization</a> <span>— что и как сериализуется</span></li>
</ul></div>`,

165: `<h3>Простыми словами</h3>
<p>Делегат — объект из двух полей: ссылка на цель (или null для статики) и указатель на метод. Multicast — делегат, который держит список таких пар и вызывает их по очереди. Главное о цене: вызов дёшев, а вот <code>+=</code> и <code>-=</code> — нет.</p>
<h3>Что делает +=</h3>
<pre>OnHit += HandleA;    <span class="cm">// новый делегат-объект со списком [A]</span>
OnHit += HandleB;    <span class="cm">// ещё один объект со списком [A, B]; старый — мусор</span>
OnHit -= HandleA;    <span class="cm">// ещё один со списком [B]</span></pre>
<p>Invocation list иммутабелен: каждое изменение копирует список в новый объект. Системы с интенсивной подпиской/отпиской (подписка в OnEnable у сотен объектов за кадр) — это интенсивные аллокации.</p>
<h3>Сколько стоит вызов</h3>
<p>Один подписчик — один косвенный вызов, примерно как интерфейсный. N подписчиков — цикл по списку, N косвенных вызовов. Это нормально на событии и подозрительно на сущность-в-кадр (см. виртуальную диспетчеризацию).</p>
<h3>Острые углы</h3>
<p><b>Возвращаемое значение</b> — только от последнего в списке; остальные теряются. Для событий с результатом — <code>void</code> плюс аккумулятор в аргументе.</p>
<p><b>Исключение у подписчика N</b> останавливает N+1 и дальше. Для изоляции — обход <code>GetInvocationList()</code> с try/catch на каждом, но он аллоцирует массив — кэшируйте.</p>
<p><b>Сильная ссылка на цель.</b> Делегат держит объект-цель; издатель, живущий дольше подписчика, не даёт его собрать. Утечка номер один в managed-коде.</p>
<h3>В горячих путях</h3>
<p>Делегат создаётся один раз в поле при инициализации, а не в точке вызова (<code>list.ForEach(Handle)</code> аллоцирует делегат из method group на каждый вызов). И для одиночной цели с известной структурой — дженерик-ограничение вместо делегата.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Делегат — цель плюс метод; multicast — иммутабельный список, поэтому += аллоцирует. Вызов — косвенный на подписчика. Помню, что остаётся только последний результат, исключение рвёт цепочку, а цель держится сильно».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/delegates/how-to-combine-delegates-multicast-delegates" target="_blank">Microsoft: Multicast delegates</a> <span>— семантика комбинирования</span></li>
</ul></div>`,

166: `<h3>Простыми словами</h3>
<p><code>event</code> — это делегат с ограничением: извне доступны только <code>+=</code> и <code>-=</code>. Нельзя вызвать, нельзя перезаписать, нельзя обнулить. В этом его единственный смысл по сравнению с публичным полем-делегатом.</p>
<h3>Что генерирует компилятор</h3>
<pre>public event Action&lt;int&gt; ScoreChanged;
<span class="cm">// превращается в:</span>
private Action&lt;int&gt; scoreChanged;                   <span class="cm">// приватное поле</span>
public void add_ScoreChanged(Action&lt;int&gt; h)         <span class="cm">// потокобезопасно, через CompareExchange</span>
{ /* loop: Interlocked.CompareExchange(ref scoreChanged, old + h, old) */ }
public void remove_ScoreChanged(Action&lt;int&gt; h) { /* аналогично с минусом */ }</pre>
<h3>Анатомия утечки</h3>
<p>Издатель живёт дольше подписчика. Список издателя держит подписчика сильной ссылкой, GC не может его забрать. В Unity классика: статическое событие или <code>DontDestroyOnLoad</code>-сервис, на который подписались MonoBehaviour из сцены. Сцена выгрузилась, объекты уничтожены, но их managed-обёртки живут в списке: занимают память, а при следующем вызове кидают MissingReferenceException — на «фейково-null» объекте.</p>
<h3>Как проектировать без утечек</h3>
<p><b>Симметрия как закон:</b> подписка в <code>OnEnable</code>, отписка в <code>OnDisable</code>. Не Awake/OnDestroy — отключённый объект не должен получать события.</p>
<p><b>Скоуп владельца:</b> хелпер, который подписывает и запоминает отписку, а при уничтожении владельца снимает всё сразу (стиль R3/UniRx <code>AddTo(this)</code>).</p>
<p><b>Teardown издателя:</b> событие экземпляра обнулять в его Dispose/OnDestroy, чтобы ни один забытый подписчик не остался.</p>
<p><b>Глобальные шины:</b> токены времени жизни или слабые подписки, если подписчики — объекты сцены.</p>
<h3>Вызов</h3>
<pre>var handler = ScoreChanged;   <span class="cm">// локальная копия: между проверкой и вызовом список не поменяется</span>
handler?.Invoke(score);</pre>
<h3>Что сказать на собеседовании</h3>
<p>«event — приватный делегат с add/remove на CompareExchange; снаружи только подписка. Утечка — издатель переживает подписчика. Правило: OnEnable/OnDisable симметрично, подписки со скоупом владельца, обнуление при teardown».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/events/" target="_blank">Microsoft: Events</a> <span>— аксессоры и правила публикации</span></li>
</ul></div>`,

167: `<h3>Простыми словами</h3>
<p><code>Func</code>, <code>Action</code>, <code>Predicate</code> — обычные дженерик-делегаты. Аллоцируют не они, а момент их создания: лямбда с захватом, method group в точке вызова. Хороший callback-API спроектирован так, чтобы вызывающий мог не захватывать.</p>
<h3>Что аллоцирует</h3>
<pre>list.ForEach(Handle);                    <span class="cm">// method group → новый делегат на каждый вызов</span>
list.Find(e => e.Id == targetId);        <span class="cm">// захват targetId → замыкание + делегат</span>
list.Find(static e => e.Dead);           <span class="cm">// без захвата → компилятор кэширует в статике, 0 аллокаций</span>
                                         <span class="cm">// static-лямбда (C# 9) запрещает захват на компиляции</span></pre>
<h3>Паттерн со state</h3>
<p>Чтобы горячий коллбэк не захватывал, API принимает состояние отдельным параметром и передаёт его в коллбэк:</p>
<pre>public void Register&lt;TState&gt;(Action&lt;TState&gt; callback, TState state);

registry.Register(static (self) => self.OnTick(), this);   <span class="cm">// статическая лямбда, состояние явно</span></pre>
<p>Так устроены <code>ThreadPool.QueueUserWorkItem(callback, state)</code> и <code>CancellationToken.Register(callback, state)</code>. Делегат кэшируется компилятором, состояние едет рядом — ни замыкания, ни аллокации.</p>
<h3>Компареры и стратегии</h3>
<p>Там, где коллбэк — это «способ сравнить» или «правило», ещё лучше struct с дженерик-ограничением: <code>Sort&lt;TComp&gt;(TComp comparer) where TComp : struct, IComparer&lt;T&gt;</code> — без делегата вообще, с инлайнингом.</p>
<h3>Где можно расслабиться</h3>
<p>Одноразовые коллбэки на частоте событий — нажатие кнопки, окончание загрузки — могут аллоцировать спокойно. Дисциплина нужна в том, что вызывается каждый кадр или на каждую сущность.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Аллоцирует создание делегата с захватом, не его тип. Горячие API принимают state отдельно, чтобы вызывающий писал статическую лямбду; стратегии — struct с ограничением. На частоте событий захват — не грех».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/lambda-expressions" target="_blank">Microsoft: Lambda expressions</a> <span>— захват, static-лямбды</span></li>
</ul></div>`,

168: `<h3>Простыми словами</h3>
<p><code>foreach</code> — это не вызов <code>IEnumerable</code>. Компилятор работает по шаблону: ищет у <b>статического типа</b> переменной метод <code>GetEnumerator()</code>, у результата — <code>MoveNext()</code> и <code>Current</code>. Интерфейс берётся, только если шаблона нет. Отсюда всё поведение с аллокациями.</p>
<h3>Три случая</h3>
<pre>List&lt;Enemy&gt; list = ...;
foreach (var e in list) { }              <span class="cm">// List&lt;T&gt;.Enumerator — struct, вызывается напрямую: 0 аллокаций</span>

IEnumerable&lt;Enemy&gt; seq = list;
foreach (var e in seq) { }               <span class="cm">// через интерфейс: struct-энумератор упакован — аллокация на каждый цикл</span>

Enemy[] arr = ...;
foreach (var e in arr) { }               <span class="cm">// массив — особый случай: разворачивается в for по индексу</span></pre>
<h3>Что это значит для API</h3>
<p>Параметр типа <code>IEnumerable&lt;T&gt;</code> в методе, вызываемом каждый кадр, — это аллокация при каждом обходе, даже если внутрь передают List. Для горячих путей принимайте конкретный тип (<code>List&lt;T&gt;</code>, <code>T[]</code>, <code>ReadOnlySpan&lt;T&gt;</code>) или <code>IReadOnlyList&lt;T&gt;</code> с индексным циклом.</p>
<h3>Фольклор «никогда не foreach»</h3>
<p>Старые компиляторы Mono в Unity боксили энумератор List даже при прямом обходе. Это давно исправлено, но правило «только for» живёт в кодовых гайдах до сих пор. Современная формулировка: foreach по конкретным коллекциям свободно; осторожность — с переменными интерфейсного типа в покадровом коде; и помнить, что итераторы на <code>yield</code> всегда аллоцируют свою стейт-машину.</p>
<h3>Ловушка изменения</h3>
<p>Struct-энумератор List проверяет версию коллекции: <code>Remove</code> внутри foreach — InvalidOperationException. Удалять — обратным for по индексу или <code>RemoveAll</code>.</p>
<h3>Что сказать на собеседовании</h3>
<p>«foreach идёт по шаблону GetEnumerator у статического типа: List напрямую — без аллокаций, тот же List через IEnumerable — boxing энумератора. Поэтому горячие API принимают конкретные типы, а “никогда не foreach” — наследие старого Mono».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/iteration-statements#the-foreach-statement" target="_blank">Microsoft: foreach statement</a> <span>— шаблон, который ищет компилятор</span></li>
</ul></div>`,

169: `<h3>Простыми словами</h3>
<p>Метод с <code>yield return</code> не выполняется как обычный. Компилятор переписывает его в класс-стейт-машину: локальные переменные становятся полями, каждая точка <code>yield</code> — номером состояния, а <code>MoveNext()</code> — большим <code>switch</code>, который продолжает выполнение с нужного места. Корутины Unity — ровно это.</p>
<h3>Что генерирует компилятор</h3>
<pre>IEnumerator&lt;int&gt; Count(int n)
{
    for (int i = 0; i &lt; n; i++) yield return i;
}
<span class="cm">// превращается примерно в:</span>
sealed class CountStateMachine : IEnumerator&lt;int&gt;, IEnumerable&lt;int&gt;
{
    int state; int current; int n; int i;        <span class="cm">// локальные стали полями</span>
    public bool MoveNext()
    {
        switch (state)
        {
            case 0: i = 0; goto check;
            case 1: i++; goto check;
        }
        check: if (i &lt; n) { current = i; state = 1; return true; }
        state = -1; return false;
    }
}</pre>
<p>Вызов <code>Count(5)</code> — это аллокация одного объекта стейт-машины. Код до первого <code>yield</code> не выполняется при вызове — только при первом <code>MoveNext</code>.</p>
<h3>Три следствия</h3>
<p><b>Отложенная валидация.</b> <code>ArgumentException</code> вылетит не при вызове, а при первом обходе. Паттерн двух методов: публичный метод проверяет аргументы жадно и возвращает приватный итератор.</p>
<p><b>Аллокация на создание.</b> Итератор, создаваемый каждый кадр, — мусор. Корутина с <code>StartCoroutine</code> в Update — это и есть этот мусор.</p>
<p><b>finally выполняется в Dispose.</b> <code>foreach</code> гарантирует Dispose. Но корутина, остановленная через <code>StopCoroutine</code> или уничтожение объекта, своё <code>finally</code> не выполняет никогда — корень багов «очистка не случилась».</p>
<h3>Оптимизация</h3>
<p>Один объект служит и <code>IEnumerable</code>, и первым <code>IEnumerator</code> для вызывающего потока; второй обход создаёт новый. Поэтому «одноразовый» итератор дешевле, чем кажется.</p>
<h3>Что сказать на собеседовании</h3>
<p>«yield — стейт-машина: локальные в полях, switch по состояниям в MoveNext, аллокация на создание, код до первого yield откладывается, finally — только через Dispose. Корутины Unity унаследовали всё это, включая невыполненный finally при остановке».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/iterators" target="_blank">Microsoft: Iterators</a> <span>— семантика yield</span></li>
<li><a href="https://sharplab.io/" target="_blank">SharpLab</a> <span>— вставьте итератор и посмотрите сгенерированный класс</span></li>
</ul></div>`,

170: `<h3>Простыми словами</h3>
<p>LINQ-запрос — это рецепт, а не результат. <code>Where</code> и <code>Select</code> ничего не считают; они строят цепочку, которая выполнится при перечислении — и выполнится заново при каждом перечислении. Все баги отложенного выполнения — это удивление «я же уже это посчитал».</p>
<h3>Три режима отказа</h3>
<pre><span class="cm">// 1. Множественное перечисление</span>
var visible = enemies.Where(e => IsVisible(e));   <span class="cm">// рейкаст внутри</span>
if (visible.Any()) Aim(visible.First());         <span class="cm">// Where выполнился дважды, рейкасты — дважды</span>
label.text = visible.Count().ToString();         <span class="cm">// и третий раз</span>

<span class="cm">// 2. Захват меняющегося значения</span>
int threshold = 10;
var strong = enemies.Where(e => e.Hp > threshold);
threshold = 50;
foreach (var e in strong) { }                    <span class="cm">// фильтр по 50, не по 10: предикат читает текущее значение</span>

<span class="cm">// 3. Запрос над изменённой коллекцией</span>
var dead = enemies.Where(e => e.Hp &lt;= 0);
foreach (var e in dead) enemies.Remove(e);      <span class="cm">// InvalidOperationException: коллекция изменена</span></pre>
<h3>Обратная сторона: несвежий снимок</h3>
<p><code>ToList()</code> в неудачном месте замораживает данные, которые нужны были живыми: кэшировали список целей на старте, а новые враги в него уже не попадут.</p>
<h3>Привычки сеньора</h3>
<p>Из API возвращать <code>IReadOnlyList&lt;T&gt;</code>, когда данные уже материализованы, — сырой <code>IEnumerable&lt;T&gt;</code> заставляет получателя гадать. Материализовать осознанно на границах: один <code>ToList()</code> и дальше работать со списком. Любой параметр <code>IEnumerable</code> считать однопроходным, пока не доказано обратное. Анализатор на множественное перечисление (есть в Rider и в Roslyn-пакетах) включить в CI.</p>
<h3>Что сказать на собеседовании</h3>
<p>«LINQ ленивый: цепочка выполняется при каждом перечислении, предикаты читают текущие значения захваченных переменных, запрос над изменяемой коллекцией падает. Материализую один раз на границе и возвращаю IReadOnlyList вместо IEnumerable».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/linq/get-started/introduction-to-linq-queries#deferred-execution" target="_blank">Microsoft: Deferred execution in LINQ</a> <span>— официальное описание семантики</span></li>
</ul></div>`,

171: `<h3>Простыми словами</h3>
<p>LINQ — отличный инструмент для кода, который выполняется редко, и плохой — для кода, который выполняется каждый кадр. Причина одна: почти каждый оператор аллоцирует, а аллокации в Update превращаются в спайки GC. Это делает LINQ не злом, а скальпелем для холодных путей.</p>
<h3>Что именно стоит</h3>
<p>Стейт-машина итератора на каждый оператор, замыкание на каждую лямбду с захватом, результат <code>ToList</code>/<code>ToArray</code>, внутренние буферы <code>OrderBy</code>/<code>GroupBy</code>/<code>Distinct</code>. Плюс интерфейсные вызовы на каждый элемент в цепочке, которые не инлайнятся. Один <code>Where().First()</code> на сущность — и к концу кадра десятки килобайт мусора.</p>
<h3>Паттерны замены</h3>
<pre><span class="cm">// Было</span>
var target = enemies.Where(e => e.Alive &amp;&amp; InRange(e)).OrderBy(e => Dist(e)).FirstOrDefault();

<span class="cm">// Стало: один проход, 0 аллокаций</span>
Enemy best = null; float bestD = float.MaxValue;
for (int i = 0; i &lt; enemies.Count; i++)
{
    var e = enemies[i];
    if (!e.Alive) continue;
    float d = Dist(e);
    if (d &lt; range &amp;&amp; d &lt; bestD) { best = e; bestD = d; }
}

<span class="cm">// NonAlloc-паттерн: результаты в переданный список</span>
void GetEnemiesInRange(Vector3 pos, float r, List&lt;Enemy&gt; results);   <span class="cm">// как Physics.OverlapSphereNonAlloc</span></pre>
<p>Поддерживаемые индексы вместо повторных фильтров: живой список активных врагов, который обновляется при спавне и смерти, вместо <code>Where(e => e.Alive)</code> каждый кадр. Для переиспользуемой фильтрации — свой struct-итератор с <code>GetEnumerator</code>, который foreach подхватит без аллокаций.</p>
<h3>Политика команды</h3>
<p>Анализатор запрещает <code>System.Linq</code> в сборках с покадровым кодом и разрешает везде ещё: инициализация, редакторные инструменты, пошаговая логика, отладка. Правило проверяется на CI, а не обсуждается на ревью.</p>
<h3>Что сказать на собеседовании</h3>
<p>«LINQ аллоцирует почти на каждом операторе — это инструмент холодных путей. В горячих — for по списку, NonAlloc с переданным буфером, поддерживаемые индексы. У нас запрет анализатором по сборкам, а не “никогда”».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/performance-garbage-collection-best-practices.html" target="_blank">Unity Manual: GC best practices</a> <span>— раздел про LINQ и аллокации</span></li>
</ul></div>`,

172: `<h3>Простыми словами</h3>
<p><code>List&lt;T&gt;</code> — это массив плюс счётчик. Всё его поведение вытекает из этого: добавление в конец дёшево, пока есть место; рост — новый массив вдвое больше и копирование; вставка в середину — сдвиг хвоста.</p>
<h3>Рост</h3>
<pre>var list = new List&lt;int&gt;();      <span class="cm">// Capacity 0</span>
list.Add(1);                     <span class="cm">// массив на 4</span>
<span class="cm">// ... 5-й элемент: массив на 8, 9-й: на 16 — каждый рост = аллокация + копия + старый массив в мусор</span>

var list2 = new List&lt;int&gt;(1024); <span class="cm">// одна аллокация на всё время жизни</span></pre>
<p>В Unity с некомпактирующим Boehm GC брошенные массивы роста фрагментируют кучу навсегда. Поэтому: когда масштаб известен, <b>всегда</b> задавайте начальную ёмкость.</p>
<h3>Вставка и удаление</h3>
<p><code>Insert</code>/<code>RemoveAt</code> в середине — сдвиг всех элементов после позиции, O(n). Для неупорядоченных списков — swap-remove: последний элемент на место удаляемого, потом убрать хвост, O(1):</p>
<pre>list[i] = list[list.Count - 1];
list.RemoveAt(list.Count - 1);</pre>
<p>Удаление во время прямой итерации пропускает элементы (индексы сдвинулись) или бросает (в foreach). Итерируйте назад или используйте <code>RemoveAll</code> — он делает один проход и один сдвиг.</p>
<h3>Clear и время жизни</h3>
<p><code>Clear()</code> сохраняет ёмкость — хорошо для покадрового переиспользования. Но ссылки в буфере остаются живыми до перезаписи: объект, который должен был умереть, держится списком. Когда время жизни важно — обнуляйте или используйте <code>TrimExcess</code> осознанно.</p>
<h3>Итерация</h3>
<p>Индексация с проверкой границ; JIT убирает проверку в каноническом <code>for (int i = 0; i &lt; list.Count; i++)</code>, если <code>list</code> — локальная переменная. foreach по List — struct-энумератор без аллокаций (см. соседний вопрос).</p>
<h3>Что сказать на собеседовании</h3>
<p>«List — массив со счётчиком: рост удваивает и аллоцирует, поэтому задаю ёмкость; удаление из середины — O(n), для неупорядоченных — swap-remove; Clear держит ёмкость, но и ссылки».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1" target="_blank">Microsoft: List&lt;T&gt;</a> <span>— Capacity, семантика операций</span></li>
</ul></div>`,

173: `<h3>Простыми словами</h3>
<p>Словарь — это два массива. <code>buckets</code> — индексы по хэшу, <code>entries</code> — сами записи с полем <code>next</code> для цепочки коллизий. Поиск: хэш → корзина → пройти цепочку, сравнивая ключи. При хорошем хэше цепочки короткие и это O(1); при плохом — длинные, и это O(n).</p>
<h3>Структура</h3>
<pre>int[] buckets;                  <span class="cm">// buckets[hash % size] = индекс первой записи в цепочке</span>
struct Entry { int hashCode; int next; TKey key; TValue value; }
Entry[] entries;

<span class="cm">// TryGetValue:</span>
<span class="cm">// h = comparer.GetHashCode(key); i = buckets[h % buckets.Length];</span>
<span class="cm">// while (i >= 0) { if (entries[i].hashCode == h &amp;&amp; comparer.Equals(entries[i].key, key)) return; i = entries[i].next; }</span></pre>
<h3>Ресайз</h3>
<p>Когда записи закончились, оба массива аллоцируются заново под следующий простой размер и всё перехэшируется — O(n)-спайк плюс два массива в мусор. Передавайте ожидаемую ёмкость в конструктор: <code>new Dictionary&lt;int, Enemy&gt;(512)</code>.</p>
<h3>Удаление и порядок</h3>
<p><code>Remove</code> помечает запись в free list — память не возвращается, слот переиспользуется следующим <code>Add</code>. Порядок обхода — порядок массива entries с учётом переиспользованных слотов: после удалений он произвольный. Никогда на него не полагайтесь — это классический баг кросс-платформенного детерминизма (реплеи, lockstep). Когда порядок важен — параллельный List или <code>SortedDictionary</code>.</p>
<h3>Идиомы</h3>
<p><code>TryGetValue</code> — один хэш; <code>ContainsKey</code> + индексатор — два. <code>TryAdd</code> вместо <code>ContainsKey</code> + <code>Add</code>. <code>GetValueOrDefault</code> для чтения с дефолтом. Качество <code>GetHashCode</code> ключа — главное, что определяет скорость.</p>
<h3>Что сказать на собеседовании</h3>
<p>«buckets + entries с цепочками; ресайз аллоцирует и перехэширует — задаю ёмкость; порядок обхода не определён, особенно после удалений; TryGetValue вместо двойного хэширования».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2" target="_blank">Microsoft: Dictionary&lt;TKey,TValue&gt;</a> <span>— семантика и замечания о порядке</span></li>
</ul></div>`,

174: `<h3>Простыми словами</h3>
<p>Сначала назовите паттерн доступа, потом структуру. «Итерирую каждый кадр» и «ищу по id» — разные ответы. Шпаргалка ниже — это соответствие паттерна и контейнера.</p>
<h3>Шпаргалка</h3>
<p><b>Array / List&lt;T&gt;</b> — дефолт для данных, которые обходят: непрерывная память, cache-friendly. Массив для фиксированного размера, List для роста. Поиск в них — O(n), и <code>list.Contains</code> в цикле — самая частая скрытая квадратичность.</p>
<p><b>Dictionary</b> — когда поиски по ключу преобладают над обходом. Обход медленнее массива и без порядка.</p>
<p><b>HashSet</b> — проверка принадлежности и дедупликация. «Этот враг уже обработан?» — HashSet, не List.</p>
<p><b>Queue / Stack</b> — FIFO для событий и команд, LIFO для undo и стека состояний. Внутри кольцевые буферы, операции без аллокаций.</p>
<p><b>LinkedList</b> — почти никогда: каждый узел — отдельный объект, прыжки по указателям убивают кэш. Только когда у вас уже есть узел и нужно часто удалять из середины.</p>
<p><b>SortedList vs SortedDictionary</b> — SortedList (два массива, бинарный поиск) для «построил раз, читаешь много»; SortedDictionary (дерево) для постоянных вставок и удалений.</p>
<h3>Игровая специфика</h3>
<p>Пулы объектов — <code>Stack&lt;T&gt;</code>. Массивы структур вместо списков классов, когда данные обрабатываются батчем. <code>NativeArray</code>/<code>NativeList</code>/<code>NativeHashMap</code>, когда данные трогают джобы и Burst. Для «список активных» — поддерживаемый список с swap-remove, а не фильтр по всем сущностям.</p>
<pre><span class="cm">// Типичный выбор для системы врагов</span>
List&lt;Enemy&gt; active;                   <span class="cm">// обход каждый кадр</span>
Dictionary&lt;int, Enemy&gt; byNetId;       <span class="cm">// поиск по сетевому id</span>
HashSet&lt;int&gt; damagedThisFrame;        <span class="cm">// дедупликация урона</span>
Queue&lt;SpawnRequest&gt; spawnQueue;       <span class="cm">// отложенный спавн</span></pre>
<h3>Что сказать на собеседовании</h3>
<p>«Сначала паттерн доступа: обход — массив или List, поиск — Dictionary, принадлежность — HashSet, очередь — Queue. LinkedList почти никогда. Для джобов — Native-контейнеры».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/standard/collections/selecting-a-collection-class" target="_blank">Microsoft: Selecting a collection class</a> <span>— официальная таблица выбора</span></li>
<li><a href="https://docs.unity3d.com/Packages/com.unity.collections@latest" target="_blank">Unity Collections</a> <span>— Native-контейнеры для джобов</span></li>
</ul></div>`,

175: `<h3>Простыми словами</h3>
<p>Есть три способа хранить сетку: массив массивов (<code>T[][]</code>), многомерный массив (<code>T[,]</code>) и плоский массив с ручной индексацией (<code>T[]</code>). Интуиция говорит, что многомерный — самый «правильный». Бенчмарки говорят иначе.</p>
<h3>Три варианта</h3>
<pre>int[][] jagged = new int[h][];           <span class="cm">// h+1 аллокаций, строки могут быть разной длины</span>
for (int y = 0; y &lt; h; y++) jagged[y] = new int[w];
jagged[y][x] = 1;                        <span class="cm">// два разыменования, но каждое — простая 1D-индексация</span>

int[,] multi = new int[h, w];            <span class="cm">// одна аллокация</span>
multi[y, x] = 1;                         <span class="cm">// на многих рантаймах — через хелпер, проверки границ труднее убрать</span>

int[] flat = new int[h * w];             <span class="cm">// одна аллокация, идеальная локальность</span>
flat[y * w + x] = 1;                     <span class="cm">// одна индексация, JIT оптимизирует</span></pre>
<p>Jagged в бенчмарках обычно обгоняет многомерный — контринтуитивно, но так устроены рантаймы. Плоский массив обгоняет обоих и для сеток в горячем коде — лучший ответ.</p>
<h3>Устранение проверок границ</h3>
<p>Каждое обращение к массиву проверяет индекс. JIT убирает проверку, когда может доказать, что индекс в пределах — в каноническом цикле:</p>
<pre>for (int i = 0; i &lt; arr.Length; i++) sum += arr[i];    <span class="cm">// проверка убрана: Length поднята в условие</span>

for (int i = 0; i &lt; count; i++) sum += arr[i];         <span class="cm">// count — поле или параметр: проверка остаётся</span>
for (int i = 0; i &lt; list.Count; i++) sum += list[i];   <span class="cm">// Count — свойство; работает для локального List, не для поля</span></pre>
<p>Паттерн ломают: вызов метода в условии, обратный обход, индекс с арифметикой (<code>arr[i + 1]</code>), массив в поле класса (JIT не уверен, что его не заменят). Burst с <code>NativeArray</code> делает этот анализ агрессивнее и умеет векторизовать.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Для сеток — плоский массив с y * width + x: одна аллокация, локальность, простая индексация. Jagged быстрее многомерного на практике. Проверки границ JIT убирает в каноническом for по Length локального массива».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/arrays" target="_blank">Microsoft: Arrays</a> <span>— jagged и многомерные</span></li>
</ul></div>`,

176: `<h3>Простыми словами</h3>
<p><code>try</code> бесплатен: современные рантаймы реализуют его таблицами, и пока ничего не брошено, цена нулевая. Дорог <b>бросок</b>: аллокация объекта, снятие stack trace (главная цена), раскрутка стека, вычисление фильтров. Поэтому правило не «избегай try», а «исключения — для исключительного».</p>
<h3>Где исключениям не место</h3>
<p>Ожидаемые исходы: «ключа нет», «строка не число», «цели нет в радиусе». Для этого есть <code>Try</code>-паттерн — <code>TryParse</code>, <code>TryGetValue</code>, <code>TryGetComponent</code>. Покадровый код: один бросок в Update — это микросекунды плюс аллокация, сто — заметный спайк. Control flow между системами: исключение как «сигнал о состоянии» делает код непредсказуемым.</p>
<h3>Игровая специфика</h3>
<p>Непойманное исключение в Update <b>не роняет Unity</b>. Остальные коллбэки кадра выполняются, объект остаётся полуобновлённым, и порча состояния всплывает далеко от причины. Поэтому границы catch-log-recover вокруг подсистем (сеть, сейвы, UI-биндинги) оправданы: система падает изолированно и с логом, а не тащит кадр.</p>
<pre>try { sync.Apply(packet); }
catch (Exception e) when (LogAndContinue(e))  <span class="cm">// фильтр: логируем, но не ловим — stack trace цел</span>
{ }

<span class="cm">// Проброс</span>
catch (IOException) { throw; }       <span class="cm">// сохраняет stack trace</span>
catch (IOException ex) { throw ex; } <span class="cm">// обрезает его до этой строки — не делайте так</span></pre>
<p>Фильтры <code>when</code> позволяют логировать и пробрасывать, не разрушая stack trace — деталь, которую любят интервьюеры. IL2CPP-билды могут собираться с урезанной поддержкой исключений ради размера; на таких платформах бросок ещё дороже.</p>
<h3>Что сказать на собеседовании</h3>
<p>«try бесплатен, бросок дорог из-за stack trace. Исключения — для исключительного, не для ожидаемых исходов и не покадрово. В Unity непойманное исключение не роняет игру, а портит состояние — поэтому границы catch вокруг подсистем. throw; против throw ex; — stack trace».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/standard/exceptions/best-practices-for-exceptions" target="_blank">Microsoft: Best practices for exceptions</a> <span>— когда бросать, когда Try-паттерн</span></li>
</ul></div>`,

177: `<h3>Простыми словами</h3>
<p>float хранит ~7 значащих цифр. Любая арифметика округляет. Из этого следуют три правила: не сравнивать через <code>==</code>, не интегрировать вечно, не держать большие числа рядом с маленькими.</p>
<h3>Сравнение</h3>
<pre>0.1f + 0.2f == 0.3f;                          <span class="cm">// false</span>
Mathf.Abs(a - b) &lt; 1e-5f;                     <span class="cm">// абсолютный эпсилон: ломается на больших значениях (1e6 + 1e-5 == 1e6)</span>
Mathf.Abs(a - b) &lt; 1e-5f * Mathf.Max(Mathf.Abs(a), Mathf.Abs(b)); <span class="cm">// относительный: ломается около нуля</span>
Mathf.Approximately(a, b);                    <span class="cm">// комбинированная эвристика Unity — для общих случаев</span></pre>
<p>Для «полоска заполнена» — <code>ratio >= 1f - eps</code>; для «достиг точки» — <code>sqrMagnitude &lt; r*r</code>, а не равенство.</p>
<h3>Накопление ошибки</h3>
<p>Суммирование дельт дрейфует: <code>pos += v * dt</code> тысячу раз — и объект не там, где должен. Лечение — периодически перевыводить из авторитетного состояния: позиция по времени из формулы, а не интегралом; таймер как «время старта + длительность», а не «вычитаем dt». Катастрофическое сокращение: разность двух близких больших чисел теряет все значащие цифры — это механизм джиттера вдали от origin (см. вопрос о больших координатах).</p>
<h3>float против double</h3>
<p>float — игровой дефолт: вдвое меньше памяти и трафика, SIMD пакует вдвое больше, GPU работает во float. double нужен на краях: аккумуляторы абсолютного времени (float-время теряет точность через часы игры — <code>Time.time</code> именно поэтому опасен для долгих сессий), планетарные координаты, серверная математика, где важна точность.</p>
<h3>Детерминизм</h3>
<p>Одинаковый C# не гарантирует одинаковых результатов на разных CPU и компиляторах: FMA-инструкции, порядок операций после оптимизации, x87 против SSE. Для lockstep-мультиплеера и реплеев — fixed-point или библиотеки с строгой математикой (soft float), а не надежда на IEEE.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Сравниваю с эпсилоном по масштабу, не интегрирую вечно, а перевыводю из авторитетного состояния. float — дефолт, double — для времени и больших координат. Для детерминизма float недостаточно — fixed-point».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/ScriptReference/Mathf.Approximately.html" target="_blank">Unity: Mathf.Approximately</a> <span>— что именно она сравнивает</span></li>
<li><a href="https://floating-point-gui.de/" target="_blank">The Floating-Point Guide</a> <span>— короткое и правильное объяснение сравнения</span></li>
</ul></div>`,

178: `<h3>Простыми словами</h3>
<p>Битовые операции в играх — это не хитрые трюки, а повседневная алгебра масок. Слои физики, флаги сущностей, упаковка пакетов — всё это биты. Остальное (xor-swap, abs через маску) — история, которую компилятор делает лучше вас.</p>
<h3>Маски — наизусть</h3>
<pre>int mask = 1 &lt;&lt; layer;                 <span class="cm">// построить</span>
mask |= 1 &lt;&lt; other;                    <span class="cm">// добавить</span>
mask &amp;= ~(1 &lt;&lt; other);                 <span class="cm">// убрать</span>
bool has = (mask &amp; (1 &lt;&lt; layer)) != 0; <span class="cm">// проверить</span>
mask ^= 1 &lt;&lt; layer;                    <span class="cm">// переключить</span>
Physics.Raycast(ray, out hit, dist, mask);   <span class="cm">// параметр — маска, не индекс слоя</span></pre>
<h3>Степени двойки</h3>
<pre>bool pow2 = x > 0 &amp;&amp; (x &amp; (x - 1)) == 0;   <span class="cm">// x - 1 сбрасывает младший бит</span>
int idx = i &amp; (capacity - 1);               <span class="cm">// быстрый модуль для кольцевого буфера с ёмкостью 2^n</span></pre>
<h3>Упаковка</h3>
<pre>int packed = (hp &lt;&lt; 16) | (ammo &amp; 0xFFFF);  <span class="cm">// два ushort в int — сетевой пакет</span>
int hp2 = packed >> 16, ammo2 = packed &amp; 0xFFFF;

ulong flags;                                 <span class="cm">// 64 bool в 8 байтах — кэш-плотные флаги сущности</span>
flags |= 1UL &lt;&lt; (int)Flag.Stunned;</pre>
<h3>Popcount и trailing zeros</h3>
<p><code>math.countbits(mask)</code> — сколько флагов установлено. <code>math.tzcnt(mask)</code> — индекс младшего установленного бита; обход всех установленных: взять tzcnt, сбросить бит через <code>mask &amp;= mask - 1</code>, повторить. Так итерируются sparse set в ECS и маски компонентов.</p>
<h3>Что устарело</h3>
<p>xor-swap — фокус для вечеринок, компилятор делает обычный swap быстрее. <code>Abs</code> через маску знака — компилятор знает. Branchless-селекты — иногда, но после профайлера. Ответ на «а знаете ли вы трюк X»: «знаю, компилятор победит, я оптимизирую layout и алгоритмы» — и подкрепить свободным владением масками.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Маски слоёв и флагов — построить, добавить, убрать, проверить. Степень двойки через x &amp; (x-1), модуль через &amp; (cap-1), упаковка сдвигами, обход битов через tzcnt. Трюки со знаком — история».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/layermask-set.html" target="_blank">Unity Manual: Layer masks</a> <span>— как маски используются в физике</span></li>
<li><a href="https://graphics.stanford.edu/~seander/bithacks.html" target="_blank">Bit Twiddling Hacks</a> <span>— классический справочник, читать как историю</span></li>
</ul></div>`,

179: `<h3>Простыми словами</h3>
<p><code>ToLower()</code> делает две вещи, которые вам не нужны: создаёт новую строку и применяет правила культуры ОС игрока. Для идентификаторов, путей, тегов и ключей нужно ни то, ни другое — нужно побайтовое сравнение, и оно есть в <code>StringComparison.Ordinal</code>.</p>
<h3>Турецкая I</h3>
<pre>CultureInfo.CurrentCulture = new CultureInfo("tr-TR");
"ID".ToLower();                 <span class="cm">// "ıd" — без точки над i</span>
"ID".ToLower() == "id";         <span class="cm">// false на турецкой локали, true на остальных</span>
<span class="cm">// Ключ конфига "FireRate" не находится у игроков из Турции — реальный класс багов</span></pre>
<h3>Правила</h3>
<pre><span class="cm">// Идентификаторы, ключи, пути, теги</span>
string.Equals(a, b, StringComparison.Ordinal);            <span class="cm">// без аллокаций, без культуры, быстрее всего</span>
string.Equals(a, b, StringComparison.OrdinalIgnoreCase);  <span class="cm">// регистронезависимо, но всё ещё без культуры</span>
a.StartsWith("cfg_", StringComparison.Ordinal);           <span class="cm">// StartsWith без аргумента — культурный!</span>

<span class="cm">// Словари с строковыми ключами</span>
new Dictionary&lt;string, Item&gt;(StringComparer.OrdinalIgnoreCase);

<span class="cm">// Сортировка пользовательского текста для отображения — культура осознанно</span>
names.Sort(StringComparer.CurrentCulture);</pre>
<p><code>a.ToLower() == b.ToLower()</code> — две аллокации и неверно. Никогда.</p>
<h3>Хэши строк — отдельная ловушка</h3>
<p><code>string.GetHashCode()</code> рандомизирован на процесс в современном .NET и различается между рантаймами. Сохранить хэш в сейв или передать по сети — значит получить несовпадение после перезапуска. Для стабильных ID — свой алгоритм (FNV-1a, xxHash) или <code>Animator.StringToHash</code>, который именно для этого детерминирован.</p>
<h3>Что сказать на собеседовании</h3>
<p>«ToLower аллоцирует и зависит от культуры — турецкая I ломает ключи. Для идентификаторов — Ordinal через string.Equals с comparison, словари — с StringComparer. GetHashCode строки нестабилен между запусками, для ID — FNV или StringToHash».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/standard/base-types/best-practices-strings" target="_blank">Microsoft: Best practices for comparing strings</a> <span>— Ordinal против культуры, с примерами</span></li>
</ul></div>`,

180: `<h3>Простыми словами</h3>
<p>Обычная лямбда компилируется в код. Лямбда, присвоенная <code>Expression&lt;Func&lt;...&gt;&gt;</code>, компилируется в <b>описание</b> кода — дерево узлов, которое можно обойти, прочитать и превратить во что-то другое: в SQL, в имя свойства, в новый делегат. Полезно для библиотек, почти бесполезно под AOT.</p>
<pre>Expression&lt;Func&lt;Player, bool&gt;&gt; expr = p => p.Level > 10;
<span class="cm">// expr.Body — BinaryExpression(GreaterThan, MemberAccess(p, "Level"), Constant(10))</span>
<span class="cm">// можно прочитать "Level" — так работают библиотеки валидации и мокинга</span>

var func = expr.Compile();    <span class="cm">// эмитит IL в рантайме → делегат</span></pre>
<h3>Почему в Unity это значит меньше</h3>
<p><code>Compile()</code> — это генерация кода в рантайме. IL2CPP её не умеет: на iOS, консолях и WebGL вызов либо падает, либо уходит в медленный интерпретатор выражений. Библиотеки, которые строят привязки через <code>Expression.Compile</code> (часть сериализаторов, мапперов, старых DI-контейнеров), — категория номер один сюрпризов «в редакторе работает, на устройстве нет».</p>
<h3>Что вместо</h3>
<p>Кодогенерация на компиляции — source generators: тот же код привязки, но без рантайма. Чтение имён членов для тулинга — <code>nameof(Player.Level)</code> или атрибуты. Динамические запросы к данным — свой маленький интерпретатор над data-driven описанием, а не деревья.</p>
<h3>Что проверять</h3>
<p>Перед мобильным релизом — grep по зависимостям на <code>Expression.Compile</code>, <code>DynamicMethod</code>, <code>Emit</code>. Если нашли — проверка на устройстве под IL2CPP, а не в редакторе.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Деревья выражений — инспектируемое описание лямбды; Compile генерирует IL в рантайме, чего IL2CPP не умеет. Знаю концептуально, в Unity заменяю source generators и nameof, а сторонние библиотеки проверяю на Expression.Compile до релиза».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/expression-trees/" target="_blank">Microsoft: Expression trees</a> <span>— что это и как строится</span></li>
<li><a href="https://docs.unity3d.com/Manual/ScriptingRestrictions.html" target="_blank">Unity Manual: Scripting restrictions</a> <span>— что запрещено под AOT</span></li>
</ul></div>`,

181: `<h3>Простыми словами</h3>
<p>Как и <code>yield</code>, <code>async</code> — это переписывание метода в стейт-машину. Разница в том, кто двигает машину: итератор двигает вызывающий через MoveNext, а async-машину двигает <b>завершение задачи</b>, которую вы ждёте. Понимание быстрого и медленного пути объясняет, когда await бесплатен, а когда аллоцирует.</p>
<h3>Что генерирует компилятор</h3>
<pre>async Task&lt;int&gt; LoadAsync()
{
    var data = await ReadAsync();     <span class="cm">// точка 1</span>
    return Parse(data);
}
<span class="cm">// превращается в struct LoadAsyncStateMachine : IAsyncStateMachine</span>
<span class="cm">// { int state; AsyncTaskMethodBuilder&lt;int&gt; builder; TaskAwaiter&lt;byte[]&gt; awaiter; ... void MoveNext() {...} }</span></pre>
<h3>Что происходит на await</h3>
<p>1. Вызывается <code>GetAwaiter()</code> у ожидаемого объекта.</p>
<p>2. Проверяется <code>IsCompleted</code>. <b>Если true</b> — быстрый путь: продолжаем синхронно, ничего не аллоцируется, стейт-машина остаётся на стеке. Кэш-попадание, уже загруженный ассет, завершённая задача — стоят почти ничего.</p>
<p>3. <b>Если false</b> — медленный путь: <code>AwaitUnsafeOnCompleted</code> регистрирует <code>MoveNext</code> как продолжение, стейт-машина <b>боксится в кучу</b> (один раз, при первой приостановке), метод возвращает незавершённый Task вызывающему.</p>
<p>4. Когда задача завершится, продолжение вызовет <code>MoveNext</code>, и машина продолжит с записанного состояния.</p>
<h3>Цена</h3>
<p>Синхронное завершение — почти ноль. Настоящая асинхронность — один бокс машины плюс аллокация Task от builder-а. На частоте событий это ничто; в цикле на тысячи сущностей — мусор. UniTask борется с этим пуловыми struct-задачами и своими builder-ами, поэтому в Unity он стандарт.</p>
<h3>Ловушки</h3>
<p>Исключение внутри async-метода не бросается при вызове — оно кладётся в Task и бросится при await. Код до первого await выполняется синхронно в потоке вызывающего — тяжёлая работа там блокирует его.</p>
<h3>Что сказать на собеседовании</h3>
<p>«async — стейт-машина-структура; на await проверяется IsCompleted: завершено — синхронно и бесплатно, нет — машина боксится, регистрируется продолжение, возвращается Task. UniTask убирает аллокации медленного пути пулами».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://devblogs.microsoft.com/dotnet/how-async-await-really-works/" target="_blank">Stephen Toub: How Async/Await Really Works in C#</a> <span>— исчерпывающий разбор от автора рантайма</span></li>
<li><a href="https://github.com/Cysharp/UniTask" target="_blank">UniTask</a> <span>— README объясняет, что именно он оптимизирует</span></li>
</ul></div>`,

182: `<h3>Простыми словами</h3>
<p>После await код должен где-то продолжиться. <code>SynchronizationContext</code> отвечает на вопрос «где». Unity ставит на главный поток свой контекст, и поэтому после <code>await Task.Delay</code> вы снова в главном потоке и можете трогать трансформы — без всякого маршалинга руками.</p>
<h3>Как устроен UnitySynchronizationContext</h3>
<pre><span class="cm">// Упрощённо</span>
class UnitySynchronizationContext : SynchronizationContext
{
    readonly Queue&lt;(SendOrPostCallback cb, object state)&gt; queue = new();
    public override void Post(SendOrPostCallback cb, object state) { lock (queue) queue.Enqueue((cb, state)); }
    internal void Exec()      <span class="cm">// вызывается player loop-ом каждый кадр в главном потоке</span>
    { /* перелить очередь и выполнить всё по порядку */ }
}</pre>
<p>По умолчанию await захватывает текущий контекст и постит продолжение в него. Задача завершилась в пуле — продолжение встало в очередь — player loop выполнил его в главном потоке на следующей прокачке.</p>
<h3>Следствия</h3>
<p><b>Задержка.</b> Продолжение выполнится не мгновенно, а на следующей прокачке очереди — обычно в том же или следующем кадре.</p>
<p><b>await не переключает поток.</b> Тяжёлая CPU-работа после await блокирует главный поток так же, как до него. Для фоновой работы — <code>await Task.Run(...)</code>, потом возврат.</p>
<p><b>Внутри Task.Run контекста нет.</b> Код там выполняется в пуле; обращение к Unity API бросает исключение. После <code>await Task.Run</code> вы снова в главном — потому что внешний await захватил Unity-контекст.</p>
<h3>Нюанс редактора</h3>
<p>Контекст качается и в редакторе, но domain reload может «подвесить» ожидающие продолжения: задача завершится в домене, которого уже нет. Это одна из причин, почему awaiter-ы UniTask работают прямо на PlayerLoop, минуя SynchronizationContext, и стали продакшен-стандартом.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Контекст — очередь продолжений, которую player loop прокачивает в главном потоке. Поэтому после await я в главном потоке, но с задержкой до прокачки; await не переключает поток; внутри Task.Run Unity API недоступен. UniTask обходит контекст через PlayerLoop».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/archive/msdn-magazine/2011/february/msdn-magazine-parallel-computing-it-s-all-about-the-synchronizationcontext" target="_blank">Stephen Cleary: It's All About the SynchronizationContext</a> <span>— классическая статья</span></li>
</ul></div>`,

183: `<h3>Простыми словами</h3>
<p><code>ConfigureAwait(false)</code> говорит: «не возвращай меня в контекст, продолжи там, где задача завершилась». Для серверной библиотеки это правильно — там контекста либо нет, либо он мешает. В геймплейном коде Unity это ровно то, чего вы не хотите: после него вы вне главного потока.</p>
<pre>async Task ShowAsync()
{
    var text = await Api.GetAsync().ConfigureAwait(false);
    label.text = text;        <span class="cm">// пул потоков, Unity API → исключение (или порча состояния в билде)</span>
}</pre>
<h3>Когда он уместен в Unity-проекте</h3>
<p>В чисто вычислительных и IO-библиотеках, которые делятся с не-Unity кодом (сервер, тулы): парсеры, сетевой слой, криптография. Там внутри каждого await — <code>ConfigureAwait(false)</code>, как в любой универсальной библиотеке, и ни одного обращения к движку. Прикладной слой вызывает их обычным await и возвращается в главный поток, потому что <i>его</i> await контекст захватил.</p>
<h3>Правильная форма для фоновой работы</h3>
<pre><span class="cm">// Явно и видимо</span>
var result = await Task.Run(() => HeavyCompute(input));   <span class="cm">// в пуле</span>
Apply(result);                                            <span class="cm">// снова в главном</span>

<span class="cm">// UniTask: переходы между потоками как операторы</span>
await UniTask.SwitchToThreadPool();
var r = HeavyCompute(input);
await UniTask.SwitchToMainThread();
Apply(r);</pre>
<p>Переходы видны в коде и намеренны. <code>ConfigureAwait(false)</code> в прикладном коде — это переход, который случился случайно.</p>
<h3>Что сказать на собеседовании</h3>
<p>«ConfigureAwait(false) не захватывает контекст — продолжение в пуле. В библиотечном коде без Unity API — да, в геймплее — нет, мне нужно вернуться в главный поток. Фоновую работу делаю через Task.Run или SwitchToThreadPool явно».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://devblogs.microsoft.com/dotnet/configureawait-faq/" target="_blank">Stephen Toub: ConfigureAwait FAQ</a> <span>— исчерпывающие ответы на все «а если»</span></li>
</ul></div>`,

184: `<h3>Простыми словами</h3>
<p><code>Task</code> — всегда объект в куче, даже если результат уже готов. <code>ValueTask</code> — структура, которая умеет нести готовый результат без аллокации, а при настоящей асинхронности оборачивает Task или пуловый источник. Он придуман для одного случая: горячий API, который чаще всего завершается синхронно.</p>
<pre>readonly Dictionary&lt;string, Texture&gt; cache = new();

public ValueTask&lt;Texture&gt; GetAsync(string key)
{
    if (cache.TryGetValue(key, out var tex))
        return new ValueTask&lt;Texture&gt;(tex);        <span class="cm">// попадание: 0 аллокаций</span>
    return new ValueTask&lt;Texture&gt;(LoadAsync(key));  <span class="cm">// промах: обернули Task</span>
}</pre>
<h3>Ограничения, которые спрашивают</h3>
<p>ValueTask можно await-ить <b>один раз</b>. Не дважды, не параллельно, не читать <code>.Result</code> до завершения, не хранить и ждать потом. Причина: когда внутри пуловый <code>IValueTaskSource</code>, после первого await он возвращается в пул и переиспользуется — второй await прочитает чужой результат. Если нужно несколько ожиданий — <code>.AsTask()</code> и дальше как с Task.</p>
<h3>Ориентир выбора</h3>
<p>Публичные API — по умолчанию <code>Task</code>: контракт проще, ошибиться нельзя. <code>ValueTask</code> — где профайлер показывает давление от аллокаций синхронных завершений: кэши, буферизованное чтение, пулы соединений. В Unity <code>UniTask</code> — это тот же struct-task паттерн, обобщённый на весь проект, с пулами и без SynchronizationContext.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Task аллоцирует всегда; ValueTask — структура с готовым результатом inline для частого синхронного пути. Ждать один раз, не хранить, не читать Result заранее — иначе пуловый источник отдаст чужое. Публичный API — Task, горячий с кэшем — ValueTask».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://devblogs.microsoft.com/dotnet/understanding-the-whys-whats-and-whens-of-valuetask/" target="_blank">Stephen Toub: Understanding ValueTask</a> <span>— зачем, что и когда</span></li>
</ul></div>`,

185: `<h3>Простыми словами</h3>
<p>У <code>async void</code> нет Task. Значит, вызывающий не может дождаться, узнать о завершении, поймать исключение или не дать запустить второй раз. Это async-метод, который отрезал от себя все ручки управления.</p>
<h3>Три опасности</h3>
<pre>public async void OnBuyClicked()        <span class="cm">// 1. исключение не вернётся — оно уйдёт в SynchronizationContext</span>
{                                       <span class="cm">//    и всплывёт необработанным логом далеко от места вызова</span>
    await purchase.BuyAsync(item);      <span class="cm">// 2. двойной клик — два параллельных выполнения, две покупки</span>
    ShowReceipt();                      <span class="cm">// 3. тест не может дождаться этого момента</span>
}</pre>
<p>В Unity необработанное исключение из async void — красная строка в консоли без контекста. В других хостах оно роняет процесс.</p>
<h3>Единственное легитимное применение</h3>
<p>Обработчик события с сигнатурой void, которую вы не контролируете: <code>Button.onClick</code>, системные коллбэки. И даже тогда тело — тонкая обёртка:</p>
<pre>public async void OnBuyClicked()
{
    try { await BuyAsync(); }
    catch (OperationCanceledException) { }
    catch (Exception e) { Debug.LogException(e); ShowError(); }
}

async Task BuyAsync()                   <span class="cm">// вся логика — здесь, с Task, тестируемая</span>
{
    if (inProgress) return;             <span class="cm">// защита от повторного запуска</span>
    inProgress = true;
    try { await purchase.BuyAsync(item, destroyCancellationToken); ShowReceipt(); }
    finally { inProgress = false; }
}</pre>
<h3>Unity-ответ</h3>
<p>UniTask даёт <code>UniTaskVoid</code> и <code>.Forget()</code>: fire-and-forget становится явным, а исключения направляются в глобальный обработчик <code>UniTaskScheduler.UnobservedTaskException</code>. Осознанное отпускание вместо случайного.</p>
<h3>Что сказать на собеседовании</h3>
<p>«async void — нет Task: не дождаться, не поймать, не защитить от повторного запуска. Только для void-сигнатур событий, и там — try/catch вокруг await настоящего async Task. С UniTask — Forget() явно».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/archive/msdn-magazine/2013/march/async-await-best-practices-in-asynchronous-programming" target="_blank">Stephen Cleary: Async/Await Best Practices</a> <span>— «Avoid async void» и почему</span></li>
</ul></div>`,

186: `<h3>Простыми словами</h3>
<p>Отмена в .NET кооперативна: никто не убивает задачу снаружи, задача сама проверяет токен и выходит. Поэтому история отмены — это договор между тремя сторонами: кто создаёт источник, кто передаёт токен, кто его проверяет. В игре у этого договора есть естественная форма: время жизни объекта.</p>
<h3>Принципы</h3>
<p>Токен передаётся параметром через всю цепочку — не ambient-состоянием. Создатель <code>CancellationTokenSource</code> владеет <code>Cancel</code> и <code>Dispose</code>. Ожидаемые операции получают токен (<code>Task.Delay(ms, token)</code>), а циклы проверяют его сами (<code>token.ThrowIfCancellationRequested()</code>).</p>
<h3>Игровые времена жизни</h3>
<pre>public class Caster : MonoBehaviour
{
    async Task CastAsync(Ability a)
    {
        <span class="cm">// Умирает вместе с объектом: закрывает класс багов «корутина на уничтоженном объекте»</span>
        var token = destroyCancellationToken;

        <span class="cm">// Комбинация: отменить если умер ИЛИ оглушён ИЛИ сцена выгружается</span>
        using var linked = CancellationTokenSource.CreateLinkedTokenSource(token, stun.Token, sceneUnload.Token);
        linked.CancelAfter(a.MaxDuration);                   <span class="cm">// таймаут — тоже отмена</span>

        try
        {
            await PlayWindupAsync(linked.Token);
            await a.ExecuteAsync(linked.Token);
        }
        catch (OperationCanceledException) { ResetPose(); }  <span class="cm">// только очистка — не логировать как ошибку</span>
    }
}</pre>
<p><code>destroyCancellationToken</code> и <code>Application.exitCancellationToken</code> есть в Unity 2022.2+; раньше ту же роль играл <code>GetCancellationTokenOnDestroy()</code> из UniTask.</p>
<h3>Правила обработки</h3>
<p><code>OperationCanceledException</code> — не ошибка; пусть летит к await-ящему, ловите только для очистки. Не глотайте её общим <code>catch (Exception)</code> — иначе отмена станет невидимой. Связанные источники держат регистрации на родительских токенах — всегда <code>Dispose</code>, иначе утечка.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Отмена кооперативна: токен параметром по цепочке, создатель владеет источником. В Unity токен — время жизни объекта через destroyCancellationToken, скоупы комбинирую через linked source, таймаут — CancelAfter, OperationCanceledException не логирую, связанные источники освобождаю».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/standard/threading/cancellation-in-managed-threads" target="_blank">Microsoft: Cancellation in managed threads</a> <span>— модель целиком</span></li>
<li><a href="https://docs.unity3d.com/ScriptReference/MonoBehaviour-destroyCancellationToken.html" target="_blank">Unity: MonoBehaviour.destroyCancellationToken</a> <span>— токен времени жизни</span></li>
</ul></div>`,

187: `<h3>Простыми словами</h3>
<p><code>TaskCompletionSource</code> — задача, которую завершаете вы, а не рантайм. Вы держите источник, отдаёте наружу <code>tcs.Task</code>, а когда прилетит коллбэк — вызываете <code>SetResult</code>. Это мост между миром коллбэков (SDK, нативные плагины, диалоги) и миром await.</p>
<h3>Типичный мост</h3>
<pre>Task&lt;bool&gt; ShowRewardedAdAsync(CancellationToken token)
{
    var tcs = new TaskCompletionSource&lt;bool&gt;(TaskCreationOptions.RunContinuationsAsynchronously);

    adsSdk.OnRewarded  += () => tcs.TrySetResult(true);
    adsSdk.OnClosed    += () => tcs.TrySetResult(false);
    adsSdk.OnFailed    += e  => tcs.TrySetException(new AdException(e));

    using var reg = token.Register(() => tcs.TrySetCanceled(token));   <span class="cm">// отмена снаружи</span>
    adsSdk.Show();
    return tcs.Task;
}

<span class="cm">// Вызывающий: var rewarded = await ShowRewardedAdAsync(destroyCancellationToken);</span></pre>
<h3>Три продакшен-детали</h3>
<p><b>RunContinuationsAsynchronously.</b> Без этой опции продолжения await-ящих выполняются синхронно <i>внутри</i> вашего <code>SetResult</code> — то есть чужой код запускается посреди коллбэка SDK, когда ваше состояние ещё не согласовано. Реентрантность, а в худшем случае дедлок. С опцией продолжение планируется отдельно.</p>
<p><b>TrySet вместо Set.</b> Когда завершений может быть несколько (ответ пришёл, но таймаут уже сработал), <code>SetResult</code> на завершённой задаче бросает. <code>TrySetResult</code> возвращает false и не ломает ничего.</p>
<p><b>Отписаться.</b> Регистрацию токена диспозить, обработчики SDK снимать после завершения — иначе источник живёт, пока жив SDK.</p>
<h3>В Unity</h3>
<p><code>AwaitableCompletionSource</code> (Unity 2023+) и <code>UniTaskCompletionSource</code> — тот же паттерн с движко-дружественными типами: без аллокации Task, с продолжением на PlayerLoop.</p>
<h3>Что сказать на собеседовании</h3>
<p>«TCS — задача с ручным завершением: адаптер коллбэков к await. Всегда RunContinuationsAsynchronously, TrySet при гонке завершений, регистрация отмены через token.Register с Dispose. В Unity — UniTaskCompletionSource или AwaitableCompletionSource».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.taskcompletionsource-1" target="_blank">Microsoft: TaskCompletionSource&lt;T&gt;</a> <span>— API и опции создания</span></li>
<li><a href="https://devblogs.microsoft.com/pfxteam/the-nature-of-taskcompletionsourcetresult/" target="_blank">Stephen Toub: The Nature of TaskCompletionSource</a> <span>— зачем он существует</span></li>
</ul></div>`,

188: `<h3>Простыми словами</h3>
<p>Упавшая задача не бросает исключение — она его <b>хранит</b>. Что вы получите, зависит от того, как вы её спросили: <code>await</code> отдаст оригинальное исключение, <code>.Wait()</code> — обёртку <code>AggregateException</code>, а если не спросить вообще — исключение исчезнет.</p>
<h3>await против Wait</h3>
<pre>try { await LoadAsync(); }
catch (IOException e) { }          <span class="cm">// ловится: await перебрасывает первое исключение как есть, стек сохранён</span>

try { LoadAsync().Wait(); }
catch (IOException e) { }          <span class="cm">// НЕ ловится: Wait заворачивает в AggregateException</span>
catch (AggregateException e) { e.InnerExceptions[0]; }   <span class="cm">// вот так</span></pre>
<p><code>await</code> использует <code>ExceptionDispatchInfo</code>: исходный стек сохраняется, как будто исключение бросили здесь.</p>
<h3>WhenAll</h3>
<p><code>await Task.WhenAll(a, b, c)</code> перебрасывает только <b>первое</b> исключение. Если упали два — второе не увидите. Когда важны все: сохранить задачу WhenAll в переменную и после catch смотреть <code>whenAll.Exception.InnerExceptions</code>, либо проверять каждую задачу отдельно.</p>
<h3>Ненаблюдаемые исключения</h3>
<p>Упавшая задача, которую никто не await-ил, — ненаблюдаемая. Современные рантаймы её молча проглатывают; при финализации поднимается <code>TaskScheduler.UnobservedTaskException</code>. Если на него не подписаться и не логировать — целый класс сбоев невидим. Хелперы fire-and-forget обязаны вешать логирующее продолжение.</p>
<pre>TaskScheduler.UnobservedTaskException += (s, e) => { Debug.LogException(e.Exception); e.SetObserved(); };
<span class="cm">// UniTask: UniTaskScheduler.UnobservedTaskException — настройте с первого дня</span></pre>
<h3>Unity-дополнение</h3>
<p>Исключения из <code>async void</code> идут через SynchronizationContext и всплывают необработанным логом без связи с местом вызова (см. соответствующий вопрос).</p>
<h3>Что сказать на собеседовании</h3>
<p>«await перебрасывает оригинал со стеком, Wait — AggregateException. WhenAll отдаёт только первое. Ненаблюдаемые исключения молча теряются — подписываюсь на UnobservedTaskException и логирую, в UniTask — на его аналог».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/exception-handling-task-parallel-library" target="_blank">Microsoft: Exception handling (TPL)</a> <span>— все случаи с примерами</span></li>
</ul></div>`,

189: `<h3>Простыми словами</h3>
<p>Главный поток ждёт задачу через <code>.Result</code>. Задача внутри что-то await-ила, и её продолжение запощено в очередь главного потока. Главный поток заблокирован ожиданием и очередь не качает. Продолжение не выполняется, задача не завершается, <code>.Result</code> не возвращается. Навсегда.</p>
<h3>Как это выглядит в Unity</h3>
<pre>void Start()
{
    var cfg = LoadConfigAsync().Result;    <span class="cm">// главный поток встал здесь</span>
}

async Task&lt;Config&gt; LoadConfigAsync()
{
    var json = await DownloadAsync(url);   <span class="cm">// продолжение после await → в очередь главного потока</span>
    return Parse(json);                    <span class="cm">// никогда не выполнится: очередь некому качать</span>
}</pre>
<p>Unity — среда с одним главным потоком и контекстом на нём, поэтому уязвима полностью: <code>.Result</code> вокруг <code>UnityWebRequest</code> вешает редактор насмерть.</p>
<h3>Выходы, по предпочтительности</h3>
<p><b>1. Async до самого верха.</b> Единственное настоящее решение: вызывающий тоже async, ждёт через await, главный поток свободен.</p>
<p><b>2. UniTask на PlayerLoop.</b> Снижает риск, потому что продолжения не зависят от SynchronizationContext — но блокировка главного всё равно морит всё, что запланировано на него.</p>
<p><b>3. ConfigureAwait(false) внутри библиотеки.</b> Избегает <i>этого</i> дедлока, но выбрасывает продолжение с главного потока.</p>
<p><b>4. Task.Run как побег.</b> <code>Task.Run(() => LoadConfigAsync()).Result</code> — продолжение уйдёт в пул, дедлока не будет; но это пластырь с ценой потокобезопасности и всё ещё блокирующий главный на время работы.</p>
<h3>Родственные варианты</h3>
<p>Блокировка внутри <code>lock</code>, когда продолжениям нужен тот же lock. Голодание пула потоков на серверах, когда сотни запросов делают sync-over-async и съедают все рабочие потоки.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Главный блокируется в Result, продолжение ждёт главный в очереди контекста — взаимное ожидание. В Unity особенно: один главный поток. Лечение — async до верха; остальное пластыри».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://blog.stephencleary.com/2012/07/dont-block-on-async-code.html" target="_blank">Stephen Cleary: Don't Block on Async Code</a> <span>— каноническое объяснение с диаграммой</span></li>
</ul></div>`,

190: `<h3>Простыми словами</h3>
<p>Три инструмента для трёх задач. <code>Thread</code> — один долгий цикл, которым вы управляете. <code>Task.Run</code> — короткая всплесковая работа в общем пуле. Job System — параллельная обработка игровых данных, встроенная в планирование движка. Выбор по форме работы, а не по привычке.</p>
<h3>Thread — для долгоживущих циклов</h3>
<p>Декодирование аудио-стрима, насос сетевого сокета, писатель логов: один цикл, чувствительный к задержке, с именем и приоритетом. Поток на задачу — ошибка: ~1 МБ стека каждый, дорогое создание, а главное — переподписка. Готовых потоков больше, чем ядер, — и ОС крутит контекст-свитчи, конкурируя с рабочими потоками Unity, которые уже насыщают ядра джобами.</p>
<pre>var pump = new Thread(SocketLoop) { Name = "NetPump", IsBackground = true, Priority = ThreadPriority.AboveNormal };
pump.Start();</pre>
<h3>ThreadPool / Task.Run — для всплесков</h3>
<p>Запрос поиска пути, чанк процедурной генерации, сжатие сейва. Пул амортизирует создание потоков и адаптируется под нагрузку. Правила: не блокировать потоки пула локами или долгим IO (голодание), результаты возвращать через await или конкурентную очередь, которую разбирает Update.</p>
<pre>var path = await Task.Run(() => pathfinder.Find(from, to));   <span class="cm">// посчитали в пуле, применили в главном</span></pre>
<h3>Job System — для data-parallel</h3>
<p>Тысячи одинаковых операций над массивами: расстояния, видимость, обновление частиц. Джобы знают о ядрах, видны в профайлере, планируются вместе с рендером и физикой, а с Burst получают SIMD. Это не конкурент Task.Run — это другой класс работы.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Thread — один именованный долгий цикл; Task.Run — короткие всплески, без блокировок внутри; Job System с Burst — параллельная обработка данных, встроенная в движок. Поток на задачу не создаю: переподписка воюет с воркерами Unity».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/JobSystem.html" target="_blank">Unity Manual: Job System</a> <span>— когда джобы, а не потоки</span></li>
<li><a href="https://learn.microsoft.com/en-us/dotnet/standard/threading/the-managed-thread-pool" target="_blank">Microsoft: The managed thread pool</a> <span>— как пул планирует работу</span></li>
</ul></div>`,

191: `<h3>Простыми словами</h3>
<p><code>lock(obj)</code> — сахар для <code>Monitor.Enter</code> в try и <code>Monitor.Exit</code> в finally. Внутри два режима: дешёвый, пока никто не конкурирует, и дорогой, когда конкурируют. Правила про объект блокировки — все из одного принципа: лочить то, что видите и контролируете только вы.</p>
<h3>Как работает</h3>
<pre>lock (gate) { count++; }
<span class="cm">// компилируется в:</span>
bool taken = false;
try { Monitor.Enter(gate, ref taken); count++; }
finally { if (taken) Monitor.Exit(gate); }</pre>
<p>Без конкуренции: thin lock в заголовке объекта, короткий спин — без обращения к ОС. При конкуренции лок «раздувается» в sync block с событием ядра: на порядки дороже плюс контекст-свитчи.</p>
<h3>Правила для объекта блокировки</h3>
<pre>private readonly object gate = new();   <span class="cm">// правильно: приватный, readonly, ссылочный</span>

lock (this)          <span class="cm">// нет: вызывающие тоже могут залочить ваш объект → случайный дедлок</span>
lock (typeof(Foo))   <span class="cm">// нет: Type общий на весь процесс</span>
lock ("name")        <span class="cm">// нет: строки интернированы, чужой код может лочить ту же</span>
lock (someInt)       <span class="cm">// нет: боксится в новый объект каждый раз — блокировки нет вовсе</span></pre>
<h3>Правила для секции</h3>
<p>Крошечная: копировать, инкрементировать, переставить ссылку. Не вызывать внутри неизвестный или пользовательский код (коллбэки) — он может взять другой лок. <code>await</code> внутри lock — ошибка компиляции; нужна асинхронная секция — <code>SemaphoreSlim.WaitAsync</code>. Несколько локов — всегда в одном глобальном порядке, иначе дедлок рано или поздно.</p>
<h3>Игровой контекст</h3>
<p>Главному потоку и джоб-воркерам локи нужны редко: лучше передача владения данными — очереди, двойная буферизация по границе кадра, NativeArray с safety-системой. Lock — для редких точек синхронизации с настоящими фоновыми потоками (сеть, IO).</p>
<h3>Что сказать на собеседовании</h3>
<p>«lock — Monitor.Enter/Exit в try/finally, дешёвый без конкуренции, дорогой с ней. Лочу приватный readonly object: не this, не Type, не строку, не value type. Секция крошечная, без чужого кода, локи в одном порядке. В игре предпочитаю передачу владения шарингу».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/lock" target="_blank">Microsoft: lock statement</a> <span>— семантика и рекомендации по объекту</span></li>
</ul></div>`,

192: `<h3>Простыми словами</h3>
<p>Компилятор, JIT и процессор переупорядочивают обращения к памяти ради скорости. В одном потоке это незаметно. В двух — поток может увидеть устаревшее значение или операции в другом порядке. Три инструмента дают три разные гарантии, и важно не путать, какую именно.</p>
<h3>volatile — видимость, не атомарность</h3>
<pre>volatile bool stop;
while (!stop) Step();          <span class="cm">// гарантия: чтение не закэшируется в регистре, увидит запись другого потока</span>

volatile int count;
count++;                       <span class="cm">// НЕ атомарно: чтение, +1, запись — другой поток вклинится между</span></pre>
<p>Плюс полу-барьер: записи до volatile-записи не уедут после неё, чтения после volatile-чтения не уедут до него.</p>
<h3>Interlocked — атомарный read-modify-write</h3>
<pre>Interlocked.Increment(ref count);                       <span class="cm">// атомарный +1, с полным барьером</span>
Interlocked.Exchange(ref flag, 1);                      <span class="cm">// атомарная замена</span>
if (Interlocked.CompareExchange(ref state, Busy, Idle) == Idle) { /* мы захватили */ }   <span class="cm">// CAS — основа lock-free</span></pre>
<h3>Барьеры — для ручных протоколов</h3>
<p><code>Thread.MemoryBarrier()</code>, <code>Volatile.Read/Write</code> — когда вы пишете свой lock-free алгоритм и точно знаете, какие операции нельзя переставлять. Редко и только с ревьюером, читавшим спецификацию модели памяти.</p>
<h3>Честность сеньора</h3>
<p>Модель памяти C# тонкая. Double-checked locking без volatile — канонический сломанный пример; берите <code>Lazy&lt;T&gt;</code>. По умолчанию — lock или структуры уровнем выше (очереди, каналы). Interlocked — для счётчиков и флагов там, где профайлер показал конкуренцию. Всё хитрее — повод остановиться.</p>
<h3>Что реально нужно играм</h3>
<p>Interlocked-счётчик завершённых джобов, флаг «данные готовы», максимум — CAS-очередь SPSC между сетевым потоком и главным. Всё остальное покрывают Job System и передача владения.</p>
<h3>Что сказать на собеседовании</h3>
<p>«volatile — видимость и порядок, не атомарность: volatile int++ — гонка. Interlocked — атомарный RMW с барьером, CAS — основа lock-free. Явные барьеры — для ручных протоколов, которые я пишу редко и с ревью. Double-checked locking заменил Lazy».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/api/system.threading.interlocked" target="_blank">Microsoft: Interlocked</a> <span>— все атомарные операции</span></li>
<li><a href="https://learn.microsoft.com/en-us/archive/msdn-magazine/2012/december/csharp-the-csharp-memory-model-in-theory-and-practice" target="_blank">Igor Ostrovsky: The C# Memory Model in Theory and Practice</a> <span>— лучшее изложение модели памяти</span></li>
</ul></div>`,

193: `<h3>Простыми словами</h3>
<p>Конкурентные коллекции решают задачу «несколько потоков трогают одну структуру» за вас. У каждой свой механизм и своё место; и у всех есть одна общая черта, важная для игр: они аллоцируют внутри.</p>
<h3>Какие есть и как работают</h3>
<p><b>ConcurrentQueue / ConcurrentStack</b> — lock-free на CAS, сегментированные. Правильный дефолт для producer/consumer: фоновый поток кладёт результаты, главный разбирает в Update.</p>
<pre>readonly ConcurrentQueue&lt;PathResult&gt; results = new();
void Update() { while (results.TryDequeue(out var r)) Apply(r); }   <span class="cm">// разбор в главном</span></pre>
<p><b>ConcurrentBag</b> — локальные пулы на поток с воровством. Хорош, только когда кладёт и берёт один и тот же поток; как общая очередь — хуже ConcurrentQueue.</p>
<p><b>ConcurrentDictionary</b> — полосатые локи на запись, чтение без локов. Для кэшей. Знать: фабрика в <code>GetOrAdd</code> под гонкой может выполниться несколько раз, побеждает один результат. Если фабрика с побочными эффектами — храните <code>Lazy&lt;T&gt;</code> как значение.</p>
<p><b>BlockingCollection</b> — блокирующее ожидание и ограничение размера поверх любой из них. Для выделенных рабочих потоков, никогда для главного: главный не блокируем.</p>
<h3>Игровые оговорки</h3>
<p>Сегменты и узлы аллоцируются — для покадровых горячих путей лучше предвыделенный кольцевой буфер с явной синхронизацией или двойная буферизация по границе кадра: пишем в A, пока главный читает B, меняем местами на точке синхронизации. Внутри Job System — <code>NativeQueue</code>, <code>NativeStream</code>, <code>NativeHashMap.ParallelWriter</code>, не managed-коллекции.</p>
<h3>Что сказать на собеседовании</h3>
<p>«ConcurrentQueue — дефолт для передачи результатов главному; ConcurrentDictionary — кэши с оговоркой про GetOrAdd; BlockingCollection — только для фоновых воркеров. В горячих путях — кольцевой буфер или двойная буферизация, в джобах — Native-контейнеры».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/standard/collections/thread-safe/" target="_blank">Microsoft: Thread-safe collections</a> <span>— обзор и выбор</span></li>
</ul></div>`,

194: `<h3>Простыми словами</h3>
<p>Ленивая инициализация — «создать при первом обращении». Проблема в слове «первом», когда обращаются два потока сразу. Ручной double-checked locking знаменит тем, что его почти никто не пишет правильно. Современный набор решает это за вас.</p>
<h3>Современные инструменты</h3>
<pre><span class="cm">// Lazy&lt;T&gt;: режимы потокобезопасности</span>
static readonly Lazy&lt;Atlas&gt; atlas = new(() => Build(), LazyThreadSafetyMode.ExecutionAndPublication);
<span class="cm">// ExecutionAndPublication (дефолт): фабрика выполнится один раз, остальные ждут</span>
<span class="cm">// PublicationOnly: фабрики могут гоняться, побеждает первая — без локов, фабрика без побочных эффектов</span>
<span class="cm">// None: однопоточно, быстрее всего</span>

<span class="cm">// LazyInitializer: поле без обёртки</span>
LazyInitializer.EnsureInitialized(ref cache, () => new Cache());

<span class="cm">// Static holder: рантайм гарантирует одноразовую потокобезопасную инициализацию</span>
static class Holder { public static readonly Service Instance = new(); }</pre>
<p>Static readonly и статические конструкторы — простейший корректный ленивый синглтон: рантайм сам синхронизирует. Нюанс <code>beforefieldinit</code>: без явного статического конструктора момент инициализации «где-то до первого обращения», с ним — точно при первом.</p>
<h3>Ракурс Unity</h3>
<p><b>Жадная лучше ленивой.</b> Ленивая инициализация прячет фриз в случайное место игры — первый выстрел, первое открытие инвентаря. На экране загрузки тот же фриз никто не заметит.</p>
<p><b>Domain reload выключен.</b> Ленивые статики переживают повторный вход в Play Mode: кэш живёт, а объекты, на которые он ссылается, уничтожены. Всё лениво закэшированное сбрасывать через <code>[RuntimeInitializeOnLoadMethod(SubsystemRegistration)]</code>.</p>
<p>Поэтому многие команды предпочитают явный <code>Initialize()</code> в bootstrap-последовательности: порядок виден, фризы на загрузке, сброс тривиален.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Double-checked locking заменили Lazy&lt;T&gt; с режимами, LazyInitializer и static readonly holder. В играх предпочитаю жадную инициализацию на загрузке и явный Initialize, а ленивые статики сбрасываю из-за выключенного domain reload».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/framework/performance/lazy-initialization" target="_blank">Microsoft: Lazy initialization</a> <span>— Lazy, LazyInitializer, режимы</span></li>
<li><a href="https://docs.unity3d.com/Manual/DomainReloading.html" target="_blank">Unity Manual: Domain reloading</a> <span>— почему статики надо сбрасывать</span></li>
</ul></div>`,

195: `<h3>Простыми словами</h3>
<p><code>lock</code> не умеет await — внутри него нельзя ждать асинхронно. <code>SemaphoreSlim</code> умеет: <code>await sem.WaitAsync()</code> — это асинхронная критическая секция. С <code>n = 1</code> он сериализует async-методы, с <code>n = k</code> ограничивает параллелизм.</p>
<h3>Каноническая форма</h3>
<pre>readonly SemaphoreSlim saveGate = new(1, 1);     <span class="cm">// мьютекс для async</span>

async Task SaveAsync(SaveData data, CancellationToken token)
{
    await saveGate.WaitAsync(token);             <span class="cm">// токен внутрь: ожидающий может уйти по отмене</span>
    try   { await File.WriteAllTextAsync(path, Serialize(data), token); }
    finally { saveGate.Release(); }              <span class="cm">// в finally — иначе исключение запирает всех навсегда</span>
}

readonly SemaphoreSlim downloads = new(4, 4);    <span class="cm">// не больше 4 загрузок одновременно на мобильном канале</span></pre>
<h3>Смежные примитивы</h3>
<p><b>Channel&lt;T&gt;</b> (bounded) — современная async-труба producer/consumer с backpressure: писатель ждёт, когда буфер полон. Чище BlockingCollection для async-мира.</p>
<p><b>TaskCompletionSource</b> — одноразовый сигнал: «ждать, пока инициализация завершится».</p>
<p><b>AsyncLocal</b> — протащить контекст (id запроса, игрока) через цепочку await без параметров.</p>
<h3>Игровые примеры</h3>
<p>Сериализация записи сейва (две записи подряд не должны перемешаться). Дросселирование загрузок Addressables. Гейт логин-последовательности от двойного тапа: <code>Wait(0)</code> возвращает false — второй тап игнорируется.</p>
<h3>Ловушки</h3>
<p>SemaphoreSlim <b>нереентрантен</b>: await того же семафора внутри удерживаемой секции — дедлок с самим собой. Он <code>IDisposable</code>. Справедливость очереди не гарантируется — долго ждущий может пропустить вперёд новых. И <code>Wait()</code> без Async на главном потоке — блокировка со всеми последствиями.</p>
<h3>Что сказать на собеседовании</h3>
<p>«SemaphoreSlim с WaitAsync — async-мьютекс и дроссель: WaitAsync с токеном, Release в finally. Нереентрантен. Для потоков данных — Channel с backpressure, для одноразовых сигналов — TCS».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/api/system.threading.semaphoreslim" target="_blank">Microsoft: SemaphoreSlim</a> <span>— API и замечания</span></li>
<li><a href="https://learn.microsoft.com/en-us/dotnet/core/extensions/channels" target="_blank">Microsoft: Channels</a> <span>— async producer/consumer</span></li>
</ul></div>`,

196: `<h3>Простыми словами</h3>
<p>Миграция на async — это не переписать всё за выходные. Это построить мост, по которому старый и новый код живут рядом, перевести листья, потом оркестрацию, потом убрать мост. На каждой фазе есть одна вещь, которую нужно сделать <i>до</i> масштабирования.</p>
<h3>Фаза 0 — примитив и прослойки</h3>
<p>Выбрать примитив: в Unity это UniTask — профиль аллокаций и интеграция с PlayerLoop решают. Написать interop: расширения, конвертирующие корутины (<code>ToUniTask</code>), UnityEvents и callback-API в awaitable через CompletionSource. Теперь оба мира могут вызывать друг друга.</p>
<pre><span class="cm">// Мост над легаси-загрузчиком</span>
public static UniTask&lt;Texture&gt; LoadAsync(this LegacyLoader l, string id, CancellationToken token)
{
    var tcs = new UniTaskCompletionSource&lt;Texture&gt;();
    l.Load(id, onDone: t => tcs.TrySetResult(t), onError: e => tcs.TrySetException(e));
    token.Register(() => tcs.TrySetCanceled());
    return tcs.Task;
}</pre>
<h3>Фаза 1 — листья</h3>
<p>Загрузки, запросы, таймеры. Публичные callback-сигнатуры сохраняются тонкими адаптерами над новым async-ядром — вызывающих не трогаем. <b>До масштабирования:</b> конвенция отмены (destroy-токены везде) и обработчик ненаблюдаемых исключений. Иначе первая же выгрузка сцены посреди загрузки даст класс багов, который потом ловить месяцами.</p>
<h3>Фаза 2 — оркестрация</h3>
<p>Логин, матчмейкинг, последовательность загрузки уровня — здесь async даёт больше всего: вложенные коллбэки становятся линейной последовательностью с try/catch и <code>WhenAll</code> для параллелизма. Это и момент, когда появляется настоящая обработка ошибок, которой в коллбэках обычно не было.</p>
<h3>Фаза 3 — убрать мост</h3>
<p>Удалить прослойки, закрепить анализатором: никаких новых <code>StartCoroutine</code> вне белого списка VFX и тайминга, никакого async void.</p>
<h3>Ловушки реальных миграций</h3>
<p>Расползание async void — запретить в первый день. Потерянная отмена при смене сцен — тестировать выгрузку сцены посреди каждого флоу. Двойное выполнение, когда старый callback-путь и новый async-путь срабатывают оба — kill switch на флоу: старый путь отключается флагом, а не удаляется сразу.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Мост из адаптеров, листья, оркестрация, убрать мост. До масштабирования — отмена и обработчик исключений. Запрет async void с первого дня, тест выгрузки сцены посреди каждого флоу, kill switch против двойного выполнения».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://github.com/Cysharp/UniTask" target="_blank">UniTask</a> <span>— ToUniTask, CompletionSource, Forget</span></li>
</ul></div>`,

197: `<h3>Простыми словами</h3>
<p>Иммутабельность покупает безопасность: объект, который не меняется, можно шарить между потоками и системами, не боясь, что кто-то испортит. Цена — новый объект на каждое изменение. В игре есть места, где эта цена копейки, и места, где она смертельна.</p>
<h3>Где окупается</h3>
<p><b>Конфиги и баланс.</b> Загрузили — заморозили. Любая система читает без локов, никто не может случайно изменить урон меча посреди боя.</p>
<p><b>Сетевые сообщения и события.</b> Снапшот состояния, который опоздавший подписчик не сможет изменить задним числом.</p>
<p><b>Модели сейвов во время сериализации.</b> Записать консистентное состояние, пока игра продолжает идти.</p>
<p><b>readonly-структуры в математике.</b> Vector3, Quaternion, результаты расчётов — копии дешёвые, защитных копий нет.</p>
<h3>Где слишком дорого</h3>
<p>Покадровое состояние симуляции. Иммутабельное обновление позиции — это новый объект; 60 Гц на тысячи сущностей — самоубийство по GC. Здесь правильная инженерия — <b>мутация с ясным владением</b>: одна система пишет, другие читают в определённых точках синхронизации. Это и есть модель ECS.</p>
<h3>Средний путь из практики</h3>
<pre><span class="cm">// Мутабельно внутри, иммутабельно наружу</span>
public sealed class EnemyRegistry
{
    readonly List&lt;Enemy&gt; enemies = new();
    public IReadOnlyList&lt;Enemy&gt; All => enemies;         <span class="cm">// представление, не копия</span>
    internal void Add(Enemy e) => enemies.Add(e);
}

<span class="cm">// Заморозить после сборки</span>
public sealed class LevelConfig
{
    bool frozen;
    public void Add(Room r) { if (frozen) throw new InvalidOperationException(); rooms.Add(r); }
    public void Freeze() => frozen = true;
}</pre>
<p>Плюс двойная буферизация состояния для чтения из другого потока: рендер читает кадр N, симуляция пишет N+1.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Иммутабельность — инструмент для границ шаринга: конфиги, события, сейвы, математика. Покадровое состояние — мутация с явным владением. Между ними — мутабельные пулы с иммутабельными представлениями и freeze после сборки».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/record" target="_blank">Microsoft: Records</a> <span>— иммутабельные типы с with</span></li>
</ul></div>`,

198: `<h3>Простыми словами</h3>
<p>Наследование отвечает на вопрос «кто ты?», композиция — «что ты умеешь?». Дизайнер просит плавающего врага, который стреляет, — и дерево <code>FlyingEnemy</code> / <code>ShootingEnemy</code> ломается, потому что способности сквозные и в дерево не ложатся. Композиция — это способности как детали, которые собираются в любой комбинации.</p>
<h3>Как выглядит провал</h3>
<pre>Entity → MovingEntity → Enemy → FlyingEnemy
                               → ShootingEnemy
<span class="cm">// FlyingShootingEnemy — от кого наследовать? Копировать Fire() из ShootingEnemy?</span></pre>
<h3>Четыре формы композиции в Unity</h3>
<p><b>1. Компоненты.</b> Сама модель Unity: <code>Movement</code>, <code>Health</code>, <code>Weapon</code> — прикрепить нужные. Летающий стрелок — это <code>FlyMovement</code> + <code>Weapon</code>.</p>
<p><b>2. Интерфейсы-способности.</b> <code>TryGetComponent&lt;IDamageable&gt;</code> — спросить, умеет ли объект, не зная, кто он.</p>
<p><b>3. Стратегии как данные.</b> ScriptableObject с поведением: <code>MovementStrategy</code> меняется в инспекторе, без кода.</p>
<pre>public abstract class MovementStrategy : ScriptableObject { public abstract void Move(Rigidbody rb, Vector3 input, float dt); }
public class Mover : MonoBehaviour { [SerializeField] MovementStrategy strategy; }   <span class="cm">// дизайнер подставляет Fly или Walk</span></pre>
<p><b>4. Стеки модификаторов.</b> Баффы — список <code>IStatModifier</code>, применяемый к базе, а не подклассы <code>PoisonedEnemy</code>.</p>
<h3>Где наследование уместно</h3>
<p>Неглубокие template-method фреймворки: абстрактный <code>WeaponBase</code> с sealed-потоком <code>Fire</code>, зовущим protected-хуки. Чисто-данные иерархии, отражающие реальную таксономию. Один уровень, не пять.</p>
<h3>Лакмус</h3>
<p>«Потребует ли следующая фича трогать базовый класс?» Если да — компонуйте. Если базовый класс стабилен годами — наследование в порядке.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Способности сквозные, дерево их не выражает. Компоненты, интерфейсы через TryGetComponent, стратегии в ScriptableObject, модификаторы списком. Наследование — для неглубоких каркасов с template method».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://gameprogrammingpatterns.com/component.html" target="_blank">Game Programming Patterns: Component</a> <span>— каноническое объяснение на игровом примере</span></li>
</ul></div>`,

199: `<h3>Простыми словами</h3>
<p>SOLID написан для бизнес-приложений, и в Unity его повторяют как мантру. Честное применение: каждый принцип имеет игровое прочтение, где он помогает, и догматическое, где он создаёт GetComponent-спагетти и хаос в инспекторе.</p>
<h3>По буквам</h3>
<p><b>S — единица ответственности, не метода.</b> MonoBehaviour с вводом + движением + звуком + UI — делим. Но пересплит в 15 однострочных поведений стоит связки GetComponent между ними и инспектора, в котором ничего не найти. Ответственность — «движение персонажа», не «чтение горизонтальной оси».</p>
<p><b>O — расширение данными.</b> Open/closed в играх достигается ScriptableObject-стратегиями и event-каналами: дизайнер добавляет новый тип атаки ассетом, код не меняется. Не наследованием.</p>
<p><b>L — редок, но реален.</b> <code>ReadOnlyInventory : Inventory</code>, бросающий на <code>Add</code>, ломает всех, кто принимает Inventory. Лечение — интерфейсы по способностям.</p>
<p><b>I — интерфейс размером со способность.</b> <code>IDamageable</code>, <code>ISaveable</code> — дёшево и идиоматично. <code>IGameManager</code> с 40 методами — мучение для тестов.</p>
<p><b>D — абстракции там, где нужны швы.</b> Сервисы, неткод, сейвы — за интерфейсом, чтобы подменить в тестах. Интерфейс для Vector3 — карго-культ. И сериализованные ссылки в инспекторе — это <i>и есть</i> внедрение зависимостей, только через редактор.</p>
<h3>Где догма вредит</h3>
<p>Абстракция ради абстракции: <code>IHealthProvider</code> с одной реализацией навсегда. Фабрики фабрик. Пять слоёв между кнопкой и действием. Всё это замедляет итерацию — главную валюту разработки игр.</p>
<h3>Мерило</h3>
<p>Цель SOLID — изменяемость при масштабе команды. В Unity это: малые компоненты, data-driven расширение, тестовые швы на границах систем. И одна проверка: следующая просьба дизайнера ложится без рефакторинга? Если да — архитектура правильная, сколько бы букв она ни нарушала.</p>
<h3>Что сказать на собеседовании</h3>
<p>«S — по ответственности, не по методу; O — через данные; L — интерфейсы по способностям; I — маленькие интерфейсы; D — швы на границах систем, а инспектор — уже DI. Мерило — ложится ли следующая фича без рефакторинга».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://unity.com/resources/level-up-your-code-with-game-programming-patterns" target="_blank">Unity: Level up your code with game programming patterns</a> <span>— официальная книга с SOLID в контексте Unity</span></li>
</ul></div>`,

200: `<h3>Простыми словами</h3>
<p>Четыре реализации — это четыре уровня сложности, и каждая следующая оправдана конкретным запахом предыдущей. Начинайте с простейшей и апгрейдьте, когда запах появился, а не заранее.</p>
<h3>1. Enum + switch</h3>
<pre>enum State { Idle, Walk, Jump }
State next = (state, input) switch
{
    (State.Idle, Input.Move) => State.Walk,
    (State.Idle, Input.Jump) => State.Jump,
    (State.Walk, Input.Stop) => State.Idle,
    (var s, _) => s,
};</pre>
<p>Ноль аллокаций, вся логика в одном файле, таблица переходов читается глазами. Для ≤7 состояний с простыми переходами — дверь, подбор, простой ИИ. <b>Запах:</b> копятся данные состояния (таймер прыжка, цель атаки) и логика enter/exit — switch превращается в простыню.</p>
<h3>2. Объекты-состояния</h3>
<pre>interface IState { void Enter(); void Tick(float dt); void Exit(); }
sealed class JumpState : IState { float t; public void Enter() { t = 0; } /* ... */ }</pre>
<p>Каждое состояние — класс со своими полями, Enter/Exit на месте, легко тестировать по одному. Цена: аллокация на состояние (создать один раз и переиспользовать) и переходы, размазанные по файлам. <b>Запах:</b> «при уроне → Stagger» скопировано в Walk, Run, Idle, Crouch.</p>
<h3>3. Иерархические (HSM)</h3>
<p>Состояния вкладываются: <code>Grounded</code> содержит Walk/Run/Idle, и переход «при уроне → Stagger» написан один раз в родителе. Стандартный ответ для реальных персонажей и ИИ — плоские машины взрываются комбинаторно. <b>Запах:</b> дизайнер хочет менять переходы сам и каждый раз ждёт программиста.</p>
<h3>4. Data-driven</h3>
<p>Таблица переходов или граф-ассет: редактируется в инспекторе, грузится в рантайме, сериализуется для неткода; код — только в действиях. Так устроены AI-мидлвары и Mecanim. Цена — инструментарий и отладка графа вместо кода.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Enum+switch, пока состояний мало; объекты, когда появляются данные и Enter/Exit; HSM, когда переходы дублируются; data-driven, когда итерирует дизайнер. Каждый апгрейд — по запаху, не заранее».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://gameprogrammingpatterns.com/state.html" target="_blank">Game Programming Patterns: State</a> <span>— от switch до HSM на одном примере</span></li>
</ul></div>`,

201: `<h3>Простыми словами</h3>
<p>API без аллокаций — это API, где память принадлежит вызывающему. Вы не создаёте результат — вы заполняете то, что вам дали. Все паттерны ниже — вариации этой идеи плюс способы не аллоцировать по дороге.</p>
<h3>Арсенал</h3>
<pre><span class="cm">// 1. Try-паттерн вместо исключений и nullable-возвратов</span>
public bool TryGetTarget(int id, out Target target);

<span class="cm">// 2. Буфер от вызывающего — форма NonAlloc-API физики Unity</span>
public int GetInRange(Vector3 pos, float r, List&lt;Enemy&gt; results);     <span class="cm">// Clear внутри, вернуть count</span>
public int GetInRange(Vector3 pos, float r, Span&lt;Enemy&gt; destination);

<span class="cm">// 3. readonly-структуры для параметров и результатов, in для больших</span>
public readonly struct HitInfo { public readonly Vector3 Point; public readonly float Damage; }
public void Apply(in HitInfo hit);

<span class="cm">// 4. Дженерик-ограничения вместо интерфейсных параметров</span>
public void Sort&lt;TComp&gt;(TComp comparer) where TComp : struct, IComparer&lt;Enemy&gt;;

<span class="cm">// 5. Коллбэки со state — вызывающий пишет static-лямбду</span>
public void ForEach&lt;TState&gt;(Action&lt;Enemy, TState&gt; action, TState state);

<span class="cm">// 6. Struct-энумератор — foreach без аллокаций</span>
public Enumerator GetEnumerator() => new(this);</pre>
<p>Внутри — <code>ArrayPool</code> и <code>stackalloc</code> для черновиков; результаты в поля-буферы, которые переиспользуются между вызовами.</p>
<h3>Контракты, которые компилятор не проверит</h3>
<p>Документируйте: кто владеет буфером; время жизни результата («валиден до следующего вызова» — частая форма для переиспользуемых буферов); привязку к потоку. Без этого API без аллокаций превращается в API с порчей данных.</p>
<h3>Правило честности</h3>
<p>Дайте и удобную аллоцирующую перегрузку с явной пометкой: <code>GetInRangeAlloc(...)</code> возвращает новый List. На холодных путях церемония с буферами — это трение, и люди начнут плохо оборачивать ваш API, вместо того чтобы использовать его.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Try-паттерн, буферы от вызывающего, readonly struct с in, ограничения вместо интерфейсов, state в коллбэках, struct-энумератор. Документирую владение и время жизни. И даю аллоцирующую перегрузку для холодных путей».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/ScriptReference/Physics.OverlapSphereNonAlloc.html" target="_blank">Unity: Physics.OverlapSphereNonAlloc</a> <span>— эталон буфера от вызывающего</span></li>
</ul></div>`,

202: `<h3>Простыми словами</h3>
<p>Процессор быстрый, память медленная, и разрыв между ними — в сотни раз. Всё, что делает DOD, — раскладывает данные так, чтобы процессор ждал память как можно реже. Аргумент не философский, а арифметический.</p>
<h3>Числа</h3>
<pre>L1 hit    ~4 такта
L2 hit    ~12 тактов
L3 hit    ~40 тактов
RAM       ~200+ тактов   <span class="cm">// один промах = десятки-сотни инструкций впустую</span></pre>
<h3>ООП-раскладка</h3>
<pre>List&lt;Enemy&gt; enemies;      <span class="cm">// массив указателей</span>
foreach (var e in enemies) e.pos += e.vel * dt;
<span class="cm">// каждый e — случайное место кучи → потенциальный промах на каждого (~200 тактов)</span>
<span class="cm">// плюс vtable/интерфейс для виртуальных вызовов — ещё прыжок</span></pre>
<h3>DOD-раскладка</h3>
<pre>struct Movement { public float3 pos, vel; }     <span class="cm">// 24 байта</span>
Movement[] movement;
for (int i = 0; i &lt; n; i++) movement[i].pos += movement[i].vel * dt;
<span class="cm">// данные подряд: одна 64-байтовая линия — 2-3 сущности; префетчер видит линейный скан и грузит вперёд</span>
<span class="cm">// тот же цикл, та же работа CPU — быстрее на порядок</span></pre>
<h3>Struct of Arrays</h3>
<p>Если система читает только pos и vel, а в структуре ещё 100 байт здоровья, имени и инвентаря — линии забиты холодными данными. SoA: отдельный массив на поле. Горячий цикл трогает только нужное, а SIMD-загрузки пакуются чисто: четыре <code>pos.x</code> подряд — одна инструкция. Именно это векторизует Burst.</p>
<h3>Честная граница</h3>
<p>DOD выигрывает на однородных массовых обновлениях: движение, снаряды, частицы, видимость. Штучная, ветвистая, насыщенная указателями геймплейная логика (диалоги, квесты, инвентарь) выигрывает мало и теряет выразительность. Практичная архитектура — ООП-оркестрация над DOD-горячими циклами, а не тотальная конверсия в ECS.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Промах в RAM ~200 тактов; массив указателей промахивается на каждом объекте, массив структур — одна линия на несколько сущностей и префетч. SoA убирает холодные поля и даёт SIMD. DOD — для массовых однородных циклов, ООП — для оркестрации».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://www.dataorienteddesign.com/dodbook/" target="_blank">Richard Fabian: Data-Oriented Design</a> <span>— книга целиком бесплатно</span></li>
<li><a href="https://docs.unity3d.com/Packages/com.unity.entities@latest" target="_blank">Unity Entities</a> <span>— DOD как архитектура движка</span></li>
</ul></div>`,

203: `<h3>Простыми словами</h3>
<p><code>unsafe</code> снимает с вас защиту рантайма: указатели, адресная арифметика, память без проверок границ. <code>UnsafeUtility</code> добавляет к этому аллокаторы Unity, <code>MemCpy</code> и реинтерпретацию типов. Это инструмент, который даёт скорость ценой класса ошибок, не воспроизводимых в редакторе, — поэтому правила важнее синтаксиса.</p>
<h3>Что открывает</h3>
<pre>unsafe
{
    <span class="cm">// Реинтерпретация без копии: массив вершин как байты для сетевого пакета</span>
    fixed (Vertex* p = vertices)
        Send((byte*)p, vertices.Length * sizeof(Vertex));

    <span class="cm">// Своя память с аллокатором Unity</span>
    void* buf = UnsafeUtility.Malloc(size, 16, Allocator.Persistent);
    UnsafeUtility.MemClear(buf, size);
    <span class="cm">// ... </span>
    UnsafeUtility.Free(buf, Allocator.Persistent);      <span class="cm">// у каждого Malloc — путь к Free</span>

    <span class="cm">// Указатель из NativeArray — для нативного плагина или Burst</span>
    float* data = (float*)array.GetUnsafePtr();
}</pre>
<h3>Когда оправдан</h3>
<p>Интероп с нативными плагинами. Реинтерпретация между blittable-раскладками (буферы мешей, сети, аудио) без копий. Свои аллокаторы и контейнеры для job/Burst-кода, где проверки safety-системы — <i>измеренное</i> узкое место. SIMD-дружественные операции с памятью, которые Burst прожуёт.</p>
<h3>Правила, сохраняющие шипабельность</h3>
<p><b>Маленькие листовые утилиты</b> за безопасными API — никогда inline в геймплее.</p>
<p><b>Владение.</b> У каждого Malloc есть владелец и Free; детекция утечек (<code>NativeLeakDetection.Mode = EnabledWithStackTrace</code>) в CI.</p>
<p><b>Документация предположений:</b> время жизни памяти, алиасинг, выравнивание.</p>
<p><b>Safety-проверки не выключать глобально.</b> <code>[NativeDisableContainerSafetyRestriction]</code> — точечно и с доказательством из профайлера. Проверки в редакторе существуют, чтобы поймать то, что на устройстве станет порчей памяти без стека.</p>
<h3>Что сказать на собеседовании</h3>
<p>«unsafe и UnsafeUtility — для интеропа, реинтерпретации и своих контейнеров под Burst. Живёт в маленьких тестируемых утилитах за безопасным API, с владением памяти и детекцией утечек в CI. Safety-проверки отключаю точечно, по профайлеру, а не “ради скорости”».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/ScriptReference/Unity.Collections.LowLevel.Unsafe.UnsafeUtility.html" target="_blank">Unity: UnsafeUtility</a> <span>— API низкоуровневой памяти</span></li>
<li><a href="https://docs.unity3d.com/Packages/com.unity.collections@latest" target="_blank">Unity Collections</a> <span>— safety-система и аллокаторы</span></li>
</ul></div>`,

204: `<h3>Простыми словами</h3>
<p>Managed-делегат — объект с целью и методом; Burst-код объектов не знает и вызвать его не может. Указатель на функцию — просто адрес, по которому можно прыгнуть инструкцией <code>calli</code>. Это способ дать Burst-коду выбор поведения в рантайме, не выходя из Burst-мира.</p>
<h3>Синтаксис C# 9</h3>
<pre>unsafe
{
    delegate*&lt;int, float, void&gt; fn = &amp;Apply;     <span class="cm">// адрес статического метода, без объекта</span>
    fn(1, 0.5f);                                   <span class="cm">// прямой calli</span>
}
static void Apply(int id, float dt) { }</pre>
<h3>Проблема, которую решает в Unity</h3>
<p>Джоб резолвит коллизии, и реакция зависит от типа материала: лёд, грязь, батут. Switch на все типы внутри джоба — негибко. Managed-делегат — нельзя. Решение: указатели на другие Burst-компилированные функции.</p>
<pre>[BurstCompile]
public static class Materials
{
    [BurstCompile] public static void Ice(ref ContactData c) { c.friction *= 0.1f; }
    [BurstCompile] public static void Mud(ref ContactData c) { c.velocityScale = 0.5f; }
}

<span class="cm">// Один раз при инициализации</span>
var ice = BurstCompiler.CompileFunctionPointer&lt;ContactHandler&gt;(Materials.Ice);
handlers[(int)MaterialKind.Ice] = ice;         <span class="cm">// NativeArray&lt;FunctionPointer&lt;ContactHandler&gt;&gt;</span>

<span class="cm">// В джобе</span>
handlers[contact.material].Invoke(ref contact);  <span class="cm">// Burst → Burst, без managed</span></pre>
<h3>Требования</h3>
<p>Только статические методы. <code>[BurstCompile]</code> на методе. Unmanaged-типы аргументов (структуры без ссылок, указатели, ref). Для AOT — дисциплина в духе <code>[MonoPInvokeCallback]</code>: метод должен существовать на момент сборки. Обратный P/Invoke (натив зовёт C#) использует ту же машинерию.</p>
<h3>Где встречается на практике</h3>
<p>Внутри пакетов Unity: Collections, Physics, Entities. Самим писать — при строительстве систем движкового уровня: плагинная физика, data-driven уравнения движения, пользовательские резолверы.</p>
<h3>Что сказать на собеседовании</h3>
<p>«delegate* — адрес без объекта, вызов через calli. В Unity это диспетчеризация Burst→Burst через CompileFunctionPointer: плагинные архитектуры внутри джобов. Статические методы с BurstCompile, unmanaged-аргументы. Инструмент редкий, но знать надо».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Packages/com.unity.burst@latest" target="_blank">Unity Burst</a> <span>— раздел Function pointers</span></li>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/unsafe-code#function-pointers" target="_blank">Microsoft: Function pointers</a> <span>— синтаксис и ограничения</span></li>
</ul></div>`,

205: `<h3>Простыми словами</h3>
<p>Вызов нативной функции из C# стоит двух вещей: перехода managed→native (настройка stack walk, смена GC-режима — десятки наносекунд) и маршалинга каждого аргумента. Первое — фиксированная цена за вызов, второе зависит от типов. Весь дизайн интеропа — сделать вызовов мало, а аргументы дешёвыми.</p>
<h3>Что дёшево, что дорого</h3>
<pre>[DllImport("physics_native")]
static extern void Step(float dt);                              <span class="cm">// blittable: почти бесплатно</span>

[DllImport("physics_native")]
static extern unsafe int Solve(Body* bodies, int count);        <span class="cm">// указатель + длина: без копий</span>

[DllImport("physics_native")]
static extern void SetName(string name);                        <span class="cm">// строка: конверсия UTF-16→ANSI/UTF-8, копия</span>

[DllImport("physics_native")]
static extern void Register(Action&lt;int&gt; callback);              <span class="cm">// делегат: thunk + пиннинг, не для горячего пути</span></pre>
<p>Blittable — <code>int</code>, <code>float</code>, указатели, структуры только из них: передаются как есть. Не-blittable — строки, массивы классов, <code>bool</code> (в C — int!), делегаты: маршалер конвертирует и копирует.</p>
<h3>Практики</h3>
<p><b>C-ABI вокруг blittable-структур и указателей с длинами.</b> Никаких C++-классов и STL через границу.</p>
<p><b>Батчить.</b> Один вызов на 1000 элементов, не 1000 вызовов: на мелких вызовах переход доминирует.</p>
<p><b>NativeArray через GetUnsafePtr</b> — без маршалинговой копии, память уже нативная.</p>
<p><b>Строки убрать из горячих путей.</b> Если неизбежно — UTF-8 байты с длиной.</p>
<p><b>Коллбэки из натива:</b> статический метод с <code>[MonoPInvokeCallback]</code> для IL2CPP; помнить, что он придёт на том потоке, который выбрал натив — класть в очередь для главного.</p>
<h3>Пакетирование и отладка</h3>
<p>.so / .a / .framework / .dll по архитектурам с верными import settings; на iOS при статической линковке имя библиотеки — <code>__Internal</code>. В development-билдах — обёртка с трекингом хэндлов и утечек; try/finally вокруг времени жизни нативных объектов.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Цена — переход плюс маршалинг. Blittable-структуры и указатели с длинами, батчи вместо мелких вызовов, NativeArray без копий, строки вне горячих путей, коллбэки через MonoPInvokeCallback с очередью в главный поток».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/NativePlugins.html" target="_blank">Unity Manual: Native plug-ins</a> <span>— пакетирование по платформам</span></li>
<li><a href="https://learn.microsoft.com/en-us/dotnet/standard/native-interop/best-practices" target="_blank">Microsoft: Native interoperability best practices</a> <span>— маршалинг и blittable-типы</span></li>
</ul></div>`,

206: `<h3>Простыми словами</h3>
<p>Source generator — код, который запускается внутри компилятора, читает ваш проект и дописывает к нему новый C#. Всё, что раньше делала рефлексия в рантайме (найти поля, сгенерировать сериализацию, собрать граф зависимостей), теперь делается один раз на компиляции. Для AOT/IL2CPP это не оптимизация, а единственный путь.</p>
<h3>Как выглядит</h3>
<pre><span class="cm">// Вы пишете</span>
[MemoryPackable]
public partial class PlayerState { public int Hp; public float3 Pos; }

<span class="cm">// Генератор дописывает в той же компиляции</span>
partial class PlayerState : IMemoryPackable&lt;PlayerState&gt;
{
    static void Serialize(ref Writer w, ref PlayerState v) { w.WriteUnmanaged(v.Hp); w.WriteUnmanaged(v.Pos); }
    <span class="cm">// попольно, без рефлексии, без boxing</span>
}</pre>
<p>Поэтому типы обязаны быть <code>partial</code>: генератор добавляет вторую часть.</p>
<h3>Где Unity использует это сама</h3>
<p>Netcode for GameObjects генерирует обвязку RPC из ваших методов с <code>[Rpc]</code>. Entities генерирует бойлерплейт систем и джобов из partial-типов с <code>[BurstCompile]</code> и <code>ISystem</code>. Сторонние: MemoryPack, MessagePack с генератором, VContainer (резолв зависимостей), R3.</p>
<h3>Анализаторы — read-only собрат</h3>
<p>Анализатор не пишет код, а проверяет и выдаёт диагностики компилятора. Правила команды превращаются в ошибки сборки: запрет аллокаций в покадровых сборках, «никакого Debug.Log в релизе», конвенции имён, запрет <code>?.</code> на UnityEngine.Object. Договорённости, которые проверяются, а не обсуждаются.</p>
<h3>Подключение в Unity</h3>
<p>DLL генератора или анализатора кладётся в проект с меткой <code>RoslynAnalyzer</code> в import settings; через asmdef можно ограничить сборки, к которым он применяется.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Генератор — кодогенерация на компиляции вместо рефлексии в рантайме: сериализаторы, RPC в NGO, системы в Entities, DI. Анализатор — правила команды как ошибки сборки. На вопрос “как убрать рефлексию из X под IL2CPP” ответ один — source generator».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/roslyn-analyzers.html" target="_blank">Unity Manual: Roslyn analyzers and source generators</a> <span>— как подключить</span></li>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/roslyn-sdk/source-generators-overview" target="_blank">Microsoft: Source generators</a> <span>— как написать свой</span></li>
</ul></div>`,

207: `<h3>Простыми словами</h3>
<p>Охота на аллокации — это не «убрать LINQ и строки». Это измерить, классифицировать, починить по приоритету, доказать и закрепить. Без последнего шага аллокации возвращаются через месяц с новым кодом.</p>
<h3>Шаг 1 — измерить правильно</h3>
<p>Development build на целевом устройстве (не редактор: там свои аллокации). Profiler → CPU → включить Allocation Call Stacks (Deep Profile не нужен, он искажает тайминги). Отсортировать кадр по колонке GC.Alloc. Timeline покажет, какая система владеет спайками.</p>
<h3>Шаг 2 — классифицировать</h3>
<p><b>Постоянные покадровые</b> — настоящий враг: строки, замыкания, LINQ, boxing, params-массивы, <code>new WaitForSeconds</code>, foreach через интерфейс.</p>
<p><b>На частоте событий</b> — обычно приемлемы: выстрел, открытие меню, смерть.</p>
<p><b>Загрузочные</b> — нормальны, но следить за ростом кучи: Boehm не сжимается, пик на загрузке — это навсегда.</p>
<h3>Шаг 3 — чинить по матожиданию</h3>
<p>Аллокация 100 байт на 60 Гц — это 6 КБ/с навсегда, и она важнее разовой на 1 МБ. Каждый фикс — захват до и после, иначе это вера, а не инженерия.</p>
<pre><span class="cm">// Типичные замены</span>
"Score: " + score            →  label.SetText("Score: {0}", score)
list.Where(...).First()      →  for + условие
enemies.ForEach(Handle)      →  закэшированный делегат или for
new WaitForSeconds(1f)       →  закэшированный экземпляр / таймер в Update
IEnumerable&lt;T&gt; параметр      →  List&lt;T&gt; / ReadOnlySpan&lt;T&gt;</pre>
<h3>Шаг 4 — держать линию</h3>
<p>Пакет Performance Testing в CI: <code>Measure.Method(...).GC()</code> утверждает ноль аллокаций на критических путях. Анализатор запрещает обычных подозреваемых в горячих сборках. Дашборд отслеживает частоту GC.Collect и размер кучи по билдам — регрессия видна в день появления.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Device + Allocation Call Stacks, сортировка по GC.Alloc. Три класса: покадровые, событийные, загрузочные. Чиню по матожиданию с захватом до/после. Закрепляю тестами на GC в CI и анализатором. Цель — ноль аллокаций в устоявшемся геймплее».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/ProfilerCPU.html" target="_blank">Unity Manual: CPU Profiler module</a> <span>— Allocation Call Stacks и колонки</span></li>
<li><a href="https://docs.unity3d.com/Packages/com.unity.test-framework.performance@latest" target="_blank">Unity Performance Testing</a> <span>— Measure.Method().GC()</span></li>
</ul></div>`,

208: `<h3>Простыми словами</h3>
<p>Половина «трюков оптимизации» из форумов нулевых — работа компилятора, которую он давно делает лучше вас. Вторая половина — решения, которые компилятор исправить не может: аллокации, раскладка данных, алгоритм. Знать, где граница, — и есть ответ.</p>
<h3>Мертво или пренебрежимо</h3>
<pre>x &lt;&lt; 1 вместо x * 2            <span class="cm">// компилятор делает сам</span>
ручная развёртка циклов          <span class="cm">// JIT и Burst делают сами, и лучше</span>
int n = list.Count; for (...)    <span class="cm">// в тривиальном цикле — JIT и так поднимет</span>
тернарник против if              <span class="cm">// одинаковый код</span>
++i против i++                   <span class="cm">// одинаковый код для int</span>
Abs через маску знака            <span class="cm">// компилятор знает</span></pre>
<h3>По-прежнему реально</h3>
<p><b>Устранение аллокаций.</b> В Unity доминирует над всем: одно скрытое замыкание в Update перевешивает сотню трюков со сдвигами.</p>
<p><b>Раскладка данных и порядок доступа.</b> Обход row-major, SoA, структуры поменьше: промах кэша — сотни инструкций, и компилятор ваши данные не переложит.</p>
<p><b>Алгоритмическая сложность.</b> <code>list.Contains</code> в цикле — O(n²), которую не спасёт ни один компилятор.</p>
<p><b>Вынос работы из кадра.</b> Прекомпьют, кэш, dirty-флаг, time-slicing: лучшая оптимизация — не делать.</p>
<p><b>sqrMagnitude вместо Distance.</b> Легитимно: sqrt — десятки тактов, и намерение «в радиусе» читается яснее.</p>
<p><b>Умножение на обратное вместо деления</b> — в действительно горячих внутренних циклах; проверять Burst Inspector-ом, Burst часто делает это сам.</p>
<h3>Мета-ответ</h3>
<p>Сначала профиль. Оптимизировать измеренный топ. Перемерить. И знать свой компилятор достаточно, чтобы не делать его работу хуже него — ручная развёртка может сломать векторизацию, которую Burst сделал бы сам.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Сдвиги, развёртка, ++i — мертвы. Реально: аллокации, раскладка данных, сложность, вынос из кадра, sqrMagnitude. Профиль, топ, перемерить — и не мешать компилятору».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Packages/com.unity.burst@latest" target="_blank">Unity Burst</a> <span>— Burst Inspector: смотреть, что компилятор сделал сам</span></li>
</ul></div>`,

209: `<h3>Простыми словами</h3>
<p>Событийная система без аллокаций — это шесть независимых решений, и каждое закрывает свой источник мусора: полезная нагрузка, диспетчеризация, хранение подписчиков, замыкания, реентрантность, время жизни. Вопрос популярен, потому что проверяет все темы разом.</p>
<h3>Решения по порядку</h3>
<pre><span class="cm">// 1. Полезная нагрузка — struct, readonly: без аллокаций, подписчик не изменит</span>
public readonly struct DamageDealt { public readonly int Target; public readonly float Amount; }

<span class="cm">// 2. Диспетчеризация — статический generic на тип события: список подписчиков без словаря</span>
public static class EventBus&lt;TEvent&gt; where TEvent : struct
{
    static IEventListener&lt;TEvent&gt;[] listeners = new IEventListener&lt;TEvent&gt;[16];
    static int count;

    <span class="cm">// 3. Хранение — предвыделенный массив, swap-remove, хэндл = индекс + версия</span>
    public static Handle Subscribe(IEventListener&lt;TEvent&gt; l) { /* grow x2 при переполнении */ }
    public static void Unsubscribe(Handle h) { /* проверка версии → use-after-unsubscribe детектируется */ }

    public static void Publish(in TEvent e)
    {
        <span class="cm">// 5. Реентрантность — снимок count, структурные изменения в отложенную очередь</span>
        int n = count;
        for (int i = 0; i &lt; n; i++) listeners[i].OnEvent(in e);
        ApplyDeferred();
    }
}

<span class="cm">// 4. Без замыканий — подписчик реализует интерфейс: делегата нет вовсе</span>
public interface IEventListener&lt;TEvent&gt; where TEvent : struct { void OnEvent(in TEvent e); }</pre>
<p>Если нужны делегаты — <code>Action&lt;TEvent&gt;</code>, созданный один раз в OnEnable и закэшированный в поле, не лямбда в точке подписки.</p>
<h3>Остальные решения</h3>
<p><b>6. Domain reload выключен:</b> статические списки сбрасываются через <code>[RuntimeInitializeOnLoadMethod(SubsystemRegistration)]</code>.</p>
<p><b>Потоки:</b> в dev-билдах ассерт «только главный»; производители из других потоков пишут в кольцевой буфер, разбираемый на главном.</p>
<p><b>Документация:</b> разрешены ли вложенные Publish в том же кадре, и что видит подписчик, подписавшийся во время рассылки.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Struct-события, статический generic-bus на тип, массив подписчиков с хэндлами индекс+версия, интерфейс вместо делегата, снимок count и отложенные изменения для реентрантности, сброс статики при выключенном domain reload, кольцевой буфер для других потоков».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://gameprogrammingpatterns.com/event-queue.html" target="_blank">Game Programming Patterns: Event Queue</a> <span>— реентрантность и отложенная обработка</span></li>
</ul></div>`,

210: `<h3>Простыми словами</h3>
<p>300 тысяч строк нельзя прочитать. Можно прочесать автоматически, найти структурные проблемы, измерить на устройстве и составить ранжированный бэклог. Предложение «переписать» — не результат аудита, а его провал.</p>
<h3>Шаг 1 — grep и анализаторы</h3>
<pre>FindObjectOfType|GameObject\.Find   в Update/LateUpdate   <span class="cm">// мины замедления кадра</span>
new WaitForSeconds|\+ "|\.Where\(    в покадровых методах  <span class="cm">// карта давления на GC</span>
static event|static .* [Ii]nstance                        <span class="cm">// инвентарь рисков утечек и domain reload</span>
\.Result|\.Wait\(\)                                       <span class="cm">// кандидаты в дедлоки</span>
Resources\.Load                                           <span class="cm">// археология модели памяти</span>
void Update\(\)\s*\{\s*\}                                 <span class="cm">// пустые Update: тысячи бессмысленных вызовов</span>
renderer\.material\b                                      <span class="cm">// утечки материалов + поломка батчинга</span>
catch \(Exception\)\s*\{\s*\}                             <span class="cm">// молча проглоченные исключения</span></pre>
<h3>Шаг 2 — структура</h3>
<p><b>Раскладка сборок.</b> Один asmdef на 300 тысяч строк — 40-секундная компиляция на каждую правку; разбивка по слоям часто самый выгодный фикс из доступных.</p>
<p><b>Протечка Editor-кода в рантайм.</b> <code>UnityEditor</code> под <code>#if</code> в геймплейных файлах — билд ломается на платформе.</p>
<p><b>Тестовая поверхность.</b> Обычно около нуля. Сначала characterization-тесты вокруг систем, которые придётся трогать: зафиксировать текущее поведение, потом менять.</p>
<h3>Шаг 3 — измерить</h3>
<p>Сессия профилирования на устройстве, чтобы сверить grep с реальностью. Настоящие топ-3 проблемы — обычно две, найденные grep-ом, и одна, которую находишь только измерением: та, о которой никто не подозревал.</p>
<h3>Результат</h3>
<p>Бэклог, ранжированный по риску × стоимости: что ломает игру сейчас, что сломает при росте, что просто некрасиво. Первые две недели — compile time и утечки; остальное — по мере касания. Переписывания работающих игр на 300 тысяч строк проваливаются чаще, чем сами игры.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Grep по известным минам, структура сборок и тестов, профиль на устройстве. Результат — ранжированный бэклог, не план переписывания. Первым делом — время компиляции и утечки: это то, что замедляет команду каждый день».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/ScriptCompilationAssemblyDefinitionFiles.html" target="_blank">Unity Manual: Assembly definitions</a> <span>— как разбивать сборки</span></li>
<li><a href="https://github.com/microsoft/Microsoft.Unity.Analyzers" target="_blank">Microsoft.Unity.Analyzers</a> <span>— готовые правила для grep-аудитов</span></li>
</ul></div>`,
};
