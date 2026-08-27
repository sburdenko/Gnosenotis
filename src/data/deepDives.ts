/**
 * "Deep dive" lesson bodies, keyed by question number. Extracted verbatim
 * from the legacy HTML app (only ~110 of the 310 questions have one).
 *
 * Each value is trusted, hand-authored HTML (headings, <pre> code blocks,
 * tip/warning callouts, a further-reading list) — never user input. See
 * `src/data/index.ts` for how this gets merged onto `questions`, and
 * `DeepDiveModal` for why rendering it with `dangerouslySetInnerHTML` is
 * safe *for this specific, static dataset*.
 */
export const deepDives: Record<number, string> = 
{
1:`
<h3>Простыми словами</h3>
<p>Представь два способа отдать другу документ: сделать <b>ксерокопию</b> (он получает свой экземпляр, твой оригинал в безопасности) или дать <b>ссылку на Google Doc</b> (вы оба смотрите на один и тот же документ, и его правки видны тебе). Struct — это ксерокопия, class — ссылка на общий документ. Вся разница в поведении, производительности и багах вытекает из этой одной идеи.</p>
<h3>Что происходит в памяти</h3>
<p>Когда ты пишешь <code>Vector3 b = a;</code> — все 12 байт копируются, и теперь есть два независимых вектора. Когда пишешь <code>Enemy e2 = e1;</code> — копируется только ссылка (8 байт), а объект Enemy один, и <code>e2.hp = 0</code> изменит его и для e1.</p>
<pre>Vector3 a = new Vector3(1, 2, 3);
Vector3 b = a;      <span class="cm">// копия: b — независимый вектор</span>
b.x = 99;           <span class="cm">// a.x всё ещё 1</span>

Enemy e1 = new Enemy();
Enemy e2 = e1;      <span class="cm">// копируется ссылка, объект один</span>
e2.hp = 0;          <span class="cm">// e1.hp тоже 0 — это тот же объект!</span></pre>
<p>Class всегда создаётся в куче (heap), и за ним следит сборщик мусора: когда никто больше не ссылается — GC его убирает, и это стоит времени. Struct живёт «внутри» того, кто его содержит: локальная переменная — на стеке, поле класса — внутри объекта этого класса, элемент массива — прямо в массиве. GC про structs вообще не думает — вот почему они бесплатны с точки зрения мусора.</p>
<h3>Почему это критично для игр</h3>
<p>Игра делает 60 кадров в секунду. Если каждый кадр создавать 1000 объектов-классов (например, снаряды или события), GC будет копить и периодически чистить этот мусор — и в этот момент кадр «замерзает» на несколько миллисекунд. Игрок видит рывок. Поэтому Unity сделала Vector3, Quaternion, Color, Ray, Bounds структурами: миллионы операций с ними в кадре не создают ни байта мусора.</p>
<h3>Ловушки</h3>
<p><b>Ловушка 1 — «изменил копию».</b> Самый частый баг новичка:</p>
<pre>transform.position.x = 5;  <span class="cm">// НЕ СКОМПИЛИРУЕТСЯ — и хорошо!</span>
<span class="cm">// position возвращает КОПИЮ Vector3. Менять копию бессмысленно.</span>
<span class="cm">// Правильно:</span>
var p = transform.position;
p.x = 5;
transform.position = p;</pre>
<p><b>Ловушка 2 — большие структуры.</b> Каждая передача в метод — копия. Структура на 100 байт, передаваемая тысячи раз за кадр, съест больше, чем сэкономила на GC. Ориентир Microsoft: struct до ~16 байт, на практике в играх — до 32-48, если передавать по <code>in</code>.</p>
<p><b>Ловушка 3 — boxing.</b> Положил struct в переменную типа <code>object</code> или интерфейса — он «упаковался» в объект на куче, и все преимущества исчезли (подробнее в вопросе №2).</p>
<h3>Что сказать на собеседовании</h3>
<p>Не просто «struct на стеке, class в куче» (это неточно — см. вопрос №133), а: «struct копируется по значению и не создаёт работы для GC, class разделяется по ссылке и живёт в куче. В горячем игровом коде я выбираю struct для маленьких, короткоживущих данных без наследования — как это делает сам Unity с математическими типами».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/choosing-between-class-and-struct" target="_blank">Microsoft: Choosing Between Class and Struct</a> <span>— официальные критерии выбора, короткий чеклист</span></li>
<li><a href="https://jonskeet.uk/csharp/memory.html" target="_blank">Jon Skeet: Memory in .NET</a> <span>— лучшее объяснение «что где живёт» без мифов</span></li>
<li><a href="https://docs.unity3d.com/Manual/performance-garbage-collection-best-practices.html" target="_blank">Unity Manual: GC best practices</a> <span>— как это применяется именно в Unity</span></li>
<li><a href="https://sharplab.io/" target="_blank">SharpLab</a> <span>— вставь код и посмотри, во что компилятор его превращает</span></li>
</ul></div>`,

2:`
<h3>Простыми словами</h3>
<p>Boxing — это когда обычное число (или любой struct) «заворачивают в коробку» и кладут на кучу. int весит 4 байта и живёт на стеке — быстро и бесплатно. Но как только ты присваиваешь его переменной типа <code>object</code>, рантайм создаёт на куче объект-обёртку, копирует туда число — и вот у тебя уже мусор, который GC потом придётся убирать. Одна упаковка — копейки. Но в игре, где это происходит тысячи раз в кадр, копейки превращаются в фризы.</p>
<pre>int n = 42;
object o = n;      <span class="cm">// BOXING: аллокация ~24 байта на куче</span>
int back = (int)o; <span class="cm">// unboxing: распаковка обратно + проверка типа</span></pre>
<h3>Где boxing прячется (это главное!)</h3>
<p>Явный boxing почти никто не пишет. Опасен скрытый:</p>
<pre><span class="cm">// 1. Строки и числа</span>
Debug.Log("HP: " + hp);          <span class="cm">// hp (int) боксится в object</span>
string.Format("{0}", score);      <span class="cm">// score боксится</span>

<span class="cm">// 2. Struct через интерфейс</span>
IComparable c = 5;                <span class="cm">// int упакован</span>

<span class="cm">// 3. Не-generic коллекции (легаси)</span>
ArrayList list = new ArrayList();
list.Add(42);                     <span class="cm">// упаковка каждого элемента</span>

<span class="cm">// 4. Enum как ключ словаря на старом Mono</span>
dict[MyEnum.Value] = x;           <span class="cm">// мог боксить ключ при каждом обращении</span>

<span class="cm">// 5. params object[]</span>
Debug.LogFormat("{0} {1}", a, b); <span class="cm">// массив + бокс каждого аргумента</span></pre>
<h3>Почему это больно именно в Unity</h3>
<p>GC Unity (Boehm) не поколенческий: он не умеет дёшево убирать «молодой» мусор, как серверный .NET. Каждая упаковка — это навсегда занятые байты кучи до следующей полной сборки. 100 боксов в кадр × 60 кадров = 6000 объектов мусора в секунду, и через минуту-другую GC устраивает «уборку» на несколько миллисекунд посреди боя.</p>
<h3>Как найти и починить</h3>
<p>Profiler → CPU → колонка <b>GC Alloc</b> → включи Allocation Call Stacks. Любая строка с аллокацией в Update-путях — кандидат. Лечение по ситуации: generic-коллекции вместо ArrayList, <code>IEquatable&lt;T&gt;</code> на структурах-ключах, числовые перегрузки (<code>SetText</code> в TMP), кэш строк, интерполяцию строк — вон из Update.</p>
<div class="tip"><b>Правило команды:</b> ноль GC Alloc в устоявшемся геймплее. Не «мало», а ноль — тогда регрессии видны мгновенно.</div>
<h3>Что сказать на собеседовании</h3>
<p>«Boxing — это скрытая аллокация при превращении value type в object или интерфейс. Я знаю его типичные источники — конкатенация строк с числами, struct через интерфейс, params object[] — и ищу его профайлером по колонке GC Alloc, потому что в Unity каждый бокс — это вклад в будущий спайк GC».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing" target="_blank">Microsoft: Boxing and Unboxing</a> <span>— короткая официальная база с IL</span></li>
<li><a href="https://docs.unity3d.com/Manual/performance-garbage-collection-best-practices.html" target="_blank">Unity: GC best practices</a> <span>— раздел про скрытые аллокации</span></li>
<li><a href="https://www.jacksondunstan.com/" target="_blank">JacksonDunstan.com</a> <span>— сотни микро-разборов производительности C# в Unity, ищи «boxing»</span></li>
<li><a href="https://sharplab.io/" target="_blank">SharpLab</a> <span>— вставь свой код и найди инструкцию box в IL</span></li>
</ul></div>`,

3:`
<h3>Простыми словами</h3>
<p>Сборщик мусора — это уборщик, который ходит по куче и выбрасывает объекты, на которые больше никто не ссылается. Проблема в том, <i>как</i> уборщик Unity это делает: он говорит «все замерли!», обходит ВСЮ кучу, помечает живых, выбрасывает мёртвых — и только потом игра продолжается. Если куча большая, эта пауза заметна глазом: игра «икает».</p>
<h3>Чем GC Unity отличается от «взрослого» .NET</h3>
<ul>
<li><b>Не поколенческий.</b> Серверный .NET знает: почти весь мусор — «молодой» (создан только что), и чистит в основном молодое поколение — быстро. Boehm в Unity каждый раз сканирует всё.</li>
<li><b>Не сжимающий.</b> .NET после уборки сдвигает живые объекты вплотную (дефрагментация). Boehm оставляет дыры. Куча фрагментируется, и новая большая аллокация может не влезть в дыры — куча растёт.</li>
<li><b>Куча не отдаётся ОС.</b> Выросла до 500 МБ во время загрузки — примерно такой и останется.</li>
</ul>
<div class="warn"><b>Вывод из этих трёх фактов:</b> в Unity нельзя «просто аллоцировать, GC разберётся». Стратегия одна — не создавать мусор в цикле игры вообще.</div>
<h3>Incremental GC — что он меняет</h3>
<p>С Unity 2019 паузу можно «нарезать»: вместо одной остановки на 10 мс — двадцать остановок по 0.5 мс, распределённых по кадрам. Работает через write barriers: движок отслеживает, не поменял ли твой код ссылки между кусочками разметки. Важно понимать: <b>общий объём работы не уменьшился</b> — он размазался. Если ты аллоцируешь много, инкрементальный GC превратит один большой фриз в постоянную фоновую нагрузку. Это лучше, но не бесплатно.</p>
<h3>Практическая стратегия (по приоритету)</h3>
<pre><span class="cm">1. Не аллоцировать в кадре: пулы, кэши, структуры,</span>
<span class="cm">   переиспользуемые списки (list.Clear() вместо new List)</span>
<span class="cm">2. Аллоцировать заранее: прогрев пулов на загрузке,</span>
<span class="cm">   capacity у List/Dictionary/StringBuilder сразу</span>
<span class="cm">3. Управлять моментом уборки: GC.Collect() на экране</span>
<span class="cm">   загрузки, GarbageCollector.GCMode = Disabled на время</span>
<span class="cm">   боя (осторожно: куча растёт!)</span></pre>
<h3>Что сказать на собеседовании</h3>
<p>«Unity использует Boehm — не поколенческий и не сжимающий, поэтому цена сборки растёт с размером кучи, а фрагментация вечна. Incremental GC размазывает паузу по кадрам через write barriers, но не уменьшает работу. Моя стратегия — ноль аллокаций в геймплее и контролируемые сборки на границах: загрузка, пауза, смерть».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/performance-garbage-collector.html" target="_blank">Unity Manual: Garbage collector</a> <span>— как он устроен, официально</span></li>
<li><a href="https://blog.unity.com/technology/feature-preview-incremental-garbage-collection" target="_blank">Unity Blog: Incremental GC</a> <span>— зачем сделали и как работает, с графиками</span></li>
<li><a href="https://www.hboehm.info/gc/" target="_blank">Boehm GC</a> <span>— сайт самого коллектора, для глубины</span></li>
<li><a href="https://unity.com/resources" target="_blank">Unity e-book: Ultimate guide to profiling</a> <span>— глава про память и GC</span></li>
</ul></div>`,

4:`
<h3>Простыми словами</h3>
<p>Замыкание — это когда лямбда «берёт с собой» переменные из окружающего кода. Удобно: пишешь <code>() =&gt; score + bonus</code> и оно «помнит» score и bonus. Но магии нет — компилятору нужно куда-то положить эти переменные, чтобы они пережили выход из метода. И он тихо создаёт для них <b>класс</b> (display class) на куче. Плюс объект делегата. Две аллокации там, где ты видишь одну стрелочку.</p>
<h3>Во что компилятор превращает лямбду</h3>
<pre><span class="cm">// Ты пишешь:</span>
void Fire(int damage) {
    enemies.ForEach(e =&gt; e.TakeHit(damage));
}

<span class="cm">// Компилятор генерирует примерно это:</span>
class DisplayClass {          <span class="cm">// ← аллокация 1 (на куче!)</span>
    public int damage;
    public void Lambda(Enemy e) { e.TakeHit(damage); }
}
void Fire(int damage) {
    var dc = new DisplayClass();
    dc.damage = damage;
    enemies.ForEach(new Action&lt;Enemy&gt;(dc.Lambda)); <span class="cm">// ← аллокация 2</span>
}</pre>
<p>Вызови Fire каждый кадр — и получишь 120 объектов мусора в секунду на ровном месте. А если лямбда захватывает <code>this</code> и подписывается на долгоживущее событие — display class держит ссылку на твой объект, и вот уже утечка.</p>
<h3>Три уровня лямбд по цене</h3>
<pre><span class="cm">// БЕСПЛАТНО: ничего не захватывает — компилятор кэширует</span>
list.RemoveAll(e =&gt; e == null);

<span class="cm">// ДОРОГО: захватывает локальную переменную → display class</span>
list.RemoveAll(e =&gt; e.id == targetId);

<span class="cm">// ЗАЩИТА: static-лямбда (C# 9) — захват = ошибка компиляции</span>
list.RemoveAll(static e =&gt; e == null);</pre>
<h3>Как жить без захвата в горячем коде</h3>
<p>Паттерн «передай состояние явно»: API принимает и лямбду, и данные для неё — тогда лямбда может быть static, а данные едут отдельным параметром. Так устроены многие методы BCL и UniTask:</p>
<pre><span class="cm">// вместо захвата this:</span>
token.Register(static s =&gt; ((MyClass)s).Cleanup(), this);</pre>
<p>Второй путь — кэшировать делегат один раз в поле в Awake и переиспользовать. Третий — просто написать цикл for: в горячем коде он честнее любого ForEach.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Лямбда без захвата кэшируется и бесплатна; захват локалов или this порождает display class + делегат — две аллокации на вызов. В Update-путях я использую static-лямбды с явной передачей состояния, кэширую делегаты в полях, а подписки с захватом this обязательно снимаю в OnDisable, иначе display class утащит объект в утечку».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/lambda-expressions" target="_blank">Microsoft: Lambda expressions</a> <span>— база + раздел про захват переменных</span></li>
<li><a href="https://sharplab.io/" target="_blank">SharpLab</a> <span>— главный инструмент: вставь лямбду и УВИДЬ display class своими глазами</span></li>
<li><a href="https://www.jacksondunstan.com/articles/3765" target="_blank">JacksonDunstan: Closures</a> <span>— разбор цены замыканий именно в Unity</span></li>
<li><a href="https://github.com/Cysharp/UniTask#allocation-free" target="_blank">UniTask README</a> <span>— посмотри, как выглядит allocation-free API со state-параметрами</span></li>
</ul></div>`,

5:`
<h3>Простыми словами</h3>
<p>Корутина — это метод, который умеет «поставить себя на паузу» и продолжиться позже. Пишешь <code>yield return null</code> — метод замирает, Unity рисует кадр, а в следующем кадре метод продолжается ровно с того места. Выглядит как магия, но под капотом — обычный компиляторный трюк плюс список в движке.</p>
<h3>Как это работает на самом деле</h3>
<p>Шаг 1: компилятор C# видит <code>yield</code> и переписывает твой метод в класс-стейтмашину. Локальные переменные становятся полями (чтобы пережить паузу), а тело метода — большим switch по «где мы остановились»:</p>
<pre>IEnumerator Attack() {
    Swing();                              <span class="cm">// состояние 0</span>
    yield return new WaitForSeconds(0.5f);
    DealDamage();                         <span class="cm">// состояние 1</span>
    yield return null;
    Recover();                            <span class="cm">// состояние 2</span>
}
<span class="cm">// Превращается в класс с полями и MoveNext() со switch(state).</span>
<span class="cm">// StartCoroutine() просто отдаёт этот объект Unity.</span></pre>
<p>Шаг 2: Unity хранит энумератор в списке и раз в кадр зовёт <code>MoveNext()</code>. А то, что ты вернул через yield, — это инструкция «когда меня продолжить»: <code>null</code> — в следующем кадре после Update; <code>WaitForSeconds</code> — когда истечёт таймер; <code>WaitForEndOfFrame</code> — после рендера; <code>WaitForFixedUpdate</code> — в цикле физики.</p>
<h3>Цена и ловушки</h3>
<ul>
<li><b>Аллокации:</b> сама стейтмашина + каждый <code>new WaitForSeconds()</code>. В цикле — кэшируй: <code>var wait = new WaitForSeconds(0.5f);</code> один раз, yield его многократно.</li>
<li><b>Молчаливая смерть:</b> выключил GameObject (SetActive(false)) — все его корутины <b>остановились навсегда</b> и никто не скажет. Логика оборвалась на середине: пол-урона нанесено, бафф не снят. Это баг-фабрика №1 у корутин.</li>
<li><b>Нет результата и ошибок:</b> корутина не может вернуть значение, а исключение внутри убивает её без внятного стека у вызывающего. Нет и отмены (только StopCoroutine по ссылке).</li>
<li><b>yield в try/catch нельзя</b> (только try/finally) — обработка ошибок кривая по определению.</li>
</ul>
<div class="warn"><b>Правило:</b> корутины — для простых визуальных секвенций, привязанных к жизни объекта (мигание, задержка анимации). Всё, где есть результат, ошибки или отмена, — это работа для async/UniTask (вопрос №6).</div>
<h3>Что сказать на собеседовании</h3>
<p>«Корутина — это компиляторная стейтмашина IEnumerator, которую Unity пампит раз в кадр через MoveNext в точке player loop, зависящей от yield-инструкции. Знаю цену: аллокация стейтмашины и WaitForSeconds, тихая остановка при деактивации объекта, отсутствие результатов и исключений — поэтому для настоящей асинхронности беру UniTask».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/Coroutines.html" target="_blank">Unity Manual: Coroutines</a> <span>— официальная база + страница про yield-инструкции</span></li>
<li><a href="https://docs.unity3d.com/Manual/ExecutionOrder.html" target="_blank">Unity: Order of execution</a> <span>— диаграмма player loop: найди на ней все точки корутин</span></li>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/iterators" target="_blank">Microsoft: Iterators</a> <span>— как yield превращается в стейтмашину (это тот же механизм)</span></li>
<li><a href="https://sharplab.io/" target="_blank">SharpLab</a> <span>— вставь метод с yield и посмотри сгенерированный класс</span></li>
</ul></div>`,
6:`
<h3>Простыми словами</h3>
<p>Есть три способа сказать «сделай это, а потом вот это»: корутина (старый способ Unity), async/await (способ C#) и UniTask (async, переделанный под игры). Различаются они тем, умеют ли возвращать результат, ловить ошибки, отменяться — и сколько мусора создают.</p>
<h3>Сравнение на одном примере</h3>
<pre><span class="cm">// КОРУТИНА: результат некуда деть, ошибку не поймать</span>
IEnumerator LoadLevel() {
    yield return SceneManager.LoadSceneAsync("Boss");
    <span class="cm">// вернуть "успех/провал" вызывающему? Никак.</span>
}

<span class="cm">// ASYNC/AWAIT: результат и try/catch есть</span>
async Task&lt;bool&gt; LoadLevel() {
    try { await SceneManager.LoadSceneAsync("Boss"); return true; }
    catch (Exception e) { Log(e); return false; }
}
<span class="cm">// но: Task — аллокация, и после выгрузки сцены он ПРОДОЛЖИТ</span>
<span class="cm">// выполняться — сам не остановится, как корутина</span>

<span class="cm">// UNITASK: то же, но почти без аллокаций и со смертью вместе с объектом</span>
async UniTask&lt;bool&gt; LoadLevel(CancellationToken ct) {
    await SceneManager.LoadSceneAsync("Boss").WithCancellation(ct);
    return true;
}
<span class="cm">// ct = this.GetCancellationTokenOnDestroy() — умер объект, умерла операция</span></pre>
<h3>Ключевые различия, которые спрашивают</h3>
<ul>
<li><b>Жизненный цикл.</b> Корутина умирает с объектом (иногда это хорошо, но молча). Task живёт сам по себе — и после смены сцены доделает работу и постучится к мёртвым объектам. UniTask решает это токенами отмены.</li>
<li><b>Аллокации.</b> Корутина: стейтмашина + yield-объекты. Task: стейтмашина + объект Task. UniTask: struct-based, пулы внутри — около нуля.</li>
<li><b>Поток.</b> После await с обычным Task ты вернёшься в главный поток Unity (через SynchronizationContext) — но с задержкой на прокачку. UniTask планирует продолжения прямо в PlayerLoop — быстрее и предсказуемее.</li>
<li><b>Ошибки.</b> Исключение в корутине — лог и тишина. В async — летит к await-ящему, ловится try/catch, можно централизованно обработать.</li>
</ul>
<div class="tip"><b>Практическое правило:</b> визуальный тайминг на объекте (мигнуть, подождать полсекунды в анимации) — корутина не грех. Всё, у чего есть результат, ошибка или отмена — загрузка, сеть, диалоги, секвенции геймплея — UniTask.</div>
<h3>Что сказать на собеседовании</h3>
<p>«Корутины — покадровый секвенсор без результатов и ошибок; async/await даёт композицию и try/catch, но Task аллоцирует и не привязан к жизни объекта; UniTask — струкурный async под PlayerLoop с токенами из GetCancellationTokenOnDestroy. В проде: UniTask для логики, корутины максимум для VFX-тайминга».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://github.com/Cysharp/UniTask" target="_blank">UniTask (GitHub)</a> <span>— README сам по себе отличный учебник по async в Unity</span></li>
<li><a href="https://docs.unity3d.com/6000.0/Documentation/Manual/async-await-support.html" target="_blank">Unity Manual: Await support / Awaitable</a> <span>— встроенный await-класс Unity 2023+, знать о его существовании</span></li>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/" target="_blank">Microsoft: Async programming</a> <span>— общая модель async/await</span></li>
<li><a href="https://cysharp.github.io/UniTask/" target="_blank">UniTask docs</a> <span>— API-справочник с примерами</span></li>
</ul></div>`,

7:`
<h3>Простыми словами</h3>
<p>Твой C# сначала компилируется в IL — «полуфабрикат», байт-код. Дальше два пути превратить его в машинный код: <b>Mono</b> делает это на лету, пока игра работает (JIT — just in time), а <b>IL2CPP</b> — заранее, при сборке: переводит весь IL в C++ и компилирует обычным C++-компилятором (AOT — ahead of time). Это как переводчик-синхронист против заранее переведённой книги: синхронист гибче (может перевести что угодно на месте), книга — быстрее и надёжнее, но перевести надо ВСЁ до печати.</p>
<h3>Почему это важно</h3>
<ul>
<li><b>Выбора часто нет:</b> iOS запрещает генерацию кода в рантайме (безопасность), консоли и WebGL тоже — там только IL2CPP. Mono остаётся на Windows/Android как вариант для быстрой итерации.</li>
<li><b>Скорость:</b> IL2CPP-код обычно быстрее — C++-компилятор оптимизирует без спешки, всей программой.</li>
<li><b>Сборка:</b> IL2CPP собирается в разы дольше (перевод + компиляция C++) и бинарь больше. Дев-итерации на Mono, релизы на IL2CPP — обычный компромисс на Android.</li>
</ul>
<h3>Что ломается под IL2CPP (главная часть вопроса)</h3>
<p>Раз весь код должен существовать до запуска, ломается всё, что создаёт код на лету:</p>
<pre><span class="cm">// 1. Reflection.Emit, Expression.Compile — генерация кода. Мертвы.</span>
var f = Expression.Lambda&lt;Func&lt;int&gt;&gt;(body).Compile(); <span class="cm">// краш/интерпретатор</span>

<span class="cm">// 2. Дженерик, который AOT не «увидел» на компиляции</span>
<span class="cm">// Активация только через рефлексию → кода может не быть в билде</span>
Activator.CreateInstance(typeof(Handler&lt;&gt;).MakeGenericType(t));

<span class="cm">// 3. Типы, используемые ТОЛЬКО через рефлексию,</span>
<span class="cm">// вырезает стриппер (см. вопрос №8) → MissingMethodException</span></pre>
<p>Лечение: source generators вместо рантайм-кодогенерации, явные «AOT-хинты» (фиктивный метод, где перечислены нужные инстанциации дженериков), link.xml и [Preserve] против стриппинга, и проверка каждой сторонней библиотеки: «а она не на Expression.Compile построена?»</p>
<div class="warn"><b>Золотое правило:</b> «работает в редакторе» ничего не говорит про iOS — редактор всегда Mono/JIT. Всё, что связано с рефлексией и дженериками, тестируй на устройстве в IL2CPP-сборке.</div>
<h3>Что сказать на собеседовании</h3>
<p>«Mono — JIT, IL2CPP — AOT через C++. IL2CPP обязателен на iOS/консолях/WebGL, быстрее в рантайме, но дольше собирается, и в нём мертво всё, что генерирует код на лету: Reflection.Emit, Expression.Compile, рефлексивные дженерики. Мой чеклист: source generators, AOT-хинты, link.xml, и обязательный smoke-тест IL2CPP-билда на устройстве».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/IL2CPP.html" target="_blank">Unity Manual: IL2CPP</a> <span>— обзор пайплайна</span></li>
<li><a href="https://docs.unity3d.com/Manual/ScriptingRestrictions.html" target="_blank">Unity: Scripting restrictions</a> <span>— точный список того, что не работает под AOT — главная страница по теме</span></li>
<li><a href="https://blog.unity.com/technology/an-introduction-to-ilcpp-internals" target="_blank">Unity Blog: IL2CPP internals</a> <span>— серия про то, как выглядит сгенерированный C++</span></li>
</ul></div>`,

8:`
<h3>Простыми словами</h3>
<p>Твой билд тащит за собой тонну библиотечного кода, из которого реально используется процентов десять. Стриппер (UnityLinker) — это упаковщик чемодана: он анализирует, до какого кода можно «дотянуться» из твоих сцен и скриптов, а всё остальное выбрасывает. Бинарь худеет на мегабайты. Проблема: упаковщик не видит вещи, которые ты достаёшь «по имени» — через рефлексию, десериализацию, строки. Он honestly думает, что это не нужно — и выбрасывает то, что понадобится в рантайме.</p>
<h3>Как проявляется</h3>
<pre><span class="cm">// В редакторе работает. В билде:</span>
<span class="cm">// MissingMethodException: no constructor for Type 'PlayerData'</span>
var data = JsonUtility.FromJson&lt;PlayerData&gt;(json);
<span class="cm">// Если PlayerData нигде не создаётся через new в «видимом» коде —</span>
<span class="cm">// стриппер вырезал конструктор/сеттеры.</span></pre>
<p>Типичные жертвы: модели JSON-десериализации, типы, создаваемые DI-контейнером, классы, на которые ссылаются только Addressables/AssetBundles, коллбэки нативных SDK, generic-инстанциации через рефлексию.</p>
<h3>Инструменты защиты</h3>
<pre><span class="cm">// 1. [Preserve] — точечно на тип/метод/поле</span>
using UnityEngine.Scripting;
[Preserve] public class PlayerData { ... }

<span class="cm">// 2. link.xml — декларативно, на сборку/неймспейс/тип</span>
&lt;linker&gt;
  &lt;assembly fullname="MyGame.Models" preserve="all"/&gt;
  &lt;assembly fullname="ThirdParty.SDK"&gt;
    &lt;type fullname="ThirdParty.SDK.Callbacks" preserve="all"/&gt;
  &lt;/assembly&gt;
&lt;/linker&gt;

<span class="cm">// 3. Уровень агрессии: Player Settings → Managed Stripping Level</span>
<span class="cm">//    Minimal / Low / Medium / High — чем выше, тем меньше бинарь</span>
<span class="cm">//    и тем больше шансов на сюрприз</span></pre>
<h3>Правильный процесс</h3>
<ul>
<li>Начни с Low, поднимай уровень постепенно, гоняя полный smoke-тест билда после каждого шага.</li>
<li>link.xml держи рядом с кодом, который он защищает (можно несколько файлов по сборкам), и комментируй, ЗАЧЕМ каждая запись — иначе через год никто не решится её удалить.</li>
<li>В CI обязателен прогон именно release-билда со стриппингом: редактор и development-билд эти баги не ловят.</li>
</ul>
<h3>Что сказать на собеседовании</h3>
<p>«Стриппинг — статический анализ достижимости: всё, до чего линкер не дотянулся по ссылкам, вырезается, поэтому рефлексия и десериализация — главные жертвы, а падает это только в билде как MissingMethodException. Защита: [Preserve] точечно, link.xml для сборок, разумный stripping level, и smoke-тест стрипнутого билда в CI».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/ManagedCodeStripping.html" target="_blank">Unity Manual: Managed code stripping</a> <span>— главная страница: уровни, link.xml, аннотации</span></li>
<li><a href="https://docs.unity3d.com/ScriptReference/Scripting.PreserveAttribute.html" target="_blank">PreserveAttribute</a> <span>— что именно сохраняет и куда вешать</span></li>
<li><a href="https://docs.unity3d.com/Manual/IL2CPP-BytecodeStripping.html" target="_blank">Unity: Bytecode stripping в IL2CPP</a> <span>— как стриппинг взаимодействует с AOT</span></li>
</ul></div>`,

9:`
<h3>Простыми словами</h3>
<p>Сериализация — это то, как Unity превращает твои объекты в данные на диске (сцены, префабы, ассеты) и обратно. Каждый раз, когда инспектор показывает поле, когда сцена сохраняется, когда играешь префаб — работает сериализатор. Он простой и быстрый, но у него жёсткие правила, и половина «почему моё поле не сохраняется?!» — это они.</p>
<h3>Правила: что сериализуется</h3>
<pre>public class Enemy : MonoBehaviour {
    public int hp;                    <span class="cm">// ✔ public</span>
    [SerializeField] float speed;     <span class="cm">// ✔ private + атрибут</span>
    public int Level { get; set; }    <span class="cm">// ✘ свойство — никогда</span>
    [NonSerialized] public int temp;  <span class="cm">// ✘ явно исключено</span>
    static int count;                 <span class="cm">// ✘ static</span>
    readonly int id = 5;              <span class="cm">// ✘ readonly</span>
    public Dictionary&lt;int,Item&gt; inv;  <span class="cm">// ✘ словарь — нет</span>
    public IWeapon weapon;            <span class="cm">// ✘ интерфейс — нет*</span>
    public Item item;                 <span class="cm">// ✔ если [Serializable]</span>
    public List&lt;Item&gt; items;          <span class="cm">// ✔ списки и массивы</span>
}</pre>
<p>Ещё из важного: у кастомных классов глубина вложенности ограничена 7 уровнями, null превращается в новый пустой объект (Unity не хранит null для кастомных классов!), а циклические ссылки разворачиваются в дублирование данных.</p>
<h3>* [SerializeReference] — снятие ограничений</h3>
<p>Обычная сериализация — «по значению»: каждый Item хранится как вложенные данные. <code>[SerializeReference]</code> хранит объект «по ссылке» внутри того же ассета и включает то, что иначе невозможно: полиморфизм (поле типа IWeapon с реальным Sword внутри), настоящий null, общие ссылки на один объект, графы. Цена: медленнее, данные тяжелее, и рефакторинг имён типов ломает ссылки (лечится атрибутом [MovedFrom]).</p>
<h3>Словарь в инспекторе — классический вопрос</h3>
<pre>[Serializable] public class Table : ISerializationCallbackReceiver {
    Dictionary&lt;string,int&gt; dict = new();
    [SerializeField] List&lt;string&gt; keys = new();
    [SerializeField] List&lt;int&gt; values = new();

    public void OnBeforeSerialize() {      <span class="cm">// dict → списки</span>
        keys.Clear(); values.Clear();
        foreach (var kv in dict) { keys.Add(kv.Key); values.Add(kv.Value); }
    }
    public void OnAfterDeserialize() {     <span class="cm">// списки → dict</span>
        dict.Clear();
        for (int i = 0; i &lt; keys.Count; i++) dict[keys[i]] = values[i];
    }
}</pre>
<div class="warn"><b>Осторожно:</b> OnAfterDeserialize вызывается не в главном потоке — Unity API оттуда звать нельзя, только работа с данными.</div>
<h3>Что сказать на собеседовании</h3>
<p>«Сериализуются public и [SerializeField] поля поддерживаемых типов; свойства, словари, интерфейсы и полиморфизм — нет, если не включить [SerializeReference], который переводит хранение на ссылки и разрешает null и графы. Для неподдерживаемых структур — ISerializationCallbackReceiver с параллельными списками. И я помню про 7 уровней вложенности и про то, что null кастомного класса молча становится пустым объектом».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/script-Serialization.html" target="_blank">Unity Manual: Script serialization</a> <span>— все правила на одной странице, перечитывать раз в год</span></li>
<li><a href="https://docs.unity3d.com/ScriptReference/SerializeReference.html" target="_blank">SerializeReference</a> <span>— полиморфная сериализация с примерами</span></li>
<li><a href="https://docs.unity3d.com/Manual/script-serialization-errors.html" target="_blank">Unity: Serialization errors</a> <span>— разбор типичных ошибок и «почему из другого потока нельзя»</span></li>
</ul></div>`,

10:`
<h3>Простыми словами</h3>
<p>У каждого объекта Unity две половины: <b>нативная</b> (C++, внутри движка — там настоящий Transform, меш, всё добро) и <b>managed-обёртка</b> (твой C#-объект). <code>Destroy()</code> убивает нативную половину сразу, а C#-обёртку убрать нельзя — её жизнью управляет GC, и пока у тебя есть ссылка, обёртка жива. Получается зомби: C#-объект существует, но «внутри» у него пусто. Unity хитрит: перегружает оператор <code>==</code> так, чтобы зомби притворялся null.</p>
<pre>Destroy(enemy);
<span class="cm">// enemy — НЕ настоящий null: ссылка на живую C#-обёртку</span>
if (enemy == null)  <span class="cm">// true! перегруженный == проверяет нативную часть</span>
    ...
bool isNull = ReferenceEquals(enemy, null); <span class="cm">// false! обёртка-то жива</span></pre>
<h3>Где это стреляет: ?. и ??</h3>
<p>Операторы <code>?.</code>, <code>??</code> и <code>??=</code> — это языковые конструкции C#, они <b>не используют</b> перегруженный оператор — они сравнивают ссылку напрямую. А ссылка жива:</p>
<pre>Destroy(enemy);

enemy?.TakeDamage(10);
<span class="cm">// ?. видит: ссылка не null → ВЫЗЫВАЕТ метод на мёртвом объекте</span>
<span class="cm">// → MissingReferenceException (или тихая порча логики)</span>

var target = enemy ?? backup;
<span class="cm">// ?? тоже обманут: вернёт мёртвого enemy, а не backup</span>

<span class="cm">// ПРАВИЛЬНО для Unity-объектов только так:</span>
if (enemy != null) enemy.TakeDamage(10);
var t = enemy != null ? enemy : backup;</pre>
<div class="warn"><b>Правило команды, которое стоит озвучить:</b> null-conditional операторы (?. ?? ??=) запрещены на всём, что наследует UnityEngine.Object. Это проверяется Roslyn-анализатором (например UNT0008 из Microsoft.Unity.Analyzers) — и тогда правило соблюдает компилятор, а не код-ревью.</div>
<h3>Почему Unity так сделала и что ещё знать</h3>
<ul>
<li>Перегрузка == даёт понятное поведение новичкам («уничтожил — значит null») и ловит обращения к мёртвым объектам с внятной ошибкой вместо крашей.</li>
<li>Эта проверка — вызов в нативную часть, она дороже обычного сравнения ссылок. В горячем цикле по тысячам объектов это заметно — кэшируйте результат.</li>
<li>В полях инспектора «пустая» ссылка — тоже не настоящий null, а специальный «fake null» объект, поэтому == null работает и там.</li>
<li>Сама Unity обсуждала удаление этой перегрузки (пост «Custom == operator, should we keep it?») — but решили оставить ради обратной совместимости. Прочитай этот пост — это готовый ответ на собес.</li>
</ul>
<h3>Что сказать на собеседовании</h3>
<p>«UnityEngine.Object перегружает ==: после Destroy нативная часть мертва, и объект равен null, хотя managed-обёртка жива. Операторы ?. и ?? перегрузку обходят и работают с мёртвыми объектами — поэтому на Unity-типах только явный == null, а запрет ?. я закрепляю анализатором. И помню, что проверка не бесплатна — в горячих циклах кэширую».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://blog.unity.com/technology/custom-operator-should-we-keep-it" target="_blank">Unity Blog: Custom == operator, should we keep it?</a> <span>— первоисточник от самих Unity, must read</span></li>
<li><a href="https://docs.unity3d.com/ScriptReference/Object.html" target="_blank">UnityEngine.Object docs</a> <span>— описание перегрузки == и жизненного цикла</span></li>
<li><a href="https://github.com/microsoft/Microsoft.Unity.Analyzers" target="_blank">Microsoft.Unity.Analyzers</a> <span>— анализаторы UNT0008 и др., ловящие ?. на Unity-объектах</span></li>
</ul></div>`,
11:`
<h3>Простыми словами</h3>
<p>Без asmdef все твои скрипты компилируются в одну огромную сборку Assembly-CSharp. Поменял одну строчку — пересобирается ВСЁ, и ты ждёшь 30-60 секунд на большом проекте. Asmdef-файлы режут проект на отдельные сборки: поменял код в Gameplay — пересобирается только Gameplay и те, кто от него зависит. Это как переехать из коммуналки, где ремонт у соседа означает пыль у всех, в дом с отдельными квартирами.</p>
<h3>Как это устроено</h3>
<pre><span class="cm">// Создаёшь файл Gameplay.asmdef в папке Scripts/Gameplay:</span>
{
  "name": "MyGame.Gameplay",
  "references": [ "MyGame.Core", "Unity.TextMeshPro" ],
  "noEngineReferences": false
}
<span class="cm">// Все скрипты в этой папке и подпапках теперь компилируются</span>
<span class="cm">// в отдельную DLL, которая видит ТОЛЬКО то, что в references.</span></pre>
<p>Ключевое слово — «только». Если UI-сборка не ссылается на Server-сборку, UI-код физически не может позвать серверный код: компилятор не даст. Архитектурные границы перестают быть договорённостью на словах и становятся законом, который проверяется при каждой компиляции.</p>
<h3>Что это даёт на практике</h3>
<ul>
<li><b>Скорость итерации.</b> Главная причина. Правка в маленькой сборке = компиляция маленькой сборки. Domain reload тоже быстрее.</li>
<li><b>Границы архитектуры.</b> Циклическая зависимость (A ссылается на B, B на A) — ошибка компиляции. Это заставляет продумывать направление зависимостей.</li>
<li><b>Editor-код отдельно.</b> Сборка с платформой Editor-only гарантированно не попадёт в билд — прощай, «случайно заимпортил UnityEditor в рантайм-скрипте».</li>
<li><b>Тесты.</b> Тестовые сборки ссылаются на игровые, но не наоборот. InternalsVisibleTo открывает internal-типы тестам.</li>
</ul>
<h3>Ловушки</h3>
<p><b>Ловушка 1:</b> <code>internal</code> теперь означает «виден только внутри моей сборки». Код, который раньше видел всё, внезапно перестаёт компилироваться. <b>Ловушка 2:</b> слишком мелкая нарезка (50 сборок по 3 файла) — накладные расходы на сборку каждой DLL съедают выигрыш; разумный размер — сборка на подсистему. <b>Ловушка 3:</b> порядок — сначала спланируй граф зависимостей на бумаге, потом режь; резать «как получится» приводит к войне с циклическими зависимостями.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Asmdef дают инкрементальную компиляцию и превращают архитектурные границы в проверяемые компилятором. Я режу проект по подсистемам с явным направлением зависимостей: Core ни от кого не зависит, Gameplay зависит от Core, UI от Gameplay, Editor-сборки отдельно. Циклическая зависимость — ошибка, и это фича, а не баг».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/assembly-definition-files.html" target="_blank">Unity Manual: Assembly definitions</a> <span>— официальная документация со всеми настройками</span></li>
<li><a href="https://unity.com/how-to/organizing-your-project" target="_blank">Unity: Organizing your project</a> <span>— рекомендации по структуре проекта и сборок</span></li>
<li><a href="https://docs.unity3d.com/Manual/ScriptCompilationAssemblyDefinitionFiles.html" target="_blank">Unity: Script compilation</a> <span>— как именно устроен пайплайн компиляции</span></li>
</ul></div>`,

12:`
<h3>Простыми словами</h3>
<p>Каждый раз, когда ты жмёшь Play, Unity «перезагружает мозг»: выбрасывает все C#-объекты и создаёт мир заново. Все static-переменные обнуляются, все подписки на события очищаются. Это медленно (секунды на большом проекте), и Unity дала возможность это отключить — вход в Play становится мгновенным. Но теперь статика НЕ сбрасывается: всё, что ты накопил в static-полях за прошлую сессию Play, осталось. Это как выйти из игры и зайти снова, но обнаружить, что все переменные помнят прошлую партию.</p>
<h3>Что именно происходит</h3>
<pre><span class="cm">// Обычный Play: domain reload сбрасывает всё</span>
public static int score = 0;          <span class="cm">// снова 0 при каждом Play</span>
public static event Action OnDeath;   <span class="cm">// подписчики очищены</span>

<span class="cm">// Play без domain reload:</span>
public static int score = 0;          <span class="cm">// score = 4200 с прошлого запуска!</span>
public static event Action OnDeath;   <span class="cm">// висят мёртвые подписчики</span>
<span class="cm">// → «работает только с первого раза», NullReference на второй запуск,</span>
<span class="cm">// двойные срабатывания событий</span></pre>
<h3>Как жить с отключённым reload (правильно)</h3>
<pre><span class="cm">// Явный сброс статики перед каждым Play:</span>
[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
static void ResetStatics() {
    score = 0;
    OnDeath = null;
    _instance = null;
}</pre>
<p>Правила команды: каждое static-поле имеет сброс в таком методе; подписки на события всегда парные (OnEnable подписка / OnDisable отписка); синглтоны проверяют и пересоздают своё состояние. По сути, отключение domain reload — это тест на чистоту работы со статикой: если проект написан аккуратно, всё работает; если статика размазана — вылезают все грехи.</p>
<div class="tip"><b>Бонус:</b> эти же правила делают код готовым к Enter Play Mode Options в CI и к будущим версиям Unity, где отключённый reload может стать дефолтом. Дисциплина окупается дважды.</div>
<h3>Что сказать на собеседовании</h3>
<p>«Domain reload — это пересоздание scripting domain при входе в Play: сброс статики и подписок. Отключение ускоряет итерацию с секунд до мгновений, но статика переживает сессии — поэтому у нас каждое static-поле сбрасывается через RuntimeInitializeOnLoadMethod(SubsystemRegistration), а подписки строго парные. Отключённый reload — это бесплатный линтер на гигиену статики».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/DomainReloading.html" target="_blank">Unity Manual: Domain Reloading</a> <span>— что сбрасывается и как писать код без reload</span></li>
<li><a href="https://docs.unity3d.com/Manual/ConfigurableEnterPlayMode.html" target="_blank">Unity: Configurable Enter Play Mode</a> <span>— настройки и ограничения</span></li>
<li><a href="https://blog.unity.com/technology/enter-play-mode-faster-in-unity-2019-3" target="_blank">Unity Blog: Enter Play Mode faster</a> <span>— зачем это сделали, с цифрами ускорения</span></li>
</ul></div>`,

13:`
<h3>Простыми словами</h3>
<p>Обычно параметр приходит в метод как копия. <code>ref</code>, <code>in</code> и <code>out</code> меняют это: вместо копии метод получает «адрес оригинала». <code>ref</code> — можно читать и писать в оригинал. <code>out</code> — обязан записать (для возврата нескольких значений). <code>in</code> — только читать, копия не делается. Для маленьких типов вроде int это неважно. Для структуры в 60 байт, летящей через метод тысячи раз за кадр, — важно очень.</p>
<h3>Три модификатора на примерах</h3>
<pre><span class="cm">// ref: метод меняет твою переменную</span>
void Damage(ref float hp) { hp -= 10; }
Damage(ref playerHp);  <span class="cm">// playerHp изменился</span>

<span class="cm">// out: метод обязан вернуть значение (паттерн TryGet)</span>
if (dict.TryGetValue(key, out var item)) { Use(item); }

<span class="cm">// in: большая структура передаётся БЕЗ копии, менять нельзя</span>
float Dist(in Matrix4x4 a, in Matrix4x4 b) { ... }  <span class="cm">// 64 байта не копируются</span></pre>
<h3>Главная ловушка: in + не-readonly структура</h3>
<p>Это вопрос-фильтр на сеньора. Если тип не объявлен как <code>readonly struct</code>, компилятор не может гарантировать, что вызов метода структуры её не изменит. А менять нельзя — она же по <code>in</code>. Выход компилятора: перед КАЖДЫМ обращением к члену молча сделать защитную копию (defensive copy).</p>
<pre>struct Big { public float x; public float Len() =&gt; x * 2; }

void F(in Big b) {
    var a = b.Len();  <span class="cm">// скрытая копия всей структуры!</span>
    var c = b.Len();  <span class="cm">// и ещё одна!</span>
}
<span class="cm">// Итог: in сделал код МЕДЛЕННЕЕ, чем передача по значению.</span>
<span class="cm">// Лечение: readonly struct Big { ... } — копий нет.</span></pre>
<div class="warn"><b>Правило:</b> <code>in</code> используется только в паре с <code>readonly struct</code>. Иначе можно получить обратный эффект. То же с readonly-полями: обращение к методу структуры через readonly-поле тоже создаёт защитную копию.</div>
<h3>Ещё из этой семьи</h3>
<p><code>ref return</code> и <code>ref var</code> позволяют получить ссылку на элемент массива и менять его на месте: <code>ref var e = ref enemies[i]; e.hp -= dmg;</code> — без копирования структуры туда-обратно. Это основа быстрой работы с массивами структур в геймплейном коде.</p>
<h3>Что сказать на собеседовании</h3>
<p>«ref — чтение и запись через ссылку, out — обязательная запись, in — readonly-ссылка для больших структур без копирования. Знаю ловушку: in с не-readonly структурой порождает защитные копии на каждом обращении и делает код медленнее — поэтому in только с readonly struct. Для правки массивов структур на месте использую ref return».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters" target="_blank">Microsoft: Method parameters</a> <span>— ref/in/out официально, со всеми правилами</span></li>
<li><a href="https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/struct#readonly-struct" target="_blank">Microsoft: readonly struct</a> <span>— почему readonly убирает защитные копии</span></li>
<li><a href="https://devblogs.microsoft.com/premier-developer/the-in-modifier-and-the-readonly-structs-in-c/" target="_blank">Microsoft DevBlog: The in-modifier and readonly structs</a> <span>— разбор ловушки с бенчмарками</span></li>
</ul></div>`,

14:`
<h3>Простыми словами</h3>
<p>Все три — способы работать с куском памяти «напрямую», без копирования. <code>Span&lt;T&gt;</code> — это «окно» в чужую память: смотришь на часть массива или стека как на свой мини-массив, без выделения нового. <code>Memory&lt;T&gt;</code> — то же окно, но которое можно положить в поле и использовать в async-коде. <code>NativeArray&lt;T&gt;</code> — массив Unity вне управляемой кучи, который можно отдать в Job System и Burst. Общая идея: перестать копировать данные туда-сюда.</p>
<h3>Span: нарезка без аллокаций</h3>
<pre><span class="cm">// Старый мир: каждая «часть» — новая аллокация</span>
string sub = text.Substring(5, 10);       <span class="cm">// новая строка</span>
int[] part = arr.Skip(5).Take(10).ToArray(); <span class="cm">// новый массив</span>

<span class="cm">// Span: те же операции — ноль аллокаций</span>
ReadOnlySpan&lt;char&gt; sub = text.AsSpan(5, 10);
Span&lt;int&gt; part = arr.AsSpan(5, 10);
part[0] = 99;                             <span class="cm">// пишет в ОРИГИНАЛ arr[5]</span>

<span class="cm">// + работает со стеком:</span>
Span&lt;byte&gt; buf = stackalloc byte[256];    <span class="cm">// буфер без кучи вообще</span></pre>
<p>Ограничение по построению: Span — <code>ref struct</code>, живёт только на стеке. Нельзя сохранить в поле класса, нельзя использовать через await/yield. Это не вредность, а гарантия безопасности: окно не может пережить память, на которую смотрит. Когда нужно хранить или в async — бери <code>Memory&lt;T&gt;</code> и вызывай <code>.Span</code> в момент работы.</p>
<h3>NativeArray: мост в мир джобов</h3>
<pre>var positions = new NativeArray&lt;float3&gt;(1000, Allocator.TempJob);
<span class="cm">// живёт вне GC-кучи → Burst и джобы могут с ней работать,</span>
<span class="cm">// safety-система отслеживает гонки чтения/записи</span>
var job = new MoveJob { positions = positions }.Schedule(1000, 64);
job.Complete();
positions.Dispose();  <span class="cm">// ты владеешь памятью — ты и освобождаешь!</span></pre>
<p>Аллокаторы — это выбор времени жизни: <code>Temp</code> (до конца кадра, самый быстрый), <code>TempJob</code> (до 4 кадров, для джобов), <code>Persistent</code> (пока сам не освободишь). Забыл Dispose — safety-система напишет об утечке в консоль.</p>
<h3>Когда что</h3>
<ul>
<li><b>Span</b> — парсинг, работа с буферами, нарезка внутри метода. Синхронный код.</li>
<li><b>Memory</b> — те же буферы, но через async/await или с хранением в поле.</li>
<li><b>NativeArray</b> — всё, что уходит в Job System, Burst, или в API движка (Mesh, Texture, RaycastCommand).</li>
</ul>
<h3>Что сказать на собеседовании</h3>
<p>«Span — стековое окно в память без аллокаций, ref struct по построению, поэтому не переживает кадр стека. Memory — его хранимый аналог для async. NativeArray — unmanaged-память с явным аллокатором и safety-проверками, обязательная для джобов и Burst. Общий смысл: работа с данными на месте вместо копирования — парсинг на Span, обработка тысяч сущностей на NativeArray в джобах».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.microsoft.com/en-us/dotnet/standard/memory-and-spans/" target="_blank">Microsoft: Memory and Span usage guidelines</a> <span>— главный документ по правилам владения</span></li>
<li><a href="https://docs.unity3d.com/ScriptReference/Unity.Collections.NativeArray_1.html" target="_blank">Unity: NativeArray</a> <span>— API и аллокаторы</span></li>
<li><a href="https://docs.unity3d.com/Packages/com.unity.collections@2.4/manual/index.html" target="_blank">Unity Collections package</a> <span>— NativeList, NativeHashMap и вся семья</span></li>
<li><a href="https://adamsitnik.com/Span/" target="_blank">Adam Sitnik: Span</a> <span>— глубокий разбор с бенчмарками от инженера .NET</span></li>
</ul></div>`,

15:`
<h3>Простыми словами</h3>
<p>Instantiate и Destroy — дорогие операции: создание объекта со всей иерархией, Awake, регистрация в подсистемах, а потом ещё и мусор для GC. Пул решает это по-другому: создать 50 пуль ЗАРАНЕЕ, прятать использованные и выдавать их снова. Как посуда в кафе: тарелки моют и используют повторно, а не выбрасывают после каждого клиента и не покупают новые.</p>
<h3>Минимальный правильный пул</h3>
<pre>public class BulletPool {
    readonly Stack&lt;Bullet&gt; _free = new(64);
    readonly Bullet _prefab;

    public Bullet Get() {
        var b = _free.Count &gt; 0 ? _free.Pop() : Object.Instantiate(_prefab);
        b.gameObject.SetActive(true);
        return b;
    }
    public void Release(Bullet b) {
        b.ResetState();               <span class="cm">// ← сердце пула!</span>
        b.gameObject.SetActive(false);
        _free.Push(b);
    }
}</pre>
<p>С Unity 2021 есть готовый <code>UnityEngine.Pool.ObjectPool&lt;T&gt;</code> с коллбэками onGet/onRelease/maxSize — для большинства случаев пиши на нём, а не с нуля.</p>
<h3>Где пулы ломаются (главная часть ответа)</h3>
<ul>
<li><b>Грязное состояние.</b> Пуля вернулась в пул с trail-эффектом, скоростью и подпиской на событие. Выдали снова — она летит не туда со шлейфом из прошлой жизни. Правило: <code>ResetState()</code> сбрасывает ВСЁ изменяемое — скорость rigidbody, партиклы (Clear), таймеры, корутины (StopAllCoroutines), подписки. И сброс делается при Release, а не при Get — легче найти виновника.</li>
<li><b>Двойной Release.</b> Объект вернули дважды → он два раза в стеке → его выдадут двум владельцам одновременно. Хаос. Защита: флаг «в пуле» и ассерт.</li>
<li><b>Release уничтоженного.</b> Кто-то сделал Destroy пулированному объекту (например, при выгрузке сцены), а потом его вернули в пул. Теперь пул выдаёт трупы. Защита: проверка на null при Get, очистка пула при выгрузке сцены.</li>
<li><b>Логика, рассчитанная на Awake.</b> Awake выполняется один раз при создании, а не при каждой выдаче. Инициализация «на использование» живёт в OnEnable или в явном Init().</li>
</ul>
<h3>Прогрев и размер</h3>
<p>Пул без прогрева даёт фриз при первом всплеске (создание 30 объектов в одном кадре). Прогрев на загрузке: создать типичный максимум заранее. Размер — из телеметрии (пиковое одновременное использование), а не из головы. Переполнение — политика по типу объекта: расти / переиспользовать старейший / отказать.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Пул — это Stack свободных экземпляров с Get/Release, прогревом на загрузке и жёсткой дисциплиной сброса состояния при Release. Классические баги: грязное состояние, двойной Release, возврат уничтоженных объектов, логика в Awake вместо OnEnable. В новых проектах использую встроенный ObjectPool из UnityEngine.Pool, размер выбираю из данных о пиковом использовании».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/ScriptReference/Pool.ObjectPool_1.html" target="_blank">Unity: ObjectPool&lt;T&gt;</a> <span>— встроенный пул с 2021, API и примеры</span></li>
<li><a href="https://gameprogrammingpatterns.com/object-pool.html" target="_blank">Game Programming Patterns: Object Pool</a> <span>— классическая глава Нистрома, бесплатно</span></li>
<li><a href="https://learn.unity.com/tutorial/introduction-to-object-pooling" target="_blank">Unity Learn: Object pooling</a> <span>— пошаговый практикум</span></li>
</ul></div>`,
16:`
<h3>Простыми словами</h3>
<p>В C# есть сборщик мусора, поэтому «утечек не бывает»? Бывают, и ещё как. GC освобождает только объекты, на которые НИКТО не ссылается. Утечка в managed-мире — это когда кто-то долгоживущий (статика, менеджер, кэш) продолжает держать ссылку на то, что должно было умереть. Объект жив, память занята, GC бессилен — он всё делает правильно, это ты попросил хранить.</p>
<h3>Пять главных паттернов утечек в Unity</h3>
<pre><span class="cm">// 1. Статическое событие + забытая отписка (лидер хит-парада)</span>
public static event Action OnWaveStart;
<span class="cm">// враг подписался в OnEnable, умер через Destroy,</span>
<span class="cm">// но отписки нет → статическое событие держит труп вечно,</span>
<span class="cm">// а вместе с ним — все его текстуры и меши</span>

<span class="cm">// 2. Лямбда с захватом this в долгоживущей системе</span>
GameManager.OnTick += () =&gt; UpdateUI();  <span class="cm">// захвачен this</span>
<span class="cm">// отписать ЭТУ лямбду нельзя — ссылки на неё не осталось!</span>

<span class="cm">// 3. renderer.material — тихое создание материала</span>
GetComponent&lt;Renderer&gt;().material.color = Color.red;
<span class="cm">// создал копию материала; Destroy объекта её НЕ удаляет</span>

<span class="cm">// 4. Runtime-ассеты без Destroy</span>
var tex = new Texture2D(1024, 1024);  <span class="cm">// нативная память</span>
<span class="cm">// GC соберёт C#-обёртку, но НЕ нативную текстуру → Destroy(tex) обязателен</span>

<span class="cm">// 5. Кэш без чистки</span>
static Dictionary&lt;GameObject, Data&gt; cache = new();
<span class="cm">// объекты умирают, записи остаются навсегда</span></pre>
<h3>Как искать</h3>
<p>Memory Profiler (пакет), метод двух снапшотов: снапшот A → сделать цикл, который «должен ничего не оставить» (открыть-закрыть экран, загрузить-выгрузить сцену, 3 раза) → снапшот B → Compare. Всё, чего стало больше, — кандидаты в утечку. Выбираешь объект → «References To» → идёшь по цепочке вверх до держателя. В 80% случаев наверху обнаружится static-поле или DontDestroyOnLoad-менеджер.</p>
<h3>Профилактика (дешевле поиска)</h3>
<ul>
<li>Подписка/отписка строго парой: OnEnable/OnDisable. Код-ревью это проверяет.</li>
<li>Лямбды с захватом — только там, где не нужна отписка, иначе кэшированный делегат в поле.</li>
<li>Каждый <code>new Texture2D/Material/Mesh</code> имеет владельца, отвечающего за Destroy.</li>
<li>Кэши по GameObject — чистка по событию смерти или периодическая уборка мёртвых ключей.</li>
<li>CI-тест: загрузить/выгрузить каждую сцену 3 раза, сравнить память — рост = красный билд.</li>
</ul>
<h3>Что сказать на собеседовании</h3>
<p>«Managed-утечка — это долгоживущий держатель ссылки: статические события, лямбды с захватом this, кэши. Плюс нативная сторона: runtime-текстуры и материалы, которые GC не убирает — им нужен Destroy, а renderer.material тихо создаёт копию. Ищу методом двух снапшотов в Memory Profiler по цепочкам References To, предотвращаю парными подписками и CI-тестом на рост памяти».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Packages/com.unity.memoryprofiler@1.1/manual/index.html" target="_blank">Unity Memory Profiler</a> <span>— мануал пакета: снапшоты, сравнение, цепочки ссылок</span></li>
<li><a href="https://unity.com/how-to/use-memory-profiling-unity" target="_blank">Unity: Memory profiling guide</a> <span>— практический workflow поиска утечек</span></li>
<li><a href="https://docs.unity3d.com/Manual/performance-garbage-collection-best-practices.html" target="_blank">Unity: GC best practices</a> <span>— раздел про владение нативными объектами</span></li>
</ul></div>`,

17:`
<h3>Простыми словами</h3>
<p>Строки в C# нельзя изменить — каждая операция создаёт новую. <code>"HP: " + hp</code> — новая строка. <code>hp.ToString()</code> — новая строка. И весь этот мусор копится для GC. Одна строка — мелочь. Но HUD, обновляющий 10 надписей каждый кадр, — это 600+ строк-однодневок в секунду, и через минуту GC устроит уборку посреди боя.</p>
<h3>Где рождается строковый мусор</h3>
<pre>void Update() {
    scoreText.text = "Score: " + score;        <span class="cm">// 2-3 аллокации КАЖДЫЙ КАДР:</span>
    <span class="cm">// score.ToString() → новая строка</span>
    <span class="cm">// конкатенация → ещё одна</span>
    <span class="cm">// (+ интерполяция $"..." это то же самое под капотом)</span>
}</pre>
<h3>Лестница решений (от самого важного)</h3>
<pre><span class="cm">// ШАГ 1 — главный: обновлять только при изменении</span>
int _lastScore = -1;
void UpdateScore() {
    if (score == _lastScore) return;   <span class="cm">// 99% кадров — выход тут</span>
    _lastScore = score;
    scoreText.SetText("Score: {0}", score);  <span class="cm">// ШАГ 2: TMP SetText</span>
}
<span class="cm">// SetText форматирует число во внутренний char-буфер — ноль строк!</span>

<span class="cm">// ШАГ 3: кэш частых строк</span>
static readonly string[] Numbers = BuildStrings(0, 999);
ammoText.text = Numbers[ammo];   <span class="cm">// готовая строка, ноль аллокаций</span>

<span class="cm">// ШАГ 4: StringBuilder для сложной сборки</span>
_sb.Clear();
_sb.Append("Wave ").Append(wave).Append(" / ").Append(total);
<span class="cm">// один буфер переиспользуется; ToString() — только при показе</span></pre>
<p>Замечание про шаг 1: он всегда главный. Значение счёта меняется пару раз в секунду, а Update идёт 60 раз — 97% аллокаций устраняются одной проверкой, даже без остальных шагов.</p>
<h3>Смежные грабли</h3>
<ul>
<li><code>Debug.Log("x: " + x)</code> в билде: строка собирается ДО вызова, даже если лог отключён. Оборачивайте в <code>#if</code> или [Conditional].</li>
<li>Сравнение строк: <code>a.ToLower() == b.ToLower()</code> — две аллокации и баг с турецкой I. Правильно: <code>string.Equals(a, b, StringComparison.OrdinalIgnoreCase)</code>.</li>
<li>Ключи-строки в словарях каждый кадр (<code>animator.Play("Run")</code>) — хэшируйте один раз: <code>Animator.StringToHash</code>.</li>
</ul>
<h3>Что сказать на собеседовании</h3>
<p>«Строки иммутабельны, каждая операция — аллокация. Мой порядок действий: сначала change-check — обновлять текст только при реальном изменении значения, это устраняет большинство аллокаций; затем SetText с числовыми перегрузками у TMP, кэш строк 0-999 для счётчиков, переиспользуемый StringBuilder для сложного. И помню про Debug.Log с конкатенацией в билдах и ordinal-сравнения вместо ToLower».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Packages/com.unity.textmeshpro@4.0/api/TMPro.TMP_Text.html#TMPro_TMP_Text_SetText_System_String_System_Single_" target="_blank">TMP: SetText API</a> <span>— перегрузки с числами без аллокаций</span></li>
<li><a href="https://learn.microsoft.com/en-us/dotnet/standard/base-types/stringbuilder" target="_blank">Microsoft: StringBuilder</a> <span>— как он устроен и когда выгоден</span></li>
<li><a href="https://learn.microsoft.com/en-us/dotnet/standard/base-types/best-practices-strings" target="_blank">Microsoft: Best practices for strings</a> <span>— сравнения, культура, ordinal</span></li>
</ul></div>`,

18:`
<h3>Простыми словами</h3>
<p>Почти весь Unity API можно трогать только из главного потока. <code>transform.position</code> из фонового потока — исключение (в лучшем случае) или тихая порча данных (в худшем). Почему так: внутренности движка не защищены блокировками ради скорости, и Unity просто запрещает параллельный доступ. Поэтому вопрос «как использовать многопоточность в Unity» — на самом деле вопрос «как организовать обмен между фоновой работой и главным потоком».</p>
<h3>Что можно и что нельзя</h3>
<pre><span class="cm">// НЕЛЬЗЯ из фонового потока:</span>
transform.position = pos;        <span class="cm">// исключение</span>
Instantiate(prefab);             <span class="cm">// исключение</span>
GetComponent&lt;Rigidbody&gt;();       <span class="cm">// исключение</span>

<span class="cm">// МОЖНО из фонового потока:</span>
Vector3 dir = target - origin;   <span class="cm">// математика — просто структуры</span>
float d = Vector3.Distance(a,b); <span class="cm">// чистые вычисления</span>
Quaternion.Slerp(q1, q2, t);     <span class="cm">// тоже ок</span>
ParseJson(text); BuildNavGrid(); <span class="cm">// свои данные — пожалуйста</span></pre>
<h3>Паттерн «фоновая работа + возврат на главный»</h3>
<pre><span class="cm">// Классика: очередь результатов, разбираемая в Update</span>
ConcurrentQueue&lt;PathResult&gt; _results = new();

void RequestPath(Vector3 from, Vector3 to) {
    Task.Run(() =&gt; {
        var path = ComputePath(from, to);   <span class="cm">// тяжёлое — в фоне</span>
        _results.Enqueue(path);              <span class="cm">// результат в очередь</span>
    });
}
void Update() {
    while (_results.TryDequeue(out var r))
        ApplyPath(r);                        <span class="cm">// Unity API — на главном</span>
}

<span class="cm">// Или через async: после await ты снова на главном потоке</span>
async UniTaskVoid Load() {
    var data = await UniTask.RunOnThreadPool(() =&gt; Parse(file));
    ApplyToScene(data);   <span class="cm">// главный поток, безопасно</span>
}</pre>
<h3>Правильный ответ для Unity: Job System</h3>
<p>Для массовой параллельной работы над игровыми данными руками потоки не нужны: Job System даёт воркеры движка, safety-систему (сама ловит гонки данных на NativeArray) и Burst-компиляцию. Правило выбора: IO и разовая фоновая работа (парсинг, сеть, генерация) → Task/UniTask с возвратом на главный; массовая обработка данных каждый кадр (тысячи агентов, вершины мешей) → джобы + Burst; свой постоянный цикл (аудио-декодер) → выделенный Thread.</p>
<div class="warn"><b>Тонкость про Debug.Log:</b> он потокобезопасен — и это обманывает: кажется, что «всё работает из фона». Не проверяйте потокобезопасность логом.</div>
<h3>Что сказать на собеседовании</h3>
<p>«Unity API — только главный поток; из фона доступна математика и свои данные. Паттерн обмена: тяжёлая работа в Task/джобе, результаты через ConcurrentQueue, разбираемую в Update, или через await с возвратом в UnitySynchronizationContext. Для массовых данных — Job System с Burst вместо ручных потоков: там safety-система сама ловит гонки».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/JobSystem.html" target="_blank">Unity: Job System</a> <span>— официальный мануал с примерами</span></li>
<li><a href="https://docs.unity3d.com/Manual/overview-of-dot-net-in-unity.html" target="_blank">Unity: .NET overview</a> <span>— модель потоков и SynchronizationContext в Unity</span></li>
<li><a href="https://github.com/Cysharp/UniTask#switch-to-threadpool" target="_blank">UniTask: SwitchToThreadPool</a> <span>— явные переходы между потоками</span></li>
</ul></div>`,

19:`
<h3>Простыми словами</h3>
<p>Три способа сказать «когда произойдёт X — сделай Y». C#-события: быстрые, проверяются компилятором, но связи видны только в коде. UnityEvent: связи настраивает дизайнер в инспекторе мышкой, но это медленнее и хрупко к переименованиям. Шина сообщений: отправитель и получатель вообще не знают друг о друге. Это не конкуренты — это инструменты для разных этажей игры.</p>
<h3>Сравнение на пальцах</h3>
<pre><span class="cm">// C# event: быстро, типобезопасно, только в коде</span>
public event Action&lt;int&gt; OnDamaged;
OnDamaged?.Invoke(dmg);
<span class="cm">// - подписки не видны в инспекторе</span>
<span class="cm">// - забыл отписаться → утечка (вопрос №16)</span>

<span class="cm">// UnityEvent: дизайнер соединяет в инспекторе</span>
public UnityEvent&lt;int&gt; OnDamaged;
<span class="cm">// + кнопка → звук + партикл + счётчик БЕЗ кода</span>
<span class="cm">// - вызов через сериализованный список: ~в 10-40 раз медленнее</span>
<span class="cm">// - переименовал метод → связь молча умерла (находится только в рантайме)</span>

<span class="cm">// Шина/SO-каналы: полная развязка</span>
[CreateAssetMenu] class GameEvent : ScriptableObject {
    event Action Raised;
    public void Raise() =&gt; Raised?.Invoke();
    public void Sub(Action a) =&gt; Raised += a;
}
<span class="cm">// + системы не ссылаются друг на друга, работает между сценами</span>
<span class="cm">// - «кто это вызвал?» — отладка сложнее, связи не видны в коде</span></pre>
<h3>Какой этаж — какой инструмент</h3>
<ul>
<li><b>Внутри системы</b> (здоровье → полоска здоровья того же персонажа): C#-события. Быстро, явно, рефакторится.</li>
<li><b>Между системами</b> (смерть игрока → музыка, сохранение, UI, аналитика): шина или SO-каналы. Системы не знают друг о друге, добавление слушателя не трогает отправителя.</li>
<li><b>Листья UI и контент</b> (кнопка → открыть панель; триггер → включить свет): UnityEvent. Дизайнер сам соединяет без программиста, цена вызова на частоте кликов не важна.</li>
</ul>
<div class="warn"><b>Анти-паттерн, о котором спросят:</b> ВСЁ на одной глобальной шине. Через полгода никто не знает, кто на что реагирует, порядок обработчиков неуправляем, отладка — археология. Шина — для действительно межсистемных фактов, а не для всего подряд.</div>
<h3>Что сказать на собеседовании</h3>
<p>«C#-события внутри системы — скорость и проверка компилятором; SO-каналы или шина между системами — развязка и работа через сцены; UnityEvent на листьях UI — власть дизайнера. Знаю цены: UnityEvent на порядок медленнее и ломается при переименовании, C#-события утекают без парной отписки, глобальная шина без дисциплины превращается в неотлаживаемое болото».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://unity.com/how-to/architect-game-code-scriptable-objects" target="_blank">Unity: Architect with ScriptableObjects</a> <span>— официальный гайд по SO-каналам событий</span></li>
<li><a href="https://www.youtube.com/watch?v=raQ3iHhE_Kk" target="_blank">Unite 2017, Ryan Hipple: Game Architecture with SO</a> <span>— доклад, с которого началась мода на SO-события</span></li>
<li><a href="https://docs.unity3d.com/Manual/UnityEvents.html" target="_blank">Unity: UnityEvents</a> <span>— как устроены и когда уместны</span></li>
</ul></div>`,

20:`
<h3>Простыми словами</h3>
<p>MonoBehaviour живёт на объекте в сцене. ScriptableObject живёт в ПРОЕКТЕ как ассет — как текстура или меш, только с твоими данными. Сто врагов с одинаковыми статами не хранят по копии этих статов — все ссылаются на один ассет EnemyConfig. Поменял в одном месте — изменилось у всех. Это фундаментальный сдвиг: данные отделяются от объектов сцены.</p>
<h3>База</h3>
<pre>[CreateAssetMenu(menuName = "Game/Enemy Config")]
public class EnemyConfig : ScriptableObject {
    public float maxHp;
    public float speed;
    public Sprite icon;
    public AttackPattern[] patterns;   <span class="cm">// вложенные данные — ок</span>
}

public class Enemy : MonoBehaviour {
    [SerializeField] EnemyConfig config;   <span class="cm">// ссылка на ассет</span>
    float _hp;                             <span class="cm">// текущее — у себя!</span>
    void Awake() =&gt; _hp = config.maxHp;    <span class="cm">// конфиг читаем, не пишем</span>
}</pre>
<h3>Зачем это архитектурно</h3>
<ul>
<li><b>Данные без дублирования:</b> баланс, предметы, способности — дизайнер правит ассеты, не лазая по префабам и сценам.</li>
<li><b>Каналы событий</b> (вопрос №19): SO как точка встречи систем, работающая между сценами.</li>
<li><b>Стратегии как ассеты:</b> поле <code>MovementStrategy</code> (базовый SO-класс, наследники ChasePlayer/Patrol/Flee) — дизайнер меняет поведение врага перетаскиванием ассета, без кода.</li>
<li><b>Общее рантайм-состояние:</b> RuntimeSet — SO со списком живых врагов: спавнер добавляет, UI читает счётчик, никто ни на кого не ссылается напрямую.</li>
</ul>
<h3>Две ловушки, которые проверяют на собесе</h3>
<pre><span class="cm">// Ловушка 1: в РЕДАКТОРЕ изменения SO в Play Mode СОХРАНЯЮТСЯ в ассет!</span>
config.maxHp -= 10;   <span class="cm">// в редакторе это испортило ассет насовсем,</span>
                       <span class="cm">// в билде — нет (изменения живут до перезапуска)</span>
<span class="cm">// Разное поведение в редакторе и билде = коварные баги.</span>
<span class="cm">// Правило: конфиг-SO в рантайме read-only.</span>

<span class="cm">// Ловушка 2: нужно изменяемое состояние на базе конфига?</span>
var runtime = Instantiate(config);   <span class="cm">// клон — меняй сколько хочешь</span></pre>
<div class="warn"><b>И третья, поменьше:</b> SO с изменяемым состоянием как «глобальная переменная» — это тот же синглтон со всеми его проблемами (кто и когда это поменял?). RuntimeSet-ы — да; свалка глобальных флагов в SO — нет.</div>
<h3>Что сказать на собеседовании</h3>
<p>«ScriptableObject — ассет с данными: один экземпляр, много ссылающихся. Использую для конфигов и баланса (read-only в рантайме), событийных каналов, стратегий, которые дизайнер меняет без кода, и RuntimeSet-ов. Помню про ловушку редактора — изменения в Play Mode сохраняются в ассет, поэтому изменяемое состояние — только через Instantiate конфига или отдельные рантайм-объекты».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/class-ScriptableObject.html" target="_blank">Unity: ScriptableObject</a> <span>— официальная база</span></li>
<li><a href="https://unity.com/how-to/architect-game-code-scriptable-objects" target="_blank">Unity: Architect your game with SO</a> <span>— паттерны: конфиги, каналы, RuntimeSet</span></li>
<li><a href="https://www.youtube.com/watch?v=raQ3iHhE_Kk" target="_blank">Ryan Hipple: Game Architecture with ScriptableObjects</a> <span>— главный доклад по теме, обязательный просмотр</span></li>
<li><a href="https://unity.com/resources" target="_blank">Unity e-book: Create modular architecture with SO</a> <span>— свежая книга целиком про эти паттерны</span></li>
</ul></div>`,
23:`
<h3>Простыми словами</h3>
<p>Кадр Unity — это конвейер с жёстким расписанием: сначала физика (может несколько раз), потом ввод, потом Update всех скриптов, потом анимация, потом LateUpdate, потом рендер. Awake/Start — отдельная история при рождении объекта. Половина «мистических» багов — это код, читающий данные ДО того, как их записала другая стадия конвейера.</p>
<h3>Скелет кадра, который надо знать наизусть</h3>
<pre>Рождение объекта:  Awake → OnEnable → Start (перед первым Update)
Каждый кадр:
  FixedUpdate ×0..n          <span class="cm">// физика догоняет реальное время</span>
  OnTrigger*/OnCollision*    <span class="cm">// коллбэки физики</span>
  Update                     <span class="cm">// основная логика</span>
  yield return null          <span class="cm">// корутины после Update</span>
  LateUpdate                 <span class="cm">// камера, финальные правки</span>
  Анимация → Рендер → WaitForEndOfFrame
Смерть: OnDisable → OnDestroy</pre>
<p>Ключевые следствия: Awake всех объектов сцены выполняется раньше ЛЮБОГО Start — поэтому в Awake инициализируем себя, а в Start ходим к соседям (они уже прошли Awake). Камера — в LateUpdate, иначе она прочитает позицию игрока до его движения в этом кадре и будет отставать на кадр.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Awake — самоинициализация, Start — ссылки на других (все Awake уже прошли). FixedUpdate может выполниться 0 или несколько раз за кадр — физика там, движение камеры в LateUpdate после всех Update и анимации. Коллбэки физики приходят в физическом шаге, а не в Update — визуальное состояние может отставать. Диаграмму Execution Order из мануала знаю и читаю по памяти».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/ExecutionOrder.html" target="_blank">Unity: Order of execution</a> <span>— главная диаграмма; распечатать и повесить</span></li>
<li><a href="https://docs.unity3d.com/Manual/class-MonoManager.html" target="_blank">Unity: Script Execution Order settings</a> <span>— как управлять порядком между скриптами</span></li>
</ul></div>`,

24:`
<h3>Простыми словами</h3>
<p>Update — «каждый кадр отрисовки», FixedUpdate — «каждый тик физики», LateUpdate — «после всех Update». Кадры идут неравномерно (16мс, 18мс, 33мс...), а физика обязана шагать равномерно, иначе прыжок будет разным на разных FPS. Поэтому у физики свои часы, и Unity вызывает FixedUpdate столько раз, сколько «физического времени» накопилось.</p>
<h3>Правило распределения кода</h3>
<pre>Update:      ввод, таймеры, логика, НЕфизическое движение
FixedUpdate: ВСЁ с Rigidbody — AddForce, velocity
LateUpdate:  камера, взгляд на цель, финальные коррекции

<span class="cm">// Классическая ошибка №1: физика в Update</span>
void Update() { rb.AddForce(dir * speed); }
<span class="cm">// сила зависит от FPS → на 144 Гц машина едет быстрее!</span>

<span class="cm">// Классическая ошибка №2: разовый ввод в FixedUpdate</span>
void FixedUpdate() { if (Input.GetKeyDown(...)) Jump(); }
<span class="cm">// GetKeyDown истинен один КАДР, а FixedUpdate может</span>
<span class="cm">// не выполниться в этом кадре → прыжок «съеден»</span>
<span class="cm">// Правильно: читаем ввод в Update, ставим флаг, потребляем в FixedUpdate</span></pre>
<h3>Что сказать на собеседовании</h3>
<p>«Update — переменный dt, кадр рендера; FixedUpdate — постоянный fixedDeltaTime, может выполниться 0..n раз за кадр; LateUpdate — после всех Update и анимации, там камера. Силы rigidbody только в FixedUpdate ради независимости от FPS; разовый ввод читается в Update и буферизуется флагом для FixedUpdate; движение камеры в Update даёт джиттер с отставанием на кадр».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/TimeFrameManagement.html" target="_blank">Unity: Time and frame management</a> <span>— как связаны кадры и физическое время</span></li>
<li><a href="https://gafferongames.com/post/fix_your_timestep/" target="_blank">Gaffer On Games: Fix Your Timestep</a> <span>— каноническая статья, откуда всё это пошло</span></li>
</ul></div>`,

25:`
<h3>Простыми словами</h3>
<p>У Unity несколько «часов». <code>deltaTime</code> — сколько прошло с прошлого кадра (умноженное на timeScale). <code>timeScale</code> — глобальный множитель скорости времени: 0.5 — слоумо, 0 — пауза. <code>unscaledDeltaTime</code> — честное время, игнорирующее timeScale. Вся система пауз и слоумо в играх строится на понимании, кто на каких часах живёт.</p>
<h3>Как делается пауза и слоумо</h3>
<pre>Time.timeScale = 0;    <span class="cm">// ПАУЗА: физика стоит (FixedUpdate не зовётся),</span>
                       <span class="cm">// deltaTime = 0 → вся логика на нём замерла,</span>
                       <span class="cm">// но Update ВЫЗЫВАЕТСЯ и рендер идёт!</span>

<span class="cm">// Меню поверх паузы должно жить → его анимации на unscaled:</span>
menuAlpha += Time.unscaledDeltaTime * fadeSpeed;
<span class="cm">// у Animator-а есть UpdateMode.UnscaledTime,</span>
<span class="cm">// у корутин — WaitForSecondsRealtime</span>

Time.timeScale = 0.3f;  <span class="cm">// СЛОУМО: и вот тонкость —</span>
<span class="cm">// fixedDeltaTime НЕ масштабируется сам, физика начинает</span>
<span class="cm">// шагать чаще на реальную секунду; классика:</span>
Time.fixedDeltaTime = 0.02f * Time.timeScale;</pre>
<p>Ещё одна деталь: <code>maximumDeltaTime</code> ограничивает, сколько времени физика пытается «догнать» после фриза — без него долгий хитч порождает лавину FixedUpdate («спираль смерти»).</p>
<h3>Что сказать на собеседовании</h3>
<p>«timeScale множит deltaTime и физическое время: 0 — пауза, где рендер жив, а физика и deltaTime-логика стоят. UI паузы живёт на unscaledDeltaTime, WaitForSecondsRealtime и UnscaledTime у Animator. При слоумо не забываю масштабировать fixedDeltaTime, иначе меняется частота физики на реальную секунду. maximumDeltaTime защищает от спирали смерти после фризов».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/ScriptReference/Time.html" target="_blank">Unity: Time API</a> <span>— все свойства времени в одном месте</span></li>
<li><a href="https://docs.unity3d.com/Manual/TimeFrameManagement.html" target="_blank">Unity: Time and framerate</a> <span>— взаимодействие часов, maximumDeltaTime</span></li>
</ul></div>`,

26:`
<h3>Простыми словами</h3>
<p>GetComponent — это поход через границу C# → C++ движка плюс поиск по списку компонентов объекта. Один вызов — микроскопическая цена. Но в Update на сотнях объектов — уже проценты кадра, выброшенные на поиск того, что можно было запомнить один раз. Это категория «смерть от тысячи порезов».</p>
<h3>Иерархия решений</h3>
<pre><span class="cm">// ПЛОХО: поиск каждый кадр</span>
void Update() { GetComponent&lt;Rigidbody&gt;().velocity = v; }

<span class="cm">// ХОРОШО: кэш в Awake</span>
Rigidbody _rb;
void Awake() { _rb = GetComponent&lt;Rigidbody&gt;(); }

<span class="cm">// ЛУЧШЕ (когда возможно): ссылка через инспектор</span>
[SerializeField] Rigidbody _rb;
<span class="cm">// цена — ноль в рантайме, а потерянная ссылка видна</span>
<span class="cm">// в редакторе, а не исключением у игрока</span>

<span class="cm">// Компонент может отсутствовать? TryGetComponent:</span>
if (other.TryGetComponent&lt;IDamageable&gt;(out var dmg)) dmg.Hit(10);
<span class="cm">// бонус: в редакторе не аллоцирует на промахе, в отличие от GetComponent</span></pre>
<p>Отдельный круг ада — <code>GetComponentInChildren</code> (обход всей иерархии вглубь) и <code>Find/FindObjectOfType</code> (обход ВСЕЙ сцены). Им не место в горячем коде вообще; FindObjectOfType в Update — самый частый грех в чужом легаси.</p>
<h3>Что сказать на собеседовании</h3>
<p>«GetComponent — managed→native вызов с поиском по списку компонентов: дёшев единично, дорог в Update на сотнях объектов. Мой порядок: SerializeField-ссылка (ноль цены + ошибки видны в редакторе), кэш в Awake, TryGetComponent для опциональных. GetComponentInChildren и FindObjectOfType в горячем пути — запрещены; это первое, что я ищу grep-ом в новом проекте».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://unity.com/how-to/optimize-scripts-unity" target="_blank">Unity: Script optimization</a> <span>— официальные практики, включая кэширование</span></li>
<li><a href="https://docs.unity3d.com/ScriptReference/Component.TryGetComponent.html" target="_blank">TryGetComponent</a> <span>— чем отличается от GetComponent</span></li>
</ul></div>`,

27:`
<h3>Простыми словами</h3>
<p>Transform — не просто «позиция-поворот-масштаб». Это узел в нативном дереве, и любое движение помечает «грязным» сам узел и ВСЕХ его детей: их мировые матрицы придётся пересчитать. Двигаешь корень иерархии из 500 объектов — пометил 500 узлов. Поэтому глубина и ширина иерархий — это вопрос производительности, а не только порядка в сцене.</p>
<h3>Три правила и один трюк</h3>
<pre><span class="cm">// 1. Читай после записи осторожно: чтение position</span>
<span class="cm">//    после записи форсит пересчёт матрицы прямо сейчас</span>
transform.position = a;
var p = transform.position;   <span class="cm">// пересчёт здесь</span>

<span class="cm">// 2. Батчь изменения: одна запись вместо трёх</span>
transform.SetPositionAndRotation(pos, rot);  <span class="cm">// не position=, потом rotation=</span>

<span class="cm">// 3. SetParent дорог (перестройка буферов иерархии):</span>
obj.transform.SetParent(parent, worldPositionStays: false);
<span class="cm">// false дешевле — без пересчёта мировой позиции</span>

<span class="cm">// Трюк для тысяч объектов: TransformAccessArray + IJobParallelForTransform</span>
<span class="cm">// — двигаем трансформы в параллельных джобах, минуя главный поток</span></pre>
<p>Структурный вывод: держите иерархии плоскими (пропсы мира — корневые объекты, а не дети «Environment»), не парентите без нужды, и помните, что localPosition дешевле world position — она не требует полной матрицы.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Трансформы живут в нативных буферах по иерархиям; запись пачкает поддерево, чтение после записи форсит пересчёт. Практика: плоские иерархии, SetPositionAndRotation вместо двух записей, SetParent с worldPositionStays:false, кэш transform. Для тысяч движущихся объектов — TransformAccessArray с IJobParallelForTransform: движение уходит в параллельные джобы».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/ScriptReference/Jobs.IJobParallelForTransform.html" target="_blank">IJobParallelForTransform</a> <span>— параллельное движение трансформов</span></li>
<li><a href="https://unity.com/how-to/optimize-scripts-unity" target="_blank">Unity: Optimize your scripts</a> <span>— раздел про transform-операции</span></li>
</ul></div>`,

28:`
<h3>Простыми словами</h3>
<p>Префаб — это шаблон. Инстанс в сцене хранит не копию, а «ссылку на шаблон + список моих отличий» (перекрашенный цвет, другая скорость). Изменил шаблон — изменились все инстансы, кроме мест, где у них свои отличия (override). Вариант префаба — «наследник»: берёт всё от базового и хранит свой набор отличий. Это система наследования для контента.</p>
<h3>Как думать об этом</h3>
<pre>Базовый префаб Enemy (меш, AI, здоровье 100)
├─ Вариант EnemyFast  (override: скорость 8, цвет синий)
├─ Вариант EnemyTank  (override: здоровье 400, масштаб 1.5)
└─ Инстансы в сценах  (у каждого могут быть свои overrides)

<span class="cm">// Правки идут «вверх» осознанно:</span>
<span class="cm">// Apply override → изменение уезжает в префаб → у ВСЕХ</span>
<span class="cm">// Revert → инстанс возвращается к шаблону</span></pre>
<p>Боль, о которой спрашивают: (1) случайный Apply All — локальная правка уехала во все инстансы игры; (2) реструктуризация базового префаба (переименование/удаление объектов) осиротляет overrides вариантов — они привязаны по внутренним ID; (3) сотни overrides на инстансе = сигнал, что нужен вариант, а не правки на месте. Вложенные префабы (турель на танке) сохраняют связь: фикс турели прилетает во все танки.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Инстанс хранит дельты от префаба: overrides свойств, добавленные компоненты/объекты. Варианты — наследование для контента: общее шасси в базе, отличия в вариантах. Дисциплина: базовые префабы стабильны, много overrides на инстансе = повод сделать вариант, Apply — осознанное действие с ревью, потому что реструктуризация базы осиротляет overrides наследников».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/PrefabVariants.html" target="_blank">Unity: Prefab Variants</a> <span>— варианты и их семантика</span></li>
<li><a href="https://docs.unity3d.com/Manual/NestedPrefabs.html" target="_blank">Unity: Nested Prefabs</a> <span>— вложенные префабы и правила распространения правок</span></li>
</ul></div>`,

29:`
<h3>Простыми словами</h3>
<p>Наивная загрузка сцены — «выгрузить всё, загрузить новое» — убивает всех менеджеров, музыку и состояние. Взрослая схема: одна лёгкая сцена-«ядро» (bootstrap) живёт всегда, а контент грузится К ней аддитивно и выгружается, не трогая ядро. Плюс контроль момента «переключения», чтобы фриз загрузки прятался за экраном/фейдом.</p>
<h3>Скелет системы загрузки</h3>
<pre><span class="cm">// Bootstrap-сцена: менеджеры, аудио, UI-рут. Живёт вечно.</span>
<span class="cm">// Контент — аддитивно:</span>
var op = SceneManager.LoadSceneAsync("Level3", LoadSceneMode.Additive);
op.allowSceneActivation = false;      <span class="cm">// грузим, но НЕ активируем</span>
while (op.progress &lt; 0.9f) { UpdateProgressBar(op.progress); await Yield(); }
await fade.Out();                     <span class="cm">// прячем переключение</span>
op.allowSceneActivation = true;       <span class="cm">// активация (тут фриз Awake-ов)</span>
await SceneManager.UnloadSceneAsync(oldScene);
await Resources.UnloadUnusedAssets(); <span class="cm">// возврат памяти — здесь, за фейдом</span>
await fade.In();</pre>
<p>Тонкости: progress останавливается на 0.9 до активации — так задумано; активация выполняет все Awake/OnEnable синхронно — это и есть главный фриз, его прячут за фейдом; большие уровни режут на подсцены (геометрия/свет/геймплей) и грузят по частям — это же спасает от конфликтов мержа.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Персистентная bootstrap-сцена плюс аддитивный контент. LoadSceneAsync с allowSceneActivation=false, прогресс до 0.9, активация за фейдом — фриз Awake-ов спрятан. Выгрузка старой сцены и UnloadUnusedAssets в контролируемый момент. Уровни разрезаны на подсцены по подсистемам — параллельная работа команды и стриминг по частям».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/ScriptReference/SceneManagement.SceneManager.LoadSceneAsync.html" target="_blank">SceneManager.LoadSceneAsync</a> <span>— API и семантика allowSceneActivation</span></li>
<li><a href="https://docs.unity3d.com/Manual/MultiSceneEditing.html" target="_blank">Unity: Multi-scene editing</a> <span>— работа с аддитивными сценами</span></li>
</ul></div>`,

30:`
<h3>Простыми словами</h3>
<p>Всем системам игры нужен доступ к «сервисам»: аудио, сохранения, инвентарь. Вопрос — как они друг друга находят. Синглтон: «я глобальный, берите меня кто хочет» — быстро писать, невозможно тестировать и понять зависимости. Service Locator: «спроси у справочной» — чуть лучше, но зависимости всё ещё спрятаны. Composition Root: «при старте игры один код создаёт все системы и раздаёт каждому то, что ему нужно» — зависимости явные, тестируется, порядок инициализации контролируем.</p>
<h3>Эволюция на примере</h3>
<pre><span class="cm">// Уровень 1: синглтон — зависимость невидима</span>
AudioManager.Instance.Play("boom");
<span class="cm">// кто зависит от аудио? grep по всему проекту...</span>

<span class="cm">// Уровень 2: локатор — чуть честнее, но всё ещё скрыто</span>
Services.Get&lt;IAudioService&gt;().Play("boom");

<span class="cm">// Уровень 3: composition root — зависимость видна в конструкторе</span>
class WeaponSystem {
    readonly IAudioService _audio;
    public WeaponSystem(IAudioService audio) { _audio = audio; }
}
<span class="cm">// Bootstrap создаёт: audio → weapons(audio) → ui(weapons)</span>
<span class="cm">// Порядок очевиден, тест подсовывает FakeAudio, всё явно</span></pre>
<p>Честная прагматика: на маленьком проекте синглтон-другой не преступление. Проблемы начинаются на масштабе: порядок инициализации 15 синглтонов, статика при отключённом domain reload, невозможность юнит-теста. DI-контейнеры (VContainer) — это composition root с автоматикой; они полезны, когда систем десятки.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Предпочитаю composition root: bootstrap создаёт системы и внедряет зависимости явно — видны в конструкторах, порядок инициализации контролируем, тесты подставляют фейки. Синглтоны — скрытые зависимости, боль порядка инициализации и статики при отключённом reload. На больших проектах — VContainer как формализованный composition root со скоупами на сцену».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://vcontainer.hadashikick.jp/" target="_blank">VContainer</a> <span>— современный DI для Unity, доки с паттернами</span></li>
<li><a href="https://gameprogrammingpatterns.com/singleton.html" target="_blank">Game Programming Patterns: Singleton</a> <span>— честный разбор, почему синглтон опасен</span></li>
</ul></div>`,

31:`
<h3>Простыми словами</h3>
<p>Сейв — это данные, которые переживут годы обновлений игры. Главные ошибки: сохранять объекты сцены напрямую (они изменятся в следующем патче), полагаться на имена и порядок (переименовали — сейв мёртв), писать без защиты (краш посреди записи = убитый прогресс игрока и единица в отзывах).</p>
<h3>Четыре столпа живучего сейва</h3>
<pre><span class="cm">// 1. Отдельная модель данных — не MonoBehaviour!</span>
[Serializable] class SaveData {
    public int version = 3;              <span class="cm">// 2. ВЕРСИЯ — всегда</span>
    public List&lt;ItemSave&gt; items;
}
[Serializable] class ItemSave {
    public string itemGuid;              <span class="cm">// 3. GUID, не имя и не индекс</span>
    public int count;
}

<span class="cm">// Миграции: цепочка v1→v2→v3, каждая маленькая</span>
if (data.version == 1) { MigrateV1toV2(data); }
if (data.version == 2) { MigrateV2toV3(data); }

<span class="cm">// 4. Атомарная запись: временный файл + переименование</span>
File.WriteAllText(path + ".tmp", json);
File.Replace(path + ".tmp", path, path + ".bak");
<span class="cm">// краш в любой точке → есть либо старый файл, либо новый, никогда обломки</span></pre>
<p>Формат: JSON для отладки и модов, бинарь/MessagePack для размера и скорости. Где хранить: <code>Application.persistentDataPath</code>. Чего не делать: BinaryFormatter (дыра в безопасности и хрупкость — официально deprecated), сериализация Vector3/ссылок на ассеты напрямую (обёртки и GUID-ы).</p>
<h3>Что сказать на собеседовании</h3>
<p>«Сейв — это POCO-модель с номером версии и цепочкой миграций; сущности по стабильным GUID, не именам. Запись атомарная — temp-файл плюс rename, чтобы краш не убивал прогресс, плюс бэкап-слот. BinaryFormatter запрещён. И тест в CI: загрузка сейвов всех выпущенных версий — миграции проверяются автоматически, а не жалобами игроков».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/ScriptReference/JsonUtility.html" target="_blank">JsonUtility</a> <span>— встроенная сериализация и её ограничения</span></li>
<li><a href="https://learn.microsoft.com/en-us/dotnet/standard/serialization/binaryformatter-security-guide" target="_blank">Microsoft: BinaryFormatter security</a> <span>— почему он запрещён</span></li>
<li><a href="https://github.com/MessagePack-CSharp/MessagePack-CSharp" target="_blank">MessagePack-CSharp</a> <span>— быстрый бинарный формат с source generator (AOT-ok)</span></li>
</ul></div>`,

32:`
<h3>Простыми словами</h3>
<p>Четыре способа доставить ассет в игру. Resources — «свалка, которая всегда с собой»: просто, но всё едет в билд и грузит старт. StreamingAssets — «файлы как есть»: для видео и конфигов. AssetBundles — «коробки с контентом», которые можно скачивать: мощно, но вся логистика вручную. Addressables — те же коробки плюс автоматический учёт: кто что использует, что можно выгрузить, откуда скачать.</p>
<h3>Шпаргалка выбора</h3>
<pre>Resources:        НЕ использовать для нового кода.
                  Легаси + пара мелочей (иконка дефолта).
                  Всё в билде, старт медленнее, память сразу.

StreamingAssets:  видео, стартовые конфиги, то, что читается
                  как файл по пути. Без выгрузки, без учёта.

AssetBundles:     низкий уровень. Только если нужен полный
                  контроль пайплайна (свой билд-конвейер).

Addressables:     ДЕФОЛТ современного проекта.
var h = Addressables.LoadAssetAsync&lt;GameObject&gt;("Boss");
await h.Task;  ...  Addressables.Release(h);
<span class="cm">// рефкаунт, зависимости, remote-каталоги, патчи и DLC</span></pre>
<p>Почему Resources — антипаттерн для контента: папка целиком пакуется в билд (нельзя патчить), индекс строится на старте (медленный запуск), и это невидимые ссылки — стриппер и анализ зависимостей их не видят. Addressables решают всё это ценой async-загрузки (мышление «хэндл + Release» — см. вопрос №33 про рефкаунт).</p>
<h3>Что сказать на собеседовании</h3>
<p>«Resources — легаси: всё в билде, медленный старт, никакого патчинга — в новом коде не использую. StreamingAssets — сырые файлы для видео и конфигов. Addressables — дефолт: рефкаунт, граф зависимостей, remote-контент для патчей и DLC поверх AssetBundles. Дисциплина — каждый Load имеет парный Release, утечки смотрю в Event Viewer».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Packages/com.unity.addressables@2.2/manual/index.html" target="_blank">Addressables manual</a> <span>— главный документ системы</span></li>
<li><a href="https://unity.com/how-to/simplify-your-content-management-addressables" target="_blank">Unity: Addressables best practices</a> <span>— организация групп и типовые схемы</span></li>
</ul></div>`,
38:`
<h3>Простыми словами</h3>
<p>Физика не может шагать «как получится» — прыжок должен быть одинаковым на 30 и на 144 FPS. Поэтому у неё свой ритм: каждые 0.02 секунды (50 раз в секунду) — шаг. Unity копит прошедшее время и делает столько шагов, сколько влезло: за кадр 33 мс — два шага физики, за кадр 10 мс — иногда ноль. Проблема: медленный кадр требует больше шагов физики, а больше шагов — ещё медленнее кадр. Это «спираль смерти», и от неё есть предохранитель.</p>
<h3>Три ручки</h3>
<pre>Time.fixedDeltaTime = 0.02;   <span class="cm">// шаг физики (50 Гц)</span>
<span class="cm">// меньше = точнее и дороже; мобилки часто живут на 0.025-0.033</span>

Time.maximumDeltaTime = 0.1;  <span class="cm">// предохранитель: за один кадр физика</span>
<span class="cm">// «догонит» максимум 0.1 с игрового времени; при долгом фризе</span>
<span class="cm">// игра замедлится вместо лавины шагов — спираль разорвана</span>

<span class="cm">// interpolation на Rigidbody сглаживает разницу ритмов</span>
<span class="cm">// физики и рендера (вопрос №39)</span></pre>
<h3>Что сказать на собеседовании</h3>
<p>«Unity накапливает время и выполняет 0..n фиксированных шагов за кадр. fixedDeltaTime — компромисс точность/CPU: понижение линейно дорожает; на мобилках часто 30-40 Гц с интерполяцией. maximumDeltaTime ограничивает догоняющие шаги и разрывает спираль смерти после фризов — игра замедляется, но не встаёт колом».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://gafferongames.com/post/fix_your_timestep/" target="_blank">Fix Your Timestep — Gaffer On Games</a> <span>— статья, объясняющая всю схему с аккумулятором</span></li>
<li><a href="https://docs.unity3d.com/Manual/class-TimeManager.html" target="_blank">Unity: Time Manager</a> <span>— все настройки времени</span></li>
</ul></div>`,

39:`
<h3>Простыми словами</h3>
<p>Физика шагает 50 раз в секунду, экран рисует 60/144. Ритмы не совпадают: в какие-то кадры физика шагнула, в какие-то нет — и мяч, летящий равномерно, на экране дёргается. Interpolation лечит это так: рисуем тело не там, где оно сейчас по физике, а плавно между прошлой и текущей физической позицией. Цена — визуальная задержка в один шаг физики. Extrapolation наоборот — предсказывает вперёд по скорости: без задержки, но на отскоках «пролетает» мимо и дёргается назад.</p>
<h3>Правила применения</h3>
<pre>Interpolate:  игрок, объекты у камеры, всё заметное глазу.
              Не бесплатно — только тем, кого видно вблизи.
Extrapolate:  почти никогда (артефакты на смене направления).
None:         дальние и малозаметные тела (дефолт).

<span class="cm">// Смертный грех с интерполируемым телом:</span>
transform.position = target;   <span class="cm">// НЕЛЬЗЯ — ломает интерполяцию,</span>
rb.MovePosition(target);       <span class="cm">// двигать только через физику</span></pre>
<h3>Что сказать на собеседовании</h3>
<p>«Джиттер — биение частот физики и рендера. Interpolation рисует между прошлым и текущим шагом: плавно, задержка один шаг — включаю игроку и цели камеры. Extrapolation предсказывает вперёд и артефачит на коллизиях — почти не использую. И никогда не пишу в transform интерполируемого тела — только MovePosition, иначе интерполяция ломается».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/ScriptReference/Rigidbody-interpolation.html" target="_blank">Rigidbody.interpolation</a> <span>— API и режимы</span></li>
<li><a href="https://gafferongames.com/post/fix_your_timestep/" target="_blank">Fix Your Timestep</a> <span>— раздел про интерполяцию состояний</span></li>
</ul></div>`,

40:`
<h3>Простыми словами</h3>
<p>Физика проверяет столкновения дискретно: «где ты был в начале шага — где ты в конце». Пуля со скоростью 100 м/с за шаг 0.02 с пролетает 2 метра. Стена толщиной 10 см целиком помещается МЕЖДУ двумя проверками — пуля «туннелирует» сквозь неё, ни разу не оказавшись внутри. Чем быстрее объект и тоньше препятствие, тем вероятнее пролёт.</p>
<h3>Решения по возрастанию цены</h3>
<pre><span class="cm">// 1. Для снарядов — вообще без физики (стандарт шутеров):</span>
if (Physics.Raycast(lastPos, (pos-lastPos).normalized,
    out var hit, Vector3.Distance(lastPos, pos), mask))
    OnHit(hit);   <span class="cm">// луч из прошлой позиции в текущую — пропусков нет</span>

<span class="cm">// 2. CCD на быстром теле: свип формы вместо телепорта</span>
rb.collisionDetectionMode = CollisionDetectionMode.ContinuousDynamic;
<span class="cm">// дорого — только на избранных телах</span>

<span class="cm">// 3. Толще коллайдеры у стен, меньше fixedDeltaTime — грубая сила</span></pre>
<h3>Что сказать на собеседовании</h3>
<p>«Туннелирование — следствие дискретных шагов: быстрый объект перескакивает тонкий коллайдер между проверками. Для снарядов — raycast из прошлой позиции в текущую: дешевле физики, точная точка попадания, дружит с лаг-компенсацией. Для физических тел — Continuous/ContinuousDynamic CCD точечно, помня о цене свип-тестов. Толщина коллайдеров и шаг физики — запасные рычаги».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/ContinuousCollisionDetection.html" target="_blank">Unity: Continuous collision detection</a> <span>— режимы CCD и их цена</span></li>
<li><a href="https://docs.unity3d.com/ScriptReference/Physics.Raycast.html" target="_blank">Physics.Raycast</a> <span>— основа снарядной модели</span></li>
</ul></div>`,

41:`
<h3>Простыми словами</h3>
<p>Матрица коллизий — таблица «кто с кем вообще может столкнуться». Пуля игрока не должна проверяться против пуль игрока, триггер подбора — против декораций. Каждая выключенная клетка — это пары объектов, которые физика отбрасывает ДО всякой математики. На сцене с сотнями коллайдеров аккуратная матрица — бесплатные проценты бюджета физики.</p>
<h3>Практика</h3>
<pre><span class="cm">// Слои — это план, а не свалка: спроектируй заранее</span>
Player, PlayerProjectile, Enemy, EnemyProjectile,
Environment, Pickup, Sensor, Ragdoll
<span class="cm">// PlayerProjectile × PlayerProjectile — ВЫКЛ</span>
<span class="cm">// Sensor × Environment — ВЫКЛ, Ragdoll × Ragdoll — по вкусу</span>

<span class="cm">// Тот же принцип в запросах — маска всегда явно:</span>
Physics.Raycast(o, d, out var hit, dist,
    LayerMask.GetMask("Enemy", "Environment"),
    QueryTriggerInteraction.Ignore);
<span class="cm">// фильтровать хиты в C# после — значит оплатить лишние проверки</span></pre>
<h3>Что сказать на собеседовании</h3>
<p>«Матрица отсекает пары на broadphase — до узкой фазы. На проекте со множеством триггеров небрежная матрица умножает работу физики впустую. Слои проектирую заранее под роли, во всех Raycast/Overlap передаю явные LayerMask и QueryTriggerInteraction, использую NonAlloc-варианты. Матрица — первое, что проверяю при дорогой физике в профайлере».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/LayerBasedCollision.html" target="_blank">Unity: Layer-based collision</a> <span>— матрица и слои</span></li>
<li><a href="https://docs.unity3d.com/Manual/Layers.html" target="_blank">Unity: Layers</a> <span>— маски в запросах</span></li>
</ul></div>`,

42:`
<h3>Простыми словами</h3>
<p>У физики три типа объектов. Статический (коллайдер без Rigidbody): «мебель» — PhysX запекает его в оптимизированную структуру и считает, что он не двигается никогда. Кинематический (Rigidbody, isKinematic=true): «рука аниматора» — двигается кодом, физика его не толкает, но он толкает других и корректно обновляет структуры. Динамический: полноценный участник — гравитация, силы, отскоки.</p>
<h3>Табличка решений</h3>
<pre>Не двигается вообще     → коллайдер без Rigidbody (static)
Двигаю кодом/анимацией  → Rigidbody isKinematic + MovePosition
  (платформы, двери, ловушки, анимированные препятствия)
Пусть физика решает     → Rigidbody динамический + силы

<span class="cm">// Классический баг: дверь с коллайдером БЕЗ rigidbody,</span>
<span class="cm">// анимация её крутит → «статический» объект двигается:</span>
<span class="cm">// события коллизий глючат, физика напрягается.</span>
<span class="cm">// Лечение: kinematic Rigidbody на всё движущееся с коллайдером.</span></pre>
<p>Про события (вопрос-фильтр): пара «static × static» не даёт НИЧЕГО; для коллизий нужен хотя бы один не-кинематический Rigidbody; для триггеров — хотя бы один Rigidbody любой. Kinematic × kinematic — триггеры да, коллизии нет.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Правило одно: всё, что движется и имеет коллайдер, обязано иметь Rigidbody — кинематический, если движу кодом. Движение кинематики через MovePosition в FixedUpdate, чтобы физика видела непрерывный путь, а не телепорты. Матрицу событий (кто с кем даёт OnCollision/OnTrigger) помню наизусть — это частый источник “почему не срабатывает триггер”».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/CollidersOverview.html" target="_blank">Unity: Colliders overview</a> <span>— таблица взаимодействий типов — выучить</span></li>
<li><a href="https://docs.unity3d.com/ScriptReference/Rigidbody.MovePosition.html" target="_blank">Rigidbody.MovePosition</a> <span>— правильное движение кинематики</span></li>
</ul></div>`,

43:`
<h3>Простыми словами</h3>
<p>Три пути сделать персонажа. CharacterController — готовая капсула «шагай и скользи»: быстро стартовать, но негибко. Динамический Rigidbody — персонаж как физический объект: честно, но управление «плывёт» и воюет с трением. Свой кинематический контроллер — сам двигаешь капсулу кастами: полный контроль ценой написания разрешения коллизий руками. Все точные платформеры и экшены — третий путь.</p>
<h3>Сравнение честно</h3>
<pre>CharacterController:
  + Move() со slide из коробки, isGrounded, step offset
  - не физичен (не толкается взрывами), капсула и только,
    склоны/ступени настраиваются грубо

Rigidbody-персонаж:
  + бесплатная физика: толчки, платформы, вес
  - «плывущее» ощущение, борьба с трением на склонах,
    прыжки через силы = непредсказуемая высота

Кинематический (свой):
  + каждая константа — ручка дизайнера; coyote time,
    буфер прыжка, точное залипание к земле
  - CapsuleCast + разрешение проникновений пишешь сам</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Прототип — CharacterController. Продакшен с требовательным ощущением — свой кинематический: kinematic rigidbody, CapsuleCast по вектору движения, скольжение по нормалям, отдельная логика земли/склонов/ступеней. Rigidbody-путь беру, когда персонаж должен честно жить в физике (толчки, качели), и терплю его цену в управляемости. Ключевой аргумент: game feel требует констант, которых в честной физике нет».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/class-CharacterController.html" target="_blank">Unity: CharacterController</a> <span>— возможности и пределы встроенного</span></li>
<li><a href="https://assetstore.unity.com/packages/tools/physics/kinematic-character-controller-99131" target="_blank">Kinematic Character Controller</a> <span>— эталонная реализация третьего пути, стоит изучить</span></li>
</ul></div>`,

216:`
<h3>Простыми словами</h3>
<p>Семейство запросов к физике: луч (Raycast) — «что на этой линии»; свип (SphereCast) — «что заденет летящий шар»; overlap (OverlapSphere) — «что внутри этой сферы прямо сейчас». Выбор — по форме вопроса: линия взгляда — луч; движение капсулы персонажа — свип; взрыв — overlap.</p>
<h3>Детали, которые проверяют</h3>
<pre><span class="cm">// SphereCast НЕ видит то, внутри чего начался!</span>
<span class="cm">// прижался к стене → каст «сквозь» неё. Лечение:</span>
<span class="cm">// отступ точки старта назад или доп. Overlap в начале.</span>

<span class="cm">// NonAlloc — обязателен в горячем коде:</span>
static readonly Collider[] _hits = new Collider[32];
int n = Physics.OverlapSphereNonAlloc(pos, r, _hits, mask);
for (int i = 0; i &lt; n; i++) { ... }   <span class="cm">// RaycastAll аллоцирует массив КАЖДЫЙ вызов</span>

<span class="cm">// Массовые запросы → джобы:</span>
<span class="cm">// RaycastCommand.ScheduleBatch — сотни лучей параллельно вне главного потока</span></pre>
<h3>Что сказать на собеседовании</h3>
<p>«Луч — линия, свип — объём в движении, overlap — объём на месте. Всегда LayerMask и QueryTriggerInteraction явно, NonAlloc-варианты с переиспользуемым буфером. Знаю слепую зону SphereCast на старте. Для сотен запросов за кадр — RaycastCommand в джобах».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/ScriptReference/Physics.html" target="_blank">Physics API</a> <span>— всё семейство запросов</span></li>
<li><a href="https://docs.unity3d.com/ScriptReference/RaycastCommand.html" target="_blank">RaycastCommand</a> <span>— батч-рейкасты в Job System</span></li>
</ul></div>`,

217:`
<h3>Простыми словами</h3>
<p>OnCollision — «мы столкнулись как твёрдые тела»: есть точки контакта, сила удара. OnTrigger — «мы пересеклись как призраки»: коллайдер помечен isTrigger, физического отклика нет, только факт «вошёл/вышел». Триггеры — для зон (подбор, урон, детекция), коллизии — для честных ударов.</p>
<h3>Матрица, которую спрашивают</h3>
<pre>Для OnCollision*: в паре нужен ≥1 НЕкинематический Rigidbody
Для OnTrigger*:   в паре нужен ≥1 Rigidbody (кинематический ок)
static × static:  НИЧЕГО не приходит никогда

<span class="cm">// Частые грабли:</span>
<span class="cm">// - OnCollisionStay замолкает, когда тела уснули</span>
<span class="cm">// - коллбэки идут в шаге физики: Destroy внутри → </span>
<span class="cm">//   аккуратно, состояние может читаться дальше в этом шаге</span>
<span class="cm">// - Enter без Exit (объект удалён внутри триггера) —</span>
<span class="cm">//   счётчики «кто в зоне» вести с чисткой мёртвых</span></pre>
<h3>Что сказать на собеседовании</h3>
<p>«Коллизии дают ContactPoint-ы и импульс, требуют некинематический Rigidbody в паре; триггеры — только факт пересечения, достаточно любого Rigidbody. Помню: Stay умирает со сном тел, static×static молчит, а списки “кто внутри зоны” нужно чистить от уничтоженных — Exit по ним не придёт».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/CollidersOverview.html" target="_blank">Colliders overview</a> <span>— официальная таблица «кто получает какие события»</span></li>
</ul></div>`,

218:`
<h3>Простыми словами</h3>
<p>Солвер физики — переговорщик: у него сотни требований («не проникать», «джойнт держит») и он итеративно их удовлетворяет. Больше итераций — жёстче и стабильнее контакты, дороже CPU. Contact offset — «личное пространство» коллайдера: контакты создаются чуть до касания, чтобы не мерцать на границе.</p>
<h3>Ручки и их симптомы</h3>
<pre>solverIterations (6):          стопка ящиков пружинит/тонет → поднять
solverVelocityIterations (1):  дрожь скоростей после ударов → поднять
<span class="cm">// поднимать на КОНКРЕТНЫХ телах (rb.solverIterations), не глобально</span>

contactOffset:  мал → дрожь мерцающих контактов; велик → зазоры
bounceThreshold: ниже этой скорости нет отскока (убирает микропрыжки)
sleepThreshold:  когда тела засыпают (см. вопрос №226)</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Итерации солвера — валюта стабильности: стопки, джойнты под нагрузкой и тяжёлые на лёгких требуют больше; поднимаю на конкретных телах, а не глобально. Знаю симптоматику: пружинящие стопки — мало позиционных итераций, дрожь контактов — contactOffset, микроотскоки — bounceThreshold. Всё это бюджет CPU, поэтому сначала профайлер, потом ручки».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/class-PhysicsManager.html" target="_blank">Physics settings</a> <span>— все глобальные ручки с описаниями</span></li>
</ul></div>`,

219:`
<h3>Простыми словами</h3>
<p>Джойнт — «сустав» между двумя телами: дверная петля (Hinge), сварка (Fixed), пружина (Spring), сустав рэгдолла (Character), конструктор всего (Configurable). Солвер каждый шаг пытается удержать ограничение, и когда условия плохие (огромная разница масс, длинные цепи) — джойнты растягиваются и взрываются.</p>
<h3>Правила стабильности</h3>
<pre>1. Массы соединённых тел — в пределах ~10x друг от друга
   (1 кг тянет 100 кг → взрыв; лечится massScale)
2. Длинные цепи растягиваются → больше итераций у звеньев,
   короче цепь, или ArticulationBody (не растягивается по построению)
3. Не телепортировать соединённые тела через transform
4. Разрушаемость: breakForce + OnJointBreak
5. Верёвки — не гирлянда джойнтов, а verlet-цепь</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Configurable покрывает всё кастомное; стабильность — это соотношения масс до ~10x, итерации на звеньях и никаких телепортов. Для цепей и манипуляторов — ArticulationBody с reduced-coordinate солвером: он не растягивается в принципе. Верёвки и ткань — специализированные решения, а не цепочки джойнтов».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/Joints.html" target="_blank">Unity: Joints</a> <span>— обзор типов</span></li>
<li><a href="https://docs.unity3d.com/Manual/class-ArticulationBody.html" target="_blank">ArticulationBody</a> <span>— нерастяжимые цепи</span></li>
</ul></div>`,

44:`
<h3>Простыми словами</h3>
<p>Animator (Mecanim) — визуальная стейт-машина: состояния-клипы, стрелки-переходы, параметры-условия. Удобно дизайнеру, но на 100+ состояниях граф превращается в спагетти. Playables — конструктор анимационных графов из кода: сам решаешь, какие клипы смешивать и с какими весами, без стейт-машины вообще. Legacy Animation — прошлый век, но всё ещё дешевле всех для простой вертушки на пропе.</p>
<h3>Расклад по задачам</h3>
<pre>Локомоция (idle/walk/run/jump):  Mecanim + blend tree — его стихия
Боёвка со 100+ атаками:          Playables/CrossFade из кода —
                                 данные, а не граф из тысячи стрелок
Катсцены:                        Timeline (сам на Playables)
Вращающийся вентилятор:          Legacy Animation или скрипт

<span class="cm">// Программный подход без графа:</span>
animator.CrossFadeInFixedTime(stateHash, 0.1f);
<span class="cm">// код владеет переходами; стейт-машина — только локомоция</span></pre>
<h3>Что сказать на собеседовании</h3>
<p>«Mecanim — для локомоции и того, что дизайнер крутит сам; на масштабе боёвки граф не поддерживаем — атаки уходят в data-driven слой на Playables или CrossFade по хэшам состояний. Playables дают процедурное смешивание и загрузку клипов по требованию. Legacy жив только для тривиальных пропов».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/Playables.html" target="_blank">Unity: Playables API</a> <span>— графы анимации из кода</span></li>
<li><a href="https://docs.unity3d.com/Manual/AnimationOverview.html" target="_blank">Animation overview</a> <span>— карта всех систем анимации</span></li>
</ul></div>`,

45:`
<h3>Простыми словами</h3>
<p>Цена анимации = сэмплирование кривых (на каждую кость) + ретаргетинг + запись в трансформы. 50 персонажей по 100 костей — это тысячи кривых каждый кадр. Хорошая новость: почти всё это можно резать — костями, частотой, расстоянием и куллингом.</p>
<h3>Чеклист оптимизации</h3>
<pre>1. Optimize Game Objects (в импорте рига):
   кости НЕ создают GameObject-ы → иерархия сцены пуста,
   меньше трансформов, быстрее всё
2. cullingMode = CullUpdateTransforms/CullCompletely:
   за экраном не писать кости / не считать вовсе
3. LOD аниматоров: дальним NPC 10-15 Гц с интерполяцией,
   распределить по кадрам (стаггеринг)
4. Компрессия клипов + меньше ключей (вопрос №237)
5. Animators в профайлере: сколько в главном потоке —
   Playables/джобы уводят вычисление на воркеров</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Порядок действий: Optimize Game Objects — скелет во внутренних буферах вместо тысяч GameObject; culling mode для внеэкранных — помню разницу CullUpdateTransforms (логика идёт) и CullCompletely (всё стоит, патрули замирают); LOD частоты обновления по дистанции со стаггерингом; компрессия клипов. Смотрю категорию Animators в таймлайне — main thread против воркеров».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/FBXImporter-Rig.html" target="_blank">Rig import: Optimize Game Objects</a> <span>— главная галочка</span></li>
<li><a href="https://docs.unity3d.com/ScriptReference/Animator-cullingMode.html" target="_blank">Animator.cullingMode</a> <span>— режимы куллинга и их семантика</span></li>
</ul></div>`,

46:`
<h3>Простыми словами</h3>
<p>Root motion: движение зашито в сам клип — аниматор двигает персонажа, ноги не скользят, вес чувствуется. In-place: клип шагает на месте, а двигает персонажа код — отзывчиво, предсказуемо, легко для сети. Конфликт: анимация красивее с root motion, управление честнее с кодом.</p>
<h3>Гибрид, который реально шипят</h3>
<pre>Локомоция:  код двигает (отзывчивость, сеть),
            клипы in-place, скорость кода = скорости клипа
Атаки/рывки/добивания:  root motion (авторская дуга движения)
            через OnAnimatorMove → в контроллер:
void OnAnimatorMove() {
    controller.Move(animator.deltaPosition);  <span class="cm">// коллизии живы!</span>
}
<span class="cm">// НЕ сырое применение к transform — пройдёт сквозь стену</span></pre>
<h3>Что сказать на собеседовании</h3>
<p>«Гибрид: локомоция кодом на in-place клипах — отзывчивость и сетевое предсказание; root motion на атаках и рывках, где авторская траектория важнее. Дельты перехватываю в OnAnimatorMove и провожу через контроллер, чтобы коллизии работали. Знаю сетевую боль root motion — прокси дрейфуют, нужна коррекция позиции (вопрос №246)».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/RootMotion.html" target="_blank">Unity: Root Motion</a> <span>— как извлекается и применяется</span></li>
<li><a href="https://docs.unity3d.com/ScriptReference/MonoBehaviour.OnAnimatorMove.html" target="_blank">OnAnimatorMove</a> <span>— точка перехвата дельт</span></li>
</ul></div>`,

230:`
<h3>Простыми словами</h3>
<p>Слои Animator — это «прозрачные плёнки» поверх базовой анимации: низ тела бежит (базовый слой), верх стреляет (слой с маской на торс и руки). AvatarMask говорит, какие кости слой имеет право трогать. Так один персонаж бежит, целится и получает урон одновременно — без клипа «бег-стрельба-вздрагивание».</p>
<h3>Схема и цена</h3>
<pre>Base (вес 1):      полное тело — локомоция
UpperBody (вес 1): маска торс+руки — стрельба/перезарядка
Additive (вес ~):  дыхание, отдача — дельты поверх

animator.SetLayerWeight(1, w);  <span class="cm">// плавный вход/выход слоя из кода</span>

<span class="cm">// Цена: каждый активный слой — полный проход вычисления</span>
<span class="cm">// по своим костям. 5+ слоёв на толпе — уже статья бюджета.</span>
<span class="cm">// Sync layers: те же состояния, другие клипы (раненая локомоция)</span></pre>
<h3>Что сказать на собеседовании</h3>
<p>«Классика: базовый слой — локомоция, верхний с AvatarMask на торс — действия рук, аддитивный — дыхание и отдача. Веса слоёв анимирую из кода. Помню цену — каждый слой считается отдельно; и ловушку Additive — при неверной референсной позе поза дрейфует. Для сложного — Playables, где смешивание под полным контролем».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/AnimationLayers.html" target="_blank">Animation Layers</a> <span>— слои, маски, режимы</span></li>
</ul></div>`,

231:`
<h3>Простыми словами</h3>
<p>Blend tree — плавное смешивание клипов по параметру: скорость 0 → idle, 3 → walk, 6 → run, а 4.5 — это 50/50 walk и run. 2D-деревья смешивают по двум осям (скорость + направление) для стрейфов. Главная болезнь смешивания — скольжение ног.</p>
<h3>Почему ноги скользят и как чинить</h3>
<pre>Причина 1: скорость персонажа ≠ скорость клипа
  walk снят на 1.5 м/с, а код двигает 2 м/с → скольжение
  → пороги дерева ставить на РЕАЛЬНЫЕ скорости клипов
    (кнопка Compute Thresholds из root motion)

Причина 2: клипы с разным каденсом
  walk 1.2 шага/с + run 2 шага/с → в бленде ноги «путаются»
  → клипы с совместимым ритмом; Mecanim синхронизирует
    фазы через normalized time похожих клипов

Типы 2D: Simple Directional (клип на направление),
Freeform Directional (+ скорости), Freeform Cartesian
(любые пары параметров, напр. скорость × поворот)</pre>
<h3>Что сказать на собеседовании</h3>
<p>«1D — скорость, 2D Freeform Directional — стрейф-сеты. Скольжение лечу с двух сторон: пороги на реальные скорости клипов (Compute Thresholds) и согласование скорости кода с анимацией; каденс клипов должен быть совместим, иначе бленд ломает фазу шагов. Проверяю с включённым foot IK и превью дерева».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/class-BlendTree.html" target="_blank">Blend Trees</a> <span>— типы и настройка</span></li>
<li><a href="https://docs.unity3d.com/Manual/BlendTree-2DBlending.html" target="_blank">2D Blending</a> <span>— выбор типа 2D-дерева</span></li>
</ul></div>`,

232:`
<h3>Простыми словами</h3>
<p>Animation event — «в кадре 12 клипа вызови метод Footstep()». Просто и наглядно, но у них две беды: они привязаны строкой к имени метода (переименовал — молча сломалось) и они ПРОПУСКАЮТСЯ, если переход оборвал клип раньше события. Комбо-система, где «сброс комбо» висел на событии в конце клипа, разваливается от первого прерывания.</p>
<h3>Надёжность по задачам</h3>
<pre>Шаги, свисты, пыль (косметика):   events ок; на блендах
  фильтровать по весу клипа — иначе двойные шаги walk↔run

Обязательная логика (снять бафф, выключить хитбокс):
  StateMachineBehaviour.OnStateExit — приходит ДАЖЕ при
  прерывании перехода. Или код по normalized time.

Боевые окна (хитбоксы, отмены):
  данные (0.3-0.5 клипа = окно удара) + опрос normalized time
  в коде — детерминированно, сериализуемо, тестируемо</pre>
<h3>Что сказать на собеседовании</h3>
<p>«События клипов пропускаются при прерывании переходов и держатся на строках — для must-run логики использую OnStateExit у StateMachineBehaviour (срабатывает даже при прерывании) или тайминги из данных с опросом normalized time. Events оставляю косметике, с фильтром по весу на блендах. Боевые окна — только данные, не события: детерминизм и сеть».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/script-AnimationWindowEvent.html" target="_blank">Animation Events</a> <span>— механика и ограничения</span></li>
<li><a href="https://docs.unity3d.com/ScriptReference/StateMachineBehaviour.html" target="_blank">StateMachineBehaviour</a> <span>— OnStateEnter/Exit как надёжная альтернатива</span></li>
</ul></div>`,

233:`
<h3>Простыми словами</h3>
<p>Generic-риг: кости анимируются напрямую — клип подходит только этому скелету. Humanoid: Unity переводит скелет в универсальное «мышечное пространство» (каждый сустав — число от -1 до 1 в анатомических пределах), и любой humanoid-клип играется на любом humanoid-персонаже. Одна библиотека мокапа — на весь зоопарк персонажей.</p>
<h3>Цена универсальности</h3>
<pre>Humanoid даёт: ретаргетинг, зеркалирование, foot IK,
  переиспользование клипов и мокапа
Humanoid берёт: CPU на конверсию в muscle space,
  дрейф контактов на нестандартных пропорциях
  (длинные руки режут торс — чинится IK в ключевых точках),
  пальцы/twist-кости требуют явного маппинга

Generic: точнее и дешевле, но клипы непереносимы.
Выбор: люди с общей библиотекой → Humanoid;
существа, механизмы, уникальный hero-риг → Generic</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Humanoid — ретаргетинг через muscle space: одна библиотека на всех гуманоидов, плюс зеркалирование и foot IK, ценой CPU и дрейфа контактов на крайних пропорциях. Generic — точность и скорость без переносимости. Правило: массовые человеческие анимации и мокап — Humanoid; существа и герои с уникальной анимацией — Generic. Хвосты и плащи на гуманоиде едут Generic-подчастями».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/AvatarCreationandSetup.html" target="_blank">Avatar setup</a> <span>— настройка humanoid-маппинга</span></li>
<li><a href="https://blog.unity.com/technology/mecanim-humanoids" target="_blank">Unity Blog: Mecanim Humanoids</a> <span>— как устроено muscle space, от авторов</span></li>
</ul></div>`,

234:`
<h3>Простыми словами</h3>
<p>IK (инверсная кинематика) — «вот цель для ладони, сам посчитай углы локтя и плеча». Прямая задача (FK) — от углов к позиции, обратная — от позиции к углам. В Unity два инструмента: встроенный humanoid-IK (4 конечности + взгляд, из OnAnimatorIK) и пакет Animation Rigging (констрейнты на любом риге, работает в джобах).</p>
<h3>Выбор инструмента</h3>
<pre>Встроенный (только Humanoid):
  animator.SetIKPosition(AvatarIKGoal.LeftFoot, pos);
  animator.SetIKPositionWeight(AvatarIKGoal.LeftFoot, w);
  <span class="cm">// стопы на склонах, руки на уступах, взгляд — хватает</span>

Animation Rigging (любой риг, Burst):
  TwoBoneIK      — конечности
  MultiAim       — прицеливание (точнее 2D blend tree!)
  ChainIK        — хвосты, позвоночник
  DampedTransform — болтающееся снаряжение
  <span class="cm">// веса рига анимируются → плавный вход/выход</span>

Full-body IK (лазание): FinalIK или свой солвер</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Встроенный IK — четыре цели и взгляд из OnAnimatorIK, достаточно для постановки стоп и хвата. Современный ответ — Animation Rigging: констрейнты на любом риге, вычисляются в джобах; ригом прицеливания через MultiAim заменяю aim-blend tree — точнее и дешевле в поддержке. Full-body — отдельные решения. Веса всегда анимирую — резкий IK хуже его отсутствия».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Packages/com.unity.animation.rigging@1.3/manual/index.html" target="_blank">Animation Rigging</a> <span>— все констрейнты с примерами</span></li>
<li><a href="https://docs.unity3d.com/Manual/InverseKinematics.html" target="_blank">Unity: Inverse Kinematics</a> <span>— встроенный humanoid-IK</span></li>
</ul></div>`,

235:`
<h3>Простыми словами</h3>
<p>Каждый <code>SetFloat("Speed", v)</code> сначала превращает строку в хэш — каждый раз заново. На одном персонаже неважно, на пятидесяти по десять параметров — уже измеримо. Плюс липкие триггеры и чтение состояния «не в тот момент» — типовой набор граблей Animator API.</p>
<h3>Гигиена в четырёх пунктах</h3>
<pre><span class="cm">// 1. Хэши — один раз и навсегда</span>
static readonly int SpeedId = Animator.StringToHash("Speed");
animator.SetFloat(SpeedId, v);

<span class="cm">// 2. Не писать неизменившееся (каждый Set пачкает состояние)</span>
if (!Mathf.Approximately(v, _last)) { animator.SetFloat(SpeedId, v); _last = v; }

<span class="cm">// 3. SetTrigger ЛИПКИЙ: непотреблённый выстрелит позже</span>
<span class="cm">//    в худший момент → ResetTrigger при смене контекста,</span>
<span class="cm">//    или bool/CrossFade для прерываемых действий</span>

<span class="cm">// 4. GetCurrentAnimatorStateInfo отражает состояние ПОСЛЕ</span>
<span class="cm">//    последнего вычисления — чтение до апдейта аниматора</span>
<span class="cm">//    даёт баги «на один кадр»</span></pre>
<h3>Что сказать на собеседовании</h3>
<p>«Кэширую хэши через StringToHash в static readonly, пишу параметры только при изменении, помню липкость SetTrigger — сбрасываю при сменах состояний или заменяю на bool. Для боёвки часто обхожу параметры вовсе — CrossFadeInFixedTime по хэшам состояний, код владеет переходами. На толпах параметры пишет один менеджер батчем».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/ScriptReference/Animator.StringToHash.html" target="_blank">Animator.StringToHash</a> <span>— хэширование параметров</span></li>
<li><a href="https://docs.unity3d.com/ScriptReference/Animator.CrossFadeInFixedTime.html" target="_blank">CrossFadeInFixedTime</a> <span>— переходы из кода без стрелок</span></li>
</ul></div>`,

236:`
<h3>Простыми словами</h3>
<p>StateMachineBehaviour — скрипт, прикреплённый не к объекту, а к СОСТОЯНИЮ Animator-а: OnStateEnter при входе, OnStateExit при выходе. Killer-фича: Exit приходит даже когда состояние прервали переходом — в отличие от animation events. Идеален для «включи хитбокс на входе в атаку, выключи на выходе — гарантированно».</p>
<h3>Ловушки использования</h3>
<pre><span class="cm">// Главная: SMB — не MonoBehaviour! Нет сцены, нет Awake.</span>
<span class="cm">// Ссылки на объект — через animator в коллбэке:</span>
public override void OnStateEnter(Animator anim, ...) {
    if (_combat == null) _combat = anim.GetComponent&lt;CombatSystem&gt;();
    _combat.EnableHitbox();
}
<span class="cm">// (кэш допустим — инстанс SMB свой на каждый Animator)</span>

<span class="cm">// Коллбэки выполняются ВНУТРИ вычисления аниматора:</span>
<span class="cm">// тяжёлая работа и смена состояний оттуда → тонкие баги порядка.</span>
<span class="cm">// Правило: SMB — тонкий адаптер, поднимающий событие</span>
<span class="cm">// в реальную систему, а не дом для логики.</span></pre>
<h3>Что сказать на собеседовании</h3>
<p>«SMB — логика со скоупом состояния: хитбоксы, звуки локомоции, чистка триггеров на входе. Ключевое преимущество — OnStateExit срабатывает даже при прерывании. Ловушки: нет нормального жизненного цикла (ссылки резолвятся через animator), коллбэки внутри вычисления аниматора — держу их тонкими адаптерами, поднимающими события в системы, а не логикой».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/ScriptReference/StateMachineBehaviour.html" target="_blank">StateMachineBehaviour</a> <span>— API и жизненный цикл</span></li>
</ul></div>`,
47:`
<h3>Простыми словами</h3>
<p>Canvas в uGUI перестраивается ЦЕЛИКОМ, если изменился любой его элемент. Крутится одна иконка загрузки — весь канвас с сотней элементов пересобирает геометрию и батчи каждый кадр. Это фундаментальное свойство системы, и вся оптимизация uGUI сводится к «изолировать то, что меняется, от того, что не меняется».</p>
<h3>Плейбук оптимизации HUD</h3>
<pre>1. Делить канвасы по частоте изменений:
   CanvasStatic (рамки, фоны — никогда)
   CanvasSlow   (здоровье, патроны — иногда)
   CanvasFast   (таймер, спиннер — каждый кадр)

2. Raycast Target OFF у ВСЕЙ неинтерактивной графики
   (каждая включённая — проверка при каждом движении мыши/пальца)

3. Layout Group-ы — вон из динамики: изменение ребёнка
   каскадит пересчёт; позиционировать RectTransform-ом

4. Не SetActive для скрытия — Canvas.enabled=false или
   CanvasGroup.alpha (SetActive → полный ребилд при включении)

5. Списки — пул + виртуализация (вопрос №251)</pre>
<h3>Что сказать на собеседовании</h3>
<p>«uGUI пересобирает канвас целиком при изменении любого элемента — поэтому режу канвасы по частоте обновления, выключаю Raycast Target у декора, избегаю LayoutGroup в динамике и прячу экраны через Canvas.enabled, а не SetActive. Диагноз ставлю по маркерам Canvas.SendWillRenderCanvases и BuildBatch в профайлере».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://unity.com/how-to/unity-ui-optimization-tips" target="_blank">Unity: UI optimization tips</a> <span>— официальный сборник практик</span></li>
<li><a href="https://learn.unity.com/tutorial/optimizing-unity-ui" target="_blank">Unity Learn: Optimizing Unity UI</a> <span>— классический подробный гайд (Ian Dundore)</span></li>
</ul></div>`,

48:`
<h3>Простыми словами</h3>
<p>uGUI — «старая гвардия»: канвасы из GameObject-ов, всё мышкой, огромная экосистема. UI Toolkit — «веб-подход»: разметка (UXML, как HTML), стили (USS, как CSS), виртуализация списков из коробки, ретейнед-рендер без пересборки канвасов. Для редакторных инструментов UI Toolkit уже безальтернативен; для игрового UI выбор зависит от требований.</p>
<h3>Матрица выбора (честная)</h3>
<pre>UI Toolkit сильнее:  сложные экранные интерфейсы с данными
  (инвентари на тысячи ячеек, таблицы, меню), редакторные
  инструменты, темизация, биндинг данных (Unity 6)
uGUI сильнее:        world-space UI (только с 6.2+ у UIT),
  кастомные шейдеры/материалы на элемент, VFX-heavy UI,
  зависимость от ассетов (все сторонние UI-киты — uGUI)

Смешивать МОЖНО: HUD на uGUI + меню/инвентарь на UIT —
частый переходный паттерн</pre>
<h3>Что сказать на собеседовании</h3>
<p>«UI Toolkit — retained-mode с USS-стилями, Flexbox-лейаутом и встроенной виртуализацией: выигрывает на сложных data-heavy экранах и стал стандартом для editor-инструментов; runtime data binding в Unity 6 делает MVVM реальным. uGUI держит world-space, пер-элементные материалы и экосистему. На новом проекте: инструменты — только UIT, игровой UI — по требованиям, смешение допустимо».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/UI-system-compare.html" target="_blank">Unity: Comparison of UI systems</a> <span>— официальная таблица сравнения</span></li>
<li><a href="https://docs.unity3d.com/Manual/UIElements.html" target="_blank">UI Toolkit manual</a> <span>— главный вход в систему</span></li>
</ul></div>`,

49:`
<h3>Простыми словами</h3>
<p>Экраны бывают от квадратных планшетов до «лапши» 21:9, плюс вырезы и скруглённые углы. Стратегия из трёх частей: CanvasScaler масштабирует весь UI под разрешение, якоря прибивают элементы к краям/углам, safe area отодвигает контент от вырезов.</p>
<h3>Рабочая настройка</h3>
<pre>CanvasScaler: Scale With Screen Size,
  reference 1920×1080, match 0.5 (или 1.0 для портретных)

Якоря: элемент привязан туда, где он логически живёт —
  миникарта → правый верх, кнопки → низ; растяжимые
  панели — anchor min/max по краям, не фиксированный размер

Safe area (вырезы):
var sa = Screen.safeArea;   <span class="cm">// в пикселях</span>
<span class="cm">// корневой RectTransform под HUD: anchorMin/Max из sa,</span>
<span class="cm">// пересчитывать на смену ориентации</span>
panel.anchorMin = sa.position / new Vector2(Screen.width, Screen.height);
panel.anchorMax = (sa.position + sa.size) / new Vector2(Screen.width, Screen.height);</pre>
<h3>Что сказать на собеседовании</h3>
<p>«CanvasScaler в Scale With Screen Size с match под макет, якоря по логической принадлежности элементов, отдельный safe-area рут из Screen.safeArea для вырезов. Тестирую крайности — 4:3 и 21:9 — в списке устройств Game view; фиксированные размеры и центрированные якоря на всё — типовые причины поехавшего UI».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/script-CanvasScaler.html" target="_blank">CanvasScaler</a> <span>— режимы и match</span></li>
<li><a href="https://docs.unity3d.com/ScriptReference/Screen-safeArea.html" target="_blank">Screen.safeArea</a> <span>— вырезы и скругления</span></li>
</ul></div>`,

50:`
<h3>Простыми словами</h3>
<p>Старый Text растеризует шрифт в картинку конкретного размера: увеличил — мыло. TMP хранит глифы как SDF (карту расстояний до контура): шейдер восстанавливает идеально резкий контур на ЛЮБОМ масштабе, а обводки/тени/свечения — это математика в том же шейдере, а не дополнительная геометрия.</p>
<h3>Что нужно знать глубже</h3>
<pre>Атласы: Static — набор глифов запечён (латиница, UI) —
  предсказуемо; Dynamic — глифы добавляются на лету
  (CJK, пользовательский ввод) — риск фриза на новом глифе
  → прогрев: font.TryAddCharacters(ожидаемые строки)

Fallback-цепочка: основной → кириллица → CJK → эмодзи;
  каждый задействованный атлас = +1 draw call на текст

Перф-правила:
  tmp.SetText("HP: {0}", hp);  <span class="cm">// без строк-мусора</span>
  <span class="cm">// text = "..." — полная пересборка меша: только по изменению</span>
  <span class="cm">// Outline-компонент uGUI = 9x геометрии; у TMP обводка бесплатна в шейдере</span></pre>
<h3>Что сказать на собеседовании</h3>
<p>«TMP — SDF-рендеринг: резкость на любом масштабе, эффекты в шейдере без лишней геометрии. Знаю операционные детали: динамические атласы фризят на новых глифах — прогреваю для CJK; fallback-цепочки коротко — каждый атлас это draw call; SetText с числами вместо конкатенации и обновление только по изменению значения».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Packages/com.unity.textmeshpro@4.0/manual/index.html" target="_blank">TextMeshPro manual</a> <span>— атласы, fallback, шейдеры</span></li>
<li><a href="https://docs.unity3d.com/Packages/com.unity.textmeshpro@4.0/manual/FontAssetsSDF.html" target="_blank">TMP: SDF font assets</a> <span>— как работает SDF</span></li>
</ul></div>`,

247:`
<h3>Простыми словами</h3>
<p>Куда рисуется канвас: Overlay — поверх всего, минуя камеру (дёшево, но пост-эффекты и 3D-объекты не могут быть перед ним); Screen Space Camera — на плоскости перед камерой (пост-эффекты работают, тряска камеры качает UI); World Space — объект в мире (экраны на стенах, VR, полоски над головами).</p>
<h3>Выбор по задаче</h3>
<pre>HUD, меню:              Overlay (дефолт, самый дешёвый)
UI под блюром/тонмапом: Screen Space Camera
Экран в кабине, VR:     World Space

Нюансы SSC: нужна отдельная камера (culling+проходы),
  сортировка с 3D — по plane distance
Нюансы WS: event camera для кликов, transparent queue —
  сортировка с партиклами вручную; сотни полосок здоровья
  на канвасах умрут → инстансированные квады (вопрос №258)</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Overlay для HUD — дёшево, но вне пост-обработки; Screen Space Camera — когда UI нужны эффекты камеры, ценой реальной камеры; World Space — диегетика и VR, с event camera и ручной сортировкой в transparent. Массовые world-элементы вроде полосок — не канвасы, а инстансированная геометрия или проекция на HUD».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/UICanvas.html" target="_blank">Unity: Canvas</a> <span>— три режима подробно</span></li>
</ul></div>`,

248:`
<h3>Простыми словами</h3>
<p>Когда элемент UI меняется, до рендера происходят три волны работы: layout (пересчитать размеры и позиции — LayoutGroup-ы делают это каскадом), graphic rebuild (перегенерировать меши — текст дороже всех) и батчинг (отсортировать и склеить геометрию канваса). Понимание, какая из трёх волн жрёт время, определяет правильный фикс.</p>
<h3>Диагностика по маркерам</h3>
<pre>Canvas.SendWillRenderCanvases — C#-волны (layout + rebuild):
  высокий → кто-то пачкает элементы каждый кадр
  (текст без change-check, анимированный fillAmount,
   Animator на UI, LayoutGroup в динамике)

Canvas.BuildBatch / WaitingForJob — нативный батчинг:
  высокий → слишком много геометрии на пачкаемом канвасе
  → делить канвасы, пулить элементы

<span class="cm">// Frame Debugger покажет, ЧТО рвёт батчи:</span>
<span class="cm">// перемешанные материалы/шрифты/атласы между элементами</span></pre>
<h3>Что сказать на собеседовании</h3>
<p>«Пайплайн: layout-проход снизу вверх, graphic rebuild грязных мешей (текст — самый дорогой), затем нативная сортировка и батчинг всего канваса. Гранулярность пачканья — канвас целиком, отсюда вся стратегия разделения. Различаю два маркера: SendWillRenderCanvases — C#-ребилды, BuildBatch — батчинг; лечатся по-разному, поэтому сначала смотрю, какой из них горит».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://learn.unity.com/tutorial/optimizing-unity-ui" target="_blank">Optimizing Unity UI (Dundore)</a> <span>— глубокий разбор пайплайна ребилда</span></li>
<li><a href="https://docs.unity3d.com/Manual/profiler-ui.html" target="_blank">Profiler: UI module</a> <span>— чтение UI-метрик</span></li>
</ul></div>`,

249:`
<h3>Простыми словами</h3>
<p>Каждое движение пальца/мыши EventSystem спрашивает у всех рейкастеров: «что под указателем?» GraphicRaycaster канваса проверяет ВСЕ элементы с включённым Raycast Target. Сотни иконок и текстов с включённой галочкой = сотни проверок прямоугольников на каждое движение. А потом событие всплывает по иерархии до того, кто его обработает.</p>
<h3>Оптимизация и механика</h3>
<pre>1. Raycast Target OFF всему неинтерактивному — правило №1,
   закрепить валидатором
2. Убрать GraphicRaycaster с канвасов без интеракции
3. CanvasGroup.blocksRaycasts = false — выключить зону разом
   (и на время фейд-аута, чтобы умирающий UI не ел клики)

<span class="cm">// Механика событий: интерфейсы + всплытие</span>
IPointerClickHandler, IBeginDragHandler, IDragHandler...
<span class="cm">// событие идёт вверх по родителям до первого обработчика;</span>
<span class="cm">// для геймпада — граф навигации Selectable (аудит в Explicit!)</span></pre>
<h3>Что сказать на собеседовании</h3>
<p>«GraphicRaycaster тестирует каждую графику с Raycast Target при движении указателя — поэтому выключаю его у декора тотально, снимаю рейкастеры с неинтерактивных канвасов, зоны глушу через blocksRaycasts. События — интерфейсы ExecuteEvents со всплытием. Для геймпада прохожу граф навигации Selectable руками — авто-навигация прыгает непредсказуемо».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Packages/com.unity.ugui@2.0/manual/EventSystem.html" target="_blank">EventSystem</a> <span>— архитектура событий uGUI</span></li>
<li><a href="https://docs.unity3d.com/Packages/com.unity.ugui@2.0/manual/script-GraphicRaycaster.html" target="_blank">GraphicRaycaster</a> <span>— как работает и что стоит</span></li>
</ul></div>`,

250:`
<h3>Простыми словами</h3>
<p>Якоря — «к чему прибит элемент» в родителе (две нормализованные точки). Pivot — «где у элемента ручка», вокруг неё вращение и масштаб. Если якоря совпадают — элемент фиксированного размера на расстоянии от точки якоря; если разъехались — элемент растягивается вместе с родителем, а offsets задают отступы в пикселях.</p>
<h3>Минимум математики, который спрашивают</h3>
<pre>anchoredPosition = вектор от точки якоря до PIVOT-а элемента
  (поэтому смена pivot двигает элемент при тех же числах)

sizeDelta = размер − размер якорного прямоугольника
  якоря совпадают → sizeDelta = реальный размер
  якоря растянуты → sizeDelta(-40,0) = отступы по 20px с боков
  <span class="cm">// главная путаница у джунов — «почему sizeDelta отрицательный»</span>

Инспекторные Left/Top/Right/Bottom = offsetMin/offsetMax
Код: двигать через anchoredPosition (не localPosition!),
финальный размер читать из rect, мировые углы — GetWorldCorners</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Якоря — нормализованные точки в родителе: совпали — фикс-размер, разъехались — растяжение с пиксельными offsets. anchoredPosition меряется от якоря до pivot, sizeDelta — разница с якорным прямоугольником, отсюда отрицательные значения у растянутых. Из кода — anchoredPosition, чтобы якорная логика жила; якоря ставлю по логической привязке элемента».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Packages/com.unity.ugui@2.0/manual/UIBasicLayout.html" target="_blank">Basic Layout</a> <span>— якоря и pivot с картинками</span></li>
<li><a href="https://docs.unity3d.com/ScriptReference/RectTransform.html" target="_blank">RectTransform API</a> <span>— все поля и их смысл</span></li>
</ul></div>`,

251:`
<h3>Простыми словами</h3>
<p>10 000 строк инвентаря нельзя создать как 10 000 объектов — умрёт всё: инстанцирование, layout, память, батчинг. Виртуализация: строк создаётся столько, сколько ВИДНО (плюс запас), а при скролле уехавшая вверх строка перепрыгивает вниз и заполняется новыми данными. Иллюзия длинного списка из 15 переиспользуемых строк.</p>
<h3>Скелет решения</h3>
<pre>1. Данные отдельно: List&lt;ItemData&gt; — просто массив в памяти
2. Высота контента = count × rowHeight (математикой, без LayoutGroup)
3. По scroll position считаем первый видимый индекс
4. Строки из пула; Bind(row, data) заполняет содержимое
5. Переменные высоты → префиксные суммы + бинарный поиск

Детали продакшена:
- иконки грузить async с ОТМЕНОЙ при ребинде (быстрый скролл!)
- выделение живёт в данных, не в строке (строки эфемерны)
- список на своём канвасе — скролл не ребатчит остальной UI
<span class="cm">// Либо UI Toolkit ListView — виртуализация из коробки</span></pre>
<h3>Что сказать на собеседовании</h3>
<p>«Виртуализация: живут только видимые строки плюс буфер, recycling при скролле, высота контента математикой, ноль LayoutGroup. Тонкости: async-загрузка иконок с отменой при ребинде, состояние в данных, отдельный канвас. В UI Toolkit беру готовый ListView. Это стандартный вопрос-дизайн — рассказываю от структуры данных, а не от префаба строки».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/UIE-ListView-UXML.html" target="_blank">UI Toolkit: ListView</a> <span>— встроенная виртуализация</span></li>
<li><a href="https://github.com/setchi/FancyScrollView" target="_blank">FancyScrollView</a> <span>— зрелая OSS-реализация для uGUI, стоит изучить код</span></li>
</ul></div>`,

252:`
<h3>Простыми словами</h3>
<p>UI Toolkit устроен как веб: UXML — «HTML» (структура), USS — «CSS» (вид: селекторы, классы, переходы), C# — «JS» (логика над деревом VisualElement). Лейаут — Flexbox: элементы сами перетекают и растягиваются по правилам, без якорной математики. И это retained-mode: система сама знает, что перерисовать, — семантики «канвас пересобрался целиком» нет.</p>
<h3>Ключевые механики</h3>
<pre>UXML:  &lt;ui:Button name="buy" class="primary"/&gt;
USS:   .primary { background-color: var(--accent); }
       .primary:hover { scale: 1.05; transition: scale 0.1s; }
C#:    root.Q&lt;Button&gt;("buy").clicked += OnBuy;

События: trickle-down → target → bubble-up (как в DOM)
Списки: ListView/TreeView с виртуализацией из коробки
Binding (Unity 6): свойства элементов ↔ C#-источники
  с отслеживанием изменений — настоящий MVVM</pre>
<h3>Что сказать на собеседовании</h3>
<p>«UXML/USS/C# разделяют структуру, стиль и логику — UI становится ревьюируемым и версионируемым как код. Flexbox-лейаут декларативен, ListView виртуализирует из коробки, runtime binding в Unity 6 даёт MVVM без обвязки. Границы знаю: world-space只 с 6.x, кастомные шейдеры на элемент сложнее uGUI. Редакторные инструменты — уже только на нём».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/UIE-simple-ui-toolkit-workflow.html" target="_blank">UI Toolkit workflow</a> <span>— первый практический маршрут</span></li>
<li><a href="https://docs.unity3d.com/Manual/UIE-runtime-binding.html" target="_blank">Runtime data binding</a> <span>— биндинг Unity 6</span></li>
</ul></div>`,

51:`
<h3>Простыми словами</h3>
<p>«Игра тормозит» — это не диагноз, а жалоба. Диагноз начинается с трёх вопросов: НА ЧЁМ тормозит (устройство), КАК тормозит (низкий средний FPS или рывки) и ГДЕ узкое место (CPU или GPU). Пока нет ответов — любая оптимизация это гадание, и обычно оптимизируют не то.</p>
<h3>Протокол диагностики</h3>
<pre>1. Цель: платформа, min-spec устройство, бюджет (16.6/33.3 мс)
2. Средний FPS или спайки? (гистограмма времени кадра,
   не счётчик FPS — среднее прячет рывки)
3. CPU или GPU: снизить разрешение —
   помогло сильно → GPU-bound; нет → CPU-bound
4. Профайлер НА УСТРОЙСТВЕ (development build):
   таймлайн → какой поток узкий (main/render/workers)
   → раскрыть доминирующий маркер
5. Гипотеза → эксперимент (выключить систему, ополовинить
   количество) → подтверждение → фикс → ПЕРЕизмерение</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Сначала цель и характер проблемы: среднее или спайки — лечатся по-разному. Потом CPU/GPU-тест разрешением. Профилирую только на устройстве — редактор врёт. По таймлайну нахожу узкий поток и доминирующий маркер, подтверждаю гипотезу экспериментом и доказываю фикс повторным замером. Без замера не оптимизирую ничего».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://unity.com/resources/ultimate-guide-profiling-unity-games" target="_blank">Unity e-book: Ultimate guide to profiling</a> <span>— методология целиком, must read</span></li>
<li><a href="https://docs.unity3d.com/Manual/Profiler.html" target="_blank">Unity Profiler</a> <span>— инструментарий</span></li>
</ul></div>`,

52:`
<h3>Простыми словами</h3>
<p>Кадр делают двое: CPU готовит (логика, команды рендера), GPU рисует. Медленный кадр — кто-то из них не успевает, а второй ждёт. Лечить надо того, кто работает; оптимизация шейдеров при CPU-bound — выброшенное время. Определяется за минуту одним экспериментом.</p>
<h3>Эксперимент и подтверждение</h3>
<pre>Тест разрешением: Screen.SetResolution / Render Scale ↓↓
  время кадра сильно упало → GPU-bound (пиксельная работа)
  почти не изменилось     → CPU-bound

Подтверждение в профайлере (главный поток):
  Gfx.WaitForPresentOnGfxThread / WaitForTargetFPS
    → CPU простаивает, ждёт GPU/vsync → GPU-bound
  render thread ждёт main → CPU-bound (и виноват main)

<span class="cm">// vsync маскирует всё — выключить на время замеров!</span>
<span class="cm">// Дальше GPU-стороне нужен GPU-профайлер:</span>
<span class="cm">// RenderDoc / Xcode GPU / Snapdragon Profiler — тайминги проходов</span></pre>
<h3>Что сказать на собеседовании</h3>
<p>«Тест разрешением: сильная реакция — GPU-bound, нет — CPU-bound. Подтверждаю маркерами ожидания: главный поток в Gfx.WaitForPresent — жду GPU. Vsync на замерах выключаю. Внутри GPU-стороны дальше различаю филлрейт/трафик/вершины (вопрос №125) уже платформенным GPU-профайлером — Unity Profiler внутрь GPU не видит».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/profiler-cpu-usage.html" target="_blank">Profiler: CPU module</a> <span>— чтение маркеров ожидания</span></li>
<li><a href="https://renderdoc.org/" target="_blank">RenderDoc</a> <span>— бесплатный GPU-захват</span></li>
</ul></div>`,

53:`
<h3>Простыми словами</h3>
<p>Draw call — команда «нарисуй этот меш». SetPass — «переключи материал/шейдер»: GPU перенастраивает конвейер. Batch — склеенная пачка совместимой геометрии. Дорогая операция — именно SetPass: 1000 draw с 3 материалами могут быть быстрее 300 draw с 300 материалами. Гнаться надо не за числом draw calls, а за числом смен состояния.</p>
<h3>Следствия для практики</h3>
<pre>Цель — меньше РАЗНООБРАЗИЯ, не меньше команд:
  общие материалы, атласы текстур, единые шейдеры
  → длинные последовательности «одинакового» → мало SetPass

Statistics-окно: смотреть SetPass Calls, не Batches
Frame Debugger: почему соседние draw не склеились
  (другой материал / текстура / MaterialPropertyBlock...)

SRP Batcher меняет саму экономику: не склеивает draw,
а делает смену МАТЕРИАЛА почти бесплатной (один шейдер-
вариант) — поэтому в URP «много материалов» уже не страшно,
страшно «много шейдер-вариантов» (вопрос №54-55)</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Дорог не draw call, а смена состояния — SetPass. Оптимизация — унификация материалов и атласы, длинные ранны одинакового состояния. В SRP экономика другая: SRP Batcher удешевляет смену материалов при общем шейдере, и валютой становятся варианты шейдеров. Диагноз — Frame Debugger: он пишет причину разрыва каждого батча».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/optimizing-draw-calls.html" target="_blank">Unity: Optimizing draw calls</a> <span>— все механизмы батчинга в одном месте</span></li>
<li><a href="https://docs.unity3d.com/Manual/FrameDebugger.html" target="_blank">Frame Debugger</a> <span>— причины разрывов батчей</span></li>
</ul></div>`,

54:`
<h3>Простыми словами</h3>
<p>Четыре механизма уменьшения стоимости отрисовки, и они разные: static batching склеивает статичные меши заранее (память за скорость), dynamic batching склеивает мелочь на лету (CPU за скорость, часто невыгодно), GPU instancing рисует тысячи КОПИЙ одного меша одной командой (трава, пули), SRP Batcher не склеивает ничего — он делает переключение материалов дешёвым.</p>
<h3>Шпаргалка</h3>
<pre>Static batching:  статичное окружение с общим материалом.
  Цена: дублирование мешей в памяти (комбинированные буферы)
Dynamic batching: <300 вершинных атрибутов, часто CPU-цена
  выше выгоды; в SRP по умолчанию выключен — и правильно
GPU instancing:   МНОГО копий одного меша+материала
  (растительность, толпы, снаряды) + per-instance свойства
SRP Batcher:      главный в URP/HDRP: материалы в постоянных
  GPU-буферах, смена материала при том же шейдере ≈ бесплатна
  Требование: совместимый шейдер (CBUFFER UnityPerMaterial)

Иерархия в URP: SRP Batcher — фундамент, instancing для
массовых копий, static для склейки, dynamic — забыть</pre>
<h3>Что сказать на собеседовании</h3>
<p>«SRP Batcher — основной механизм URP: не уменьшает draw calls, а убирает цену смены материалов через постоянные CBUFFER-ы. Instancing — для тысяч копий одного меша. Static batching — память за скорость на статике. Dynamic почти всегда невыгоден. Знаю их взаимоисключения: instancing и SRP Batcher не работают вместе на одном draw — и проверяю фактическое состояние в Frame Debugger».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/SRPBatcher.html" target="_blank">SRP Batcher</a> <span>— как работает и требования</span></li>
<li><a href="https://docs.unity3d.com/Manual/GPUInstancing.html" target="_blank">GPU Instancing</a> <span>— настройка и per-instance данные</span></li>
</ul></div>`,

55:`
<h3>Простыми словами</h3>
<p>SRP Batcher требует от шейдера контракта: свойства материала лежат в CBUFFER-е с именем UnityPerMaterial. Тогда движок держит данные всех материалов в GPU-буферах и переключение материалов не трогает состояние. Ломает это: рукописные шейдеры без CBUFFER-а и MaterialPropertyBlock (он подсовывает данные мимо буферов).</p>
<h3>Диагностика и лечение</h3>
<pre>Frame Debugger → батч → причина разрыва прямо текстом:
  "Objects have different MaterialPropertyBlock"
  "Node use different shader keywords" ...

Инспектор шейдера → SRP Batcher: Compatible / not

Лечение:
- рукописный шейдер: обернуть свойства в
  CBUFFER_START(UnityPerMaterial) ... CBUFFER_END
- вместо MaterialPropertyBlock в SRP:
  разные материалы (дёшево с батчером!) или
  instanced-свойства для массовых вариаций</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Совместимость = все per-material свойства в CBUFFER UnityPerMaterial. MaterialPropertyBlock выключает батчер на объекте — в SRP вместо него варианты материалов (смена материала теперь дешёвая) или instanced properties. Причины разрывов читаю в Frame Debugger — он пишет их явно, гадать не нужно».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/SRPBatcher.html" target="_blank">SRP Batcher</a> <span>— совместимость шейдеров, отладка</span></li>
</ul></div>`,

56:`
<h3>Простыми словами</h3>
<p><code>renderer.material</code> при первом обращении молча КЛОНИРУЕТ материал — «твоя личная копия». Дальше три беды: копия — это утечка (её нужно Destroy руками), уникальный материал ломает батчинг, а в цикле по сотне объектов ты наплодил сотню материалов, сам того не зная. Один из самых коварных API движка.</p>
<h3>Правила</h3>
<pre>ЧИТАТЬ:            renderer.sharedMaterial  (без клона)
МЕНЯТЬ ВСЕМ:       правка sharedMaterial = правка ассета(!)
                   в редакторе — навсегда
МЕНЯТЬ ОДНОМУ:
  Built-in:        MaterialPropertyBlock — свойства без клона
  var mpb = new MaterialPropertyBlock();
  mpb.SetColor("_Color", red); renderer.SetPropertyBlock(mpb);
  URP/HDRP:        MPB ломает SRP Batcher (вопрос №55) →
                   пара заготовленных материалов, или клон
                   с ОСОЗНАННЫМ владением (Destroy в OnDestroy),
                   или instanced-свойства при массовости</pre>
<h3>Что сказать на собеседовании</h3>
<p>«renderer.material тихо клонирует — утечка плюс поломка батчинга; читаю через sharedMaterial. Пер-объектные вариации: в built-in — MaterialPropertyBlock, в SRP помню, что MPB отключает батчер — беру заготовленные материалы или instanced properties. Каждый созданный в рантайме материал имеет владельца с Destroy. Плодящиеся материалы ловлю Memory Profiler-ом по счёту объектов Material».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/ScriptReference/Renderer-material.html" target="_blank">Renderer.material</a> <span>— официальное описание клонирования</span></li>
<li><a href="https://docs.unity3d.com/ScriptReference/MaterialPropertyBlock.html" target="_blank">MaterialPropertyBlock</a> <span>— вариации без клонов</span></li>
</ul></div>`,

57:`
<h3>Простыми словами</h3>
<p>Frustum culling — «не рисуй то, что за пределами кадра» — работает всегда и бесплатно. Occlusion culling — «не рисуй то, что ЗАГОРОЖЕНО другим» — требует запечённых данных о видимости (кто кого может загораживать) и окупается только там, где много перекрытий: город, интерьеры. В чистом поле он бесполезен: загораживать нечем, а бейк и рантайм-запросы не бесплатны.</p>
<h3>Практика</h3>
<pre>Настройка: Occluder Static (большое, загораживает) +
Occludee Static (может быть загорожено) → Bake PVS

Окупается: интерьеры, город, каньоны (глубокие перекрытия)
Бесполезен/вреден: открытые поля, виды с высоты

Динамика не загораживает (PVS статичен);
Unity 6 добавил GPU occlusion culling — без бейка,
на Hi-Z пирамиде глубины, для GPU Resident Drawer (в.№103)

Проверка выгоды: Stats/Frame Debugger с камерой за стеной —
сколько draw исчезло? Нет разницы → выключить и не платить</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Frustum — бесплатный и всегда; occlusion — запечённый PVS для сцен с реальными перекрытиями: интерьеры да, поля нет. Помню цену: бейк, память, CPU-запросы, только статика. Выгоду проверяю замером — камера за стеной, смотрю дельту draw calls. В Unity 6 есть GPU-вариант без бейка на Hi-Z — для сцен с Resident Drawer он снимает вопрос бейка».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/OcclusionCulling.html" target="_blank">Occlusion Culling</a> <span>— бейк и настройка</span></li>
<li><a href="https://docs.unity3d.com/6000.0/Documentation/Manual/urp/gpu-culling.html" target="_blank">GPU occlusion culling (Unity 6)</a> <span>— вариант без бейка</span></li>
</ul></div>`,

58:`
<h3>Простыми словами</h3>
<p>Overdraw — когда один и тот же пиксель закрашивается несколько раз: за спрайтом дыма ещё три слоя дыма, за ними частицы, за ними стекло. На мобильных GPU это прямой расход пропускной способности и батареи. Прозрачность — главный источник: она не пишет глубину, и всё, что под ней, всё равно рисуется.</p>
<h3>Откуда берётся и как резать</h3>
<pre>Главные источники:
- партиклы (много больших полупрозрачных квадов друг на друге)
- полноэкранные затемнения/виньетки СТОПКОЙ
- «прозрачный, но невидимый» UI (alpha=0 всё равно рисуется!)
- большие листы растительности с прозрачными полями

Лечение:
- частицы: меньше и МЕЛЬЧЕ на экране, агрессивный лимит
- карты частиц обрезать по силуэту (меньше прозрачных полей)
- alpha-test на мобилках осторожно: ломает early-Z у части GPU
- UI: выключать невидимое по-настоящему (Canvas.enabled)

Диагноз: Scene view → Overdraw mode / SRP Debug views —
белые пятна и есть счёт за электричество</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Overdraw — многократная закраска пикселя, на тайловых GPU это трафик и батарея. Главные виновники — частицы и стопки полупрозрачного. Режу: размер частиц на экране, обрезка карт по силуэту, реальное отключение невидимого UI, осторожность с alpha-test на мобилках — он отключает early-Z на части железа. Смотрю режим Overdraw до того, как гадать».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/SceneViewModes.html" target="_blank">Scene view modes</a> <span>— режим Overdraw</span></li>
<li><a href="https://unity.com/how-to/optimize-mobile-game-performance" target="_blank">Unity: Mobile optimization</a> <span>— раздел про филлрейт и прозрачность</span></li>
</ul></div>`,

59:`
<h3>Простыми словами</h3>
<p>LOD — у объекта несколько версий детализации: близко — полный меш, дальше — упрощённый, ещё дальше — плоский билборд, совсем далеко — не рисуем. LODGroup переключает их по экранному размеру объекта. Смысл двойной: меньше треугольников И дешевле шейдинг вдали.</p>
<h3>Настройка со смыслом</h3>
<pre>Уровни: примерно ÷2 треугольников на ступень
  LOD0 10k → LOD1 5k → LOD2 1.5k → billboard → cull
ВАЖНО: упрощать и МАТЕРИАЛ (LOD2 не должен гонять
  тот же дорогой шейдер с 4 текстурами)
Переходы: Cross-fade (дизеринг) против «щелчка»
LOD Bias: множитель по уровням качества устройств

Ошибки:
- LODGroup на мелочи: оценка стоит дороже экономии
- LOD не уменьшает draw calls сам по себе —
  склейка/инстансинг отдельно
- забытые тени: Shadow LOD/cull для дальних кастеров</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Ступени примерно вдвое по треугольникам, с упрощением материала на каждой — вдали дорогой шейдер важнее лишних полигонов. Cross-fade против поппинга, LOD Bias по тирам устройств, билборды на дальней дистанции для растительности. Помню: LOD не батчит — это отдельная работа, и на мелких объектах LODGroup вреден».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/class-LODGroup.html" target="_blank">LODGroup</a> <span>— настройка уровней и cross-fade</span></li>
</ul></div>`,

60:`
<h3>Простыми словами</h3>
<p>5000 MonoBehaviour с Update — это 5000 отдельных вызовов из движка в C# каждый кадр, с накладными расходами на каждый, ещё ДО твоей логики. Решение — «менеджер обновлений»: один Update, внутри цикл по списку. Плюс здравый смысл: далёкому ИИ не нужно думать 60 раз в секунду.</p>
<h3>Паттерн и его развитие</h3>
<pre><span class="cm">// 1. Update-менеджер: один вызов вместо тысяч</span>
class EnemyManager : MonoBehaviour {
    List&lt;Enemy&gt; _enemies;                 <span class="cm">// без Update у Enemy!</span>
    void Update() {
        float dt = Time.deltaTime;
        for (int i = 0; i &lt; _enemies.Count; i++)
            _enemies[i].Tick(dt);
    }
}

<span class="cm">// 2. Time slicing: ИИ на 10 Гц, размазанный по кадрам</span>
int start = (frame % 6) * _enemies.Count / 6;
<span class="cm">// каждый кадр думает 1/6 врагов — нагрузка ровная</span>

<span class="cm">// 3. Ярусы по дистанции: близкие 60 Гц, средние 10, дальние 1</span>
<span class="cm">// 4. Однородные данные → джобы + Burst (вопрос №34-35)</span></pre>
<h3>Что сказать на собеседовании</h3>
<p>«Каждый Update — отдельный native→managed вызов; тысячи их стоят миллисекунды до всякой логики. Update-менеджер с одним циклом, тайм-слайсинг по остатку от деления, частотные ярусы по дистанции/видимости. Пустые Update удаляю — они тоже платные. Следующая ступень для однородных данных — джобы с Burst».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://blog.unity.com/engine-platform/10000-update-calls" target="_blank">Unity Blog: 10000 Update() calls</a> <span>— официальные замеры цены Update</span></li>
<li><a href="https://github.com/Cysharp/UniTask#playerloop" target="_blank">UniTask PlayerLoop</a> <span>— альтернативные точки тика без MonoBehaviour</span></li>
</ul></div>`,
63:`
<h3>Простыми словами</h3>
<p>Память игры — три отдельных мира. Managed — твои C#-объекты под GC. Native — внутренности движка: меши, текстуры, физика, сама структура сцен. GPU — то, что загружено в видеопамять (на мобилках это общая RAM!). Убийца приложений на телефоне — почти всегда native+GPU, а не managed, поэтому «у меня маленькая куча C#» ничего не гарантирует.</p>
<h3>Карта памяти</h3>
<pre>Managed heap:  C#-объекты, растёт и не отдаётся обратно
Native:        текстуры (CPU-копии), меши, аудио, физика,
               нативная половина каждого UnityEngine.Object
GPU/graphics:  загруженные текстуры, буферы, render targets
+ код IL2CPP и метаданные, + стеки потоков

Кто виноват в OOM на телефоне: почти всегда текстуры
(native+GPU), а Memory Profiler делит всё по категориям —
сначала определи КАТЕГОРИЮ, потом копай (вопрос №265)</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Три мира: managed под GC, нативная память движка и графическая — на мобилках всё в одной RAM. OOM-киллы почти всегда от native/GPU (текстуры), а не managed. Раскладку смотрю в Memory Profiler по категориям и сверяю с footprint из платформенных инструментов — Xcode/meminfo видят то, чего Unity не видит (драйвер, ОС)».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/performance-memory-overview.html" target="_blank">Unity: Memory overview</a> <span>— официальная карта всех видов памяти</span></li>
<li><a href="https://docs.unity3d.com/Packages/com.unity.memoryprofiler@1.1/manual/index.html" target="_blank">Memory Profiler</a> <span>— инструмент для этой карты</span></li>
</ul></div>`,

64:`
<h3>Простыми словами</h3>
<p>Обычно текстура живёт только в GPU: загрузили — CPU-копию выбросили. Флаг Read/Write Enabled говорит: «оставь копию в обычной памяти, я буду читать пиксели из кода». Не читаешь? Значит, платишь ДВОЙНУЮ память за все такие ассеты просто так. То же с мешами. Одна из самых частых бесплатных экономий на проекте.</p>
<h3>Аудит и исключения</h3>
<pre>Кому флаг реально нужен:
- Texture2D.GetPixels/SetPixels в рантайме
- меши, которые читаешь/правишь кодом
- НЕ нужен для: рендера, коллайдеров (свои данные),
  UI, частиц — то есть 95% ассетов

Аудит: Memory Profiler → мешы/текстуры аномального размера,
или редакторный скрипт по всем импортерам

Обходы без флага:
- Mesh.AcquireReadOnlyMeshData — чтение меша в джобах без копии
- AsyncGPUReadback — чтение текстуры/RT без стойла конвейера</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Read/Write держит CPU-копию рядом с GPU-копией — двойная память. Выключен по умолчанию для новых ассетов, но легаси и ассет-стор тянут включённый. Прохожу аудитом, оставляю только реально читаемым из кода; для мешей в джобах есть AcquireReadOnlyMeshData, для текстур — AsyncGPUReadback, оба без флага и без двойной памяти».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/ScriptReference/TextureImporter-isReadable.html" target="_blank">TextureImporter.isReadable</a> <span>— флаг и его цена</span></li>
<li><a href="https://docs.unity3d.com/ScriptReference/Mesh.AcquireReadOnlyMeshData.html" target="_blank">AcquireReadOnlyMeshData</a> <span>— чтение мешей без CPU-копии</span></li>
</ul></div>`,

65:`
<h3>Простыми словами</h3>
<p>Несжатая текстура — 4 байта на пиксель: 2048² = 16 МБ. GPU умеют читать сжатые форматы ПРЯМО из видеопамяти: ASTC на мобилках, BC на десктопе — 4-9 раз меньше. Выбор формата на платформу — рутина, которая экономит сотни мегабайт.</p>
<h3>Шпаргалка форматов</h3>
<pre>Mobile (совр.):  ASTC — блок как регулятор качества:
  4x4 — верхнее качество (8.9 bpp)
  6x6 — рабочий дефолт (3.6 bpp)
  8x8/12x12 — фоны и даль
Desktop/console: BC7 — качественный цвет
  BC5 — нормали (2 канала, Z восстанавливается)
  BC4 — одноканальные маски; BC6H — HDR
  BC1 — дешёвый цвет без альфы

Правила поверх формата:
- max size по реальному экранному покрытию
- маски паковать по каналам (metallic+rough+AO → RGB)
- нормали НЕ в цветовые форматы (артефакты освещения)
- проверка фактической памяти — Memory Profiler, не превью</pre>
<h3>Что сказать на собеседовании</h3>
<p>«ASTC с размером блока как регулятором на мобилках — 6x6 дефолт, 4x4 для hero-ассетов; BC7/BC5/BC4 по назначению на десктопе, BC6H для HDR. Важнее формата — дисциплина: max size по покрытию, канальная упаковка масок, отдельная забота о нормалях. Контроль — валидатором импорта, а не глазами (вопрос №297)».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/texture-choose-format-by-platform.html" target="_blank">Unity: Formats by platform</a> <span>— рекомендации по платформам</span></li>
<li><a href="https://docs.unity3d.com/Manual/texture-compression-formats.html" target="_blank">Texture compression formats</a> <span>— таблица форматов с bpp</span></li>
</ul></div>`,

66:`
<h3>Простыми словами</h3>
<p>Мипмапы — цепочка уменьшенных копий текстуры (1024→512→256...). GPU сам берёт уровень под экранный размер. Без мипов дальний объект сэмплирует огромную текстуру «через пиксель» — мерцание И медленно (кэш текстур захлёбывается). Цена мипов — +33% памяти, и это одна из лучших сделок в графике.</p>
<h3>Когда выключать и что ещё знать</h3>
<pre>Мипы НЕ нужны (выключай — экономия 33%):
  UI-спрайты, полноэкранные оверлеи, LUT-таблицы,
  всё, что всегда 1:1 к экрану

Мипы НУЖНЫ: весь 3D-мир, world-space UI

Бонусы понимания:
- Mipmap Streaming: в памяти только нужные уровни —
  большие миры экономят сотни МБ (бюджет в настройках)
- trilinear смягчает границы уровней; anisotropic спасает
  текстуры под острым углом (пол, дороги) — с ценой
- «блестит/мерцает вдали» = чаще всего забытые мипы</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Мипы — +33% памяти за резкое ускорение сэмплинга вдали (когерентность кэша) и отсутствие мерцания. Выключаю только для UI и 1:1-оверлеев. В больших мирах — Mipmap Streaming с бюджетом: резидентны только нужные уровни. Мерцание дальних текстур на ревью арта — первый вопрос: а мипы включены?»</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/texture-mipmaps-introduction.html" target="_blank">Unity: Mipmaps</a> <span>— основы</span></li>
<li><a href="https://docs.unity3d.com/Manual/TextureStreaming.html" target="_blank">Mipmap Streaming</a> <span>— стриминг уровней с бюджетом</span></li>
</ul></div>`,

67:`
<h3>Простыми словами</h3>
<p>У каждого аудиоклипа два вопроса: в каком виде он лежит в памяти и когда декодируется. Короткий частый звук выгодно держать готовым к проигрыванию (память дороже, CPU дешевле). Длинную музыку — стримить с диска (памяти почти ноль). Между ними — сжатый в памяти вариант. Неправильные настройки аудио — классические скрытые 100+ МБ мобильного билда.</p>
<h3>Настройки по типам звуков</h3>
<pre>Decompress On Load:      короткие частые SFX (шаги, выстрелы)
  RAM: полный PCM; CPU при игре: ноль
Compressed In Memory:    средние клипы (реплики, стингеры)
  RAM: сжатый; CPU: декодирование при проигрывании
Streaming:               музыка, длинные диалоги
  RAM: ~ноль; цена: IO + задержка старта

Форматы: Vorbis — музыка/речь; ADPCM — множество коротких
  (дёшев в декоде); PCM — только критичное к качеству
Обязательные галочки: Force To Mono для 3D-звуков
  (память ÷2, позиционному звуку стерео не нужно),
  пониженный sample rate там, где не слышно разницы</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Три режима загрузки по типу звука: Decompress On Load для коротких частых, Compressed In Memory для средних, Streaming для музыки. Vorbis/ADPCM по назначению, Force To Mono для всего позиционного. Аудио регулярно оказывается тихими 100 МБ в билде — прохожу аудитом вместе с текстурами».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/ScriptReference/AudioClip.html" target="_blank">AudioClip settings</a> <span>— режимы и форматы</span></li>
<li><a href="https://unity.com/how-to/optimize-mobile-game-performance" target="_blank">Mobile optimization</a> <span>— раздел про аудио</span></li>
</ul></div>`,

68:`
<h3>Простыми словами</h3>
<p>Выгрузка сцены НЕ освобождает ассеты — они висят «на всякий случай», пока не позовёшь <code>Resources.UnloadUnusedAssets()</code>. Он проходит по всем загруженным ассетам, находит недостижимые и выгружает. Дорого (сотни миллисекунд) и с принудительным GC перед этим — поэтому только в моменты, где фриз незаметен.</p>
<h3>Правила вызова</h3>
<pre>Когда: после UnloadSceneAsync, ЗА экраном загрузки/фейдом
Никогда: посреди геймплея «для профилактики»

<span class="cm">// Каноничная последовательность смены уровня:</span>
await SceneManager.UnloadSceneAsync(old);
await Resources.UnloadUnusedAssets();   <span class="cm">// фриз спрятан за фейдом</span>
GC.Collect();                            <span class="cm">// добить managed-мусор</span>
await SceneManager.LoadSceneAsync(next, Additive);

<span class="cm">// «Выгрузил сцену — память не упала»:</span>
<span class="cm">// 99% — кто-то живой держит ссылку (static, DontDestroyOnLoad</span>
<span class="cm">// менеджер, кэш) → цепочка ассетов «достижима» → не выгружается.</span>
<span class="cm">// Memory Profiler → References To → найти держателя.</span></pre>
<h3>Что сказать на собеседовании</h3>
<p>«UnloadUnusedAssets — дорогой полный проход по ассетам с GC впереди: только на границах (смена уровня, за фейдом). Помню главное: он не выгрузит то, на что жива ссылка — статические поля и кэши держат целые цепочки ассетов, и “память не падает после выгрузки” почти всегда решается поиском держателя в Memory Profiler, а не повторными вызовами выгрузки».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/ScriptReference/Resources.UnloadUnusedAssets.html" target="_blank">UnloadUnusedAssets</a> <span>— семантика и цена</span></li>
</ul></div>`,

69:`
<h3>Простыми словами</h3>
<p>Размер билда уменьшается в том же порядке, в каком его смотрят в отчёте: сначала самое жирное. Почти всегда это текстуры, потом аудио, меши, лишние ассеты, код. Гадать нельзя — Build Report говорит точно, кто сколько весит.</p>
<h3>Порядок действий</h3>
<pre>0. Build Report / Editor.log → таблица «кто сколько»
1. Текстуры: max size по покрытию, ASTC, мипы UI — off
2. Аудио: Vorbis с разумным качеством, mono для 3D
3. Меши: compression, Read/Write off, без лишних UV/цветов
4. Лишнее: папки Resources (тянут ВСЁ внутрь себя!),
   случайные ссылки из сцен на тяжёлое, дубли в бандлах
5. Код: managed stripping ↑, Strip Engine Code,
   IL2CPP «faster (smaller) builds», без дженерик-взрывов
6. Доставка: App Bundle/ABI split; необязательный контент →
   Addressables с докачкой после установки

И удержание: лимит размера в CI — регрессия = красный билд</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Начинаю с Build Report — никогда с гипотез. Обычный порядок выигрыша: текстуры (max size + ASTC), аудио, меши, ассеты, затянутые Resources и ссылками, стриппинг кода. Дальше — App Bundle и вынос контента в Addressables с докачкой. И фиксирую лимит в CI, потому что размер тихо отрастает обратно за квартал».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/BuildReportFiles.html" target="_blank">Build Report</a> <span>— чтение отчёта сборки</span></li>
<li><a href="https://docs.unity3d.com/Manual/ReducingFilesize.html" target="_blank">Unity: Reducing file size</a> <span>— официальный чеклист</span></li>
</ul></div>`,

265:`
<h3>Простыми словами</h3>
<p>Memory Profiler — это «фотоаппарат памяти»: снимаешь снапшот, видишь каждый объект, кто его держит и сколько он весит. Главный приём — не один снимок, а СРАВНЕНИЕ двух: до и после подозрительного цикла. Что выросло — то и утекло.</p>
<h3>Рабочий процесс</h3>
<pre>1. Снапшот на УСТРОЙСТВЕ (редакторный включает сам редактор)
2. Summary: какая категория проблемна —
   managed / native / graphics / untracked
3. All Of Memory → сортировка по размеру:
   топ текстур = аудит арта; RenderTexture = утёкшие RT;
   раздутые Mesh = Read/Write флаги
4. Охота на утечку: снапшот A → цикл (экран открыть/закрыть
   ×3, сцена загрузить/выгрузить ×3) → снапшот B →
   Compare → выросшие счётчики объектов
5. Выбрал объект → References To → цепочка до держателя
   (обычно static, кэш или DontDestroyOnLoad-менеджер)</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Метод двух снапшотов на устройстве: цикл, который должен вернуть память в ноль, сравнение, выросшие объекты, путь удержания через References To. Unity Objects view ловит дубли ассетов (одна текстура двумя копиями — запах бандлов). Разрыв между цифрами Unity и Xcode/meminfo — нормальная невидимая драйверная память, слежу за её трендом».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Packages/com.unity.memoryprofiler@1.1/manual/index.html" target="_blank">Memory Profiler manual</a> <span>— все виды и workflow</span></li>
<li><a href="https://unity.com/how-to/use-memory-profiling-unity" target="_blank">Unity: Memory profiling guide</a> <span>— практические сценарии</span></li>
</ul></div>`,

266:`
<h3>Простыми словами</h3>
<p>Ассет загружается, когда на него «дотянулась» ссылка: сцена тянет всё, на что ссылаются её объекты, префаб тянет свои текстуры и меши — целыми деревьями зависимостей. А выгружается — почти никогда сам: Destroy убивает инстансы, но не общие ассеты. Понимание «кто кого тянет и кто когда отпустит» — и есть управление памятью ассетов.</p>
<h3>Правила жизни и смерти</h3>
<pre>Загрузка:
  сцена → всё из иерархии → все зависимости рекурсивно
  <span class="cm">// одна ссылка на 4K-атлас в декоративном префабе =</span>
  <span class="cm">// атлас в памяти всегда, пока сцена жива</span>
  Resources.Load / Addressables — по запросу

Выгрузка (только эти пути):
  1) выгрузка сцены УБРАЛА последнюю ссылку
     + Resources.UnloadUnusedAssets (в.№68)
  2) Addressables.Release → рефкаунт 0 → бандл выгружен
  3) точечный Resources.UnloadAsset (опасен при живых ссылках)

Практика: владение хэндлами по скоупам — экран владеет
своими загрузками и освобождает при закрытии; тяжёлое —
через Addressables-ключи, а не прямые ссылки из сцен</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Сериализованная ссылка = загрузка всего дерева зависимостей вместе со сценой; Destroy инстансов ассеты не трогает. Выгрузка — UnloadUnusedAssets после потери ссылок либо рефкаунт Addressables. Тяжёлый контент вешаю на ключи Addressables со скоуп-владением, а не на прямые ссылки — иначе одна забытая ссылка держит атлас весь ран».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/performance-asset-loading-and-memory.html" target="_blank">Unity: Asset loading and memory</a> <span>— жизненный цикл ассетов</span></li>
</ul></div>`,

267:`
<h3>Простыми словами</h3>
<p>Память текстуры считается формулой, и её надо уметь прикинуть в голове: ширина × высота × байты-на-пиксель, плюс треть на мипы. Несжатая 2048² — 21 МБ с мипами. Она же в ASTC 6x6 — 2.4 МБ. Один аудит списка текстур по этой арифметике находит десятки мегабайт за час.</p>
<h3>Арифметика и аудит</h3>
<pre>RGBA32 (несжатая):  2048×2048×4 = 16 МБ (+мипы ≈ 21.3)
ASTC 6x6 (3.56bpp): 2048² ≈ 1.8 МБ (+мипы ≈ 2.4)
BC7 (8bpp):         2048² = 4 МБ
<span class="cm">// несжатый 4K = 85 МБ с мипами — один такой «беглец»</span>
<span class="cm">// заметен на любом бюджете</span>

Чеклист аудита (по списку из Memory Profiler):
□ сжата под платформу? (RGBA32 — находка №1)
□ max size по реальному покрытию на экране?
□ мипы нужны? (UI — нет) альфа нужна? (нет — формат без)
□ Read/Write off? (иначе ×2)
□ дублей нет? (маски паковать по каналам)</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Считаю на пальцах: пиксели × bpp + треть на мипы; несжатый 4K — 85 МБ, он же в ASTC — единицы. Аудит по списку Memory Profiler с чеклистом: сжатие, max size, мипы, альфа, Read/Write, дубли. И бюджет из этой арифметики: 300-500 МБ текстур на мобильный проект — это 150-250 штук ASTC 2048, что дисциплинирует пайплайн».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/texture-compression-formats.html" target="_blank">Texture formats + bpp</a> <span>— таблица для арифметики</span></li>
</ul></div>`,

76:`
<h3>Простыми словами</h3>
<p>Три конвейера рендера. Built-in — старый: работает, но заморожен и не развивается. URP — универсальный: от слабых телефонов до консолей, расширяемый, дефолт новых проектов. HDRP — тяжёлая артиллерия для фотореализма на PC/консолях: объёмный свет, трассировка — и системные требования соответствующие. Выбор делается один раз в начале: миграция потом — это перелопачивание шейдеров, света и пост-эффектов.</p>
<h3>Критерии выбора</h3>
<pre>URP:   мобилки, кроссплатформа, стилизация, VR,
       90% проектов — сюда
HDRP:  фотореал, high-end PC/консоли, автомобильный/кино
       рендер; на мобилках нежизнеспособен
Built-in: только легаси-проекты и специфические
       зависимости от старых ассетов

Отличия под капотом: URP — Forward+ (кластерный свет),
SRP Batcher, Render Graph (Unity 6), ShaderGraph/VFX Graph
работают в обоих SRP; шейдеры между конвейерами НЕсовместимы</pre>
<h3>Что сказать на собеседовании</h3>
<p>«URP — дефолт: масштабируется от мобилок до консолей, Forward+, расширение через Renderer Features. HDRP — когда цель фотореализм на мощном железе: волюметрики, RT, физические единицы света. Built-in не развивается. Выбор — в начале проекта от целевого железа и арт-дирекшена; миграция между конвейерами — это пересборка всего графического слоя, закладывать её “на потом” нельзя».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/render-pipelines-overview.html" target="_blank">Render pipelines overview</a> <span>— официальное сравнение</span></li>
<li><a href="https://unity.com/how-to/render-pipeline-choose" target="_blank">Unity: How to choose a render pipeline</a> <span>— критерии выбора</span></li>
</ul></div>`,

77:`
<h3>Простыми словами</h3>
<p>Три стратегии освещения пикселей. Forward: каждый объект рисуется со «своим» светом — просто, дружит с MSAA и прозрачностью, но дорожает с числом источников. Deferred: сначала все объекты пишут свойства в G-buffer, потом свет считается по экрану — сотня лампочек дёшево, но трафик памяти большой и прозрачность мимо. Forward+ — хитрый forward: экран нарезан на ячейки, каждая знает СВОИ источники — много света без G-buffer-а.</p>
<h3>Сравнение</h3>
<pre>Forward:   цена ~ объекты × источники
           + MSAA, + прозрачность, + tile-GPU мобилок
Deferred:  цена света ~ пиксели × источники (геометрия отдельно)
           + сотни источников; − трафик G-buffer,
           − прозрачность отдельным forward-проходом, − MSAA
Forward+:  свет по кластерам экрана/глубины
           + много источников БЕЗ G-buffer, + MSAA
           = дефолт URP сегодня

Мобильный deferred в URP живёт на framebuffer fetch —
G-buffer не покидает тайловую память (вопрос №132)</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Forward масштабируется объектами×источниками, но держит MSAA и прозрачность; deferred отвязывает свет от геометрии ценой трафика G-buffer; Forward+ кластеризует источники и даёт много света в forward-модели — поэтому URP на нём. На тайловых GPU deferred жизнеспособен только с subpass/framebuffer fetch, когда G-buffer остаётся on-chip».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/6000.0/Documentation/Manual/urp/rendering-paths.html" target="_blank">URP: Rendering paths</a> <span>— Forward/Forward+/Deferred в URP</span></li>
<li><a href="https://catlikecoding.com/unity/tutorials/custom-srp/" target="_blank">Catlike Coding: Custom SRP</a> <span>— построение конвейера с нуля, глубокое понимание</span></li>
</ul></div>`,

78:`
<h3>Простыми словами</h3>
<p>SRP — это «рендер как C#-код»: цикл отрисовки кадра не зашит в движок, а написан скриптами поверх низкоуровневого API (куллинг, сортировка, отправка draw-ов). URP и HDRP — просто два готовых таких «скрипта». Практическое следствие: в URP можно вставить свой проход в любую точку кадра — обводки, кастомные блюры, порталы — без хаков со второй камерой.</p>
<h3>Уровни кастомизации URP</h3>
<pre>1. Renderer Feature (без кода): RenderObjects —
   перерисовать слой с другим материалом/стенсилом в
   заданной точке (обводки, x-ray, маскирование)
2. Свой ScriptableRendererFeature + ScriptableRenderPass:
   полный проход с CommandBuffer-ами в выбранном событии
   (BeforeRenderingOpaques, AfterRenderingPostProcessing...)
3. Unity 6: запись через Render Graph (RecordRenderGraph,
   TextureHandle) — граф сам менеджит память RT и мержит
   проходы; legacy cmd.Blit → Blitter API
4. Совсем свой конвейер поверх SRP Core — редко нужно</pre>
<h3>Что сказать на собеседовании</h3>
<p>«SRP открывает рендер-луп в C#; URP расширяю через ScriptableRendererFeature с проходом в нужной точке инъекции — это заменяет камерные хаки. В Unity 6 проходы пишутся через Render Graph: декларируешь входы/выходы TextureHandle-ами, граф отбрасывает неиспользуемое и алиасит память. Знаю точки инъекции и когда RenderObjects хватает без кода».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/6000.0/Documentation/Manual/urp/renderer-features/scriptable-renderer-features/scriptable-renderer-features-landing.html" target="_blank">URP: Scriptable Renderer Features</a> <span>— свои проходы</span></li>
<li><a href="https://docs.unity3d.com/6000.0/Documentation/Manual/urp/render-graph.html" target="_blank">URP: Render Graph</a> <span>— современный способ записи проходов</span></li>
</ul></div>`,

79:`
<h3>Простыми словами</h3>
<p>Путь вершины до пикселя: вершинный шейдер переводит её из локальных координат через мир в экранные; растеризатор нарезает треугольник на пиксели; фрагментный шейдер красит каждый; тесты глубины/стенсила решают, попадёт ли пиксель на экран; блендинг смешивает с тем, что уже есть. Каждая стадия — рычаг оптимизации.</p>
<h3>Практические следствия для шейдеров</h3>
<pre>Вершинная стадия дешевле фрагментной (вершин меньше,
чем пикселей): всё, что можно интерполировать — считать
в вершинах (туман, простые UV-анимации)

Early-Z: GPU отбрасывает загороженные пиксели ДО
фрагментного шейдера — но discard/clip и запись глубины
из шейдера это ЛОМАЮТ (alpha-test дорог на мобилках)

Меньше интерполяторов между стадиями — легче на мобилках
Zависимые выборки текстур (UV, посчитанные во фрагменте) —
дороже прямых, особенно на старых мобильных GPU</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Object→World→View→Clip в вершинном, перспективное деление, растеризация, early-Z, фрагментный, тесты, блендинг. Практика из этого: математику — в вершины, где интерполяция допустима; discard ломает early-Z — alpha-test на мобилках осознанно; интерполяторов меньше. Reversed-Z на современных API помню при ручной работе с глубиной (вопрос №129)».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://catlikecoding.com/unity/tutorials/rendering/part-1/" target="_blank">Catlike Coding: Rendering series</a> <span>— конвейер шаг за шагом на Unity</span></li>
<li><a href="https://docs.unity3d.com/Manual/SL-VertexFragmentShaderExamples.html" target="_blank">Vertex/Fragment shader examples</a> <span>— опорные примеры</span></li>
</ul></div>`,

80:`
<h3>Простыми словами</h3>
<p>Каждый #pragma multi_compile УДВАИВАЕТ число версий шейдера: 10 кейвордов = 1024 варианта, а конвейер добавляет свои (тени, лайтмапы, туман). Отсюда три беды: долгие сборки, толстые билды и фризы при первом использовании варианта в игре (компиляция пайплайна драйвером).</p>
<h3>Управление взрывом</h3>
<pre>shader_feature vs multi_compile:
  shader_feature — в билд попадают только варианты,
  РЕАЛЬНО используемые материалами (для материальных фич)
  multi_compile — все всегда (для рантайм-переключений кодом)

Стриппинг: IPreprocessShaders — выбросить варианты,
  которые точно не нужны (например, все с выключенной
  в проекте фичей); URP сам многое режет по настройкам

Фризы первого использования:
  ShaderVariantCollection с прогревом на загрузке (WarmUp),
  собранная с реального прохождения игры;
  графический тест: проиграть все эффекты на загрузочной сцене

Иногда дешевле ветвиться: динамический if по uniform
  вместо кейворда — один вариант, цена ветки на GPU мала
  при когерентности</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Варианты растут комбинаторно: shader_feature для материальных опций (мертвое отсекается), multi_compile только для рантайм-переключений, IPreprocessShaders для стриппинга, счёт вариантов в инспекторе шейдера. Фризы первого использования лечу ShaderVariantCollection-прогревом. И взвешиваю ветку по uniform против нового кейворда — часто ветка дешевле суммарно».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/shader-variants.html" target="_blank">Shader variants</a> <span>— главный документ о взрыве вариантов</span></li>
<li><a href="https://docs.unity3d.com/Manual/shader-variant-stripping.html" target="_blank">Variant stripping</a> <span>— все механизмы стриппинга</span></li>
</ul></div>`,

81:`
<h3>Простыми словами</h3>
<p>Шейдеры URP пишутся на HLSL, но «обвязка» другая, чем в built-in: свои include-файлы, обязательный CBUFFER для SRP Batcher, и несколько проходов с тегами — забыл проход теней, и объект перестал их отбрасывать. ShaderGraph закрывает большинство задач без кода, а рукописный HLSL нужен для особого.</p>
<h3>Скелет URP-шейдера</h3>
<pre>HLSLPROGRAM (не CGPROGRAM!)
#include "Packages/com.unity.render-pipelines.universal/
          ShaderLibrary/Core.hlsl"     <span class="cm">// не UnityCG.cginc</span>

CBUFFER_START(UnityPerMaterial)        <span class="cm">// SRP Batcher контракт</span>
  float4 _BaseColor; float _Cutoff;
CBUFFER_END

Проходы по LightMode:
  "UniversalForward"  — основной цвет
  "ShadowCaster"      — без него НЕ отбрасывает тени
  "DepthOnly"/"DepthNormals" — для эффектов на глубине/SSAO

Свет: GetMainLight(), GetAdditionalLight(i, posWS)
Трансформы: TransformObjectToHClip(posOS)</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Отличия от built-in: HLSL-инклюды Core/Lighting вместо UnityCG, CBUFFER UnityPerMaterial для батчера, проходы по LightMode — ShadowCaster и DepthOnly обязательны, иначе тени и depth-эффекты молча ломаются. Свет через GetMainLight/GetAdditionalLight. Начинаю с ShaderGraph, HLSL — когда нужен контроль; подсматриваю сгенерированный код графа».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/6000.0/Documentation/Manual/urp/writing-custom-shaders-urp.html" target="_blank">URP: Writing custom shaders</a> <span>— официальные примеры со всеми проходами</span></li>
<li><a href="https://www.cyanilux.com/tutorials/urp-shader-code/" target="_blank">Cyanilux: URP Shader Code</a> <span>— лучший практический разбор структуры URP-шейдера</span></li>
</ul></div>`,

82:`
<h3>Простыми словами</h3>
<p>PBR-материал описывает поверхность физически: albedo — «настоящий цвет» без света и теней; metallic — металл или нет (переходные значения физически бессмысленны); smoothness — насколько собран блик (зеркало против мела); normal map — фальшивый микрорельеф, наклоняющий освещение без геометрии. Смысл системы: материал выглядит правильно при ЛЮБОМ освещении, потому что параметры — свойства поверхности, а не «как красиво при этой лампе».</p>
<h3>Что происходит физически</h3>
<pre>Диэлектрик (metallic 0): отражает ~4% зеркально,
  остальное — диффузно цветом albedo
Металл (metallic 1): диффузного НЕТ, зеркальное отражение
  ОКРАШЕНО albedo (золото жёлтое в отражениях)
Smoothness → ширина лепестка микрограней:
  гладко = точечный блик и чёткие отражения

Ошибки арта, которые ловит инженер:
- тени/свет, нарисованные В albedo (ломается при любом
  другом освещении)
- metallic 0.5 «для красоты» (нефизично, артефачит)
- normal map в неверном цветовом пространстве (не sRGB!)</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Albedo без запечённого света, metallic — бинарный выбор модели (диэлектрик 4% против окрашенного зеркального без диффуза), smoothness — распределение микрограней, нормали наклоняют шейдинг без геометрии — силуэт остаётся плоским. Это split-sum/GGX-мир: материалы корректны при любом свете. На ревью арта ловлю свет в albedo и полуметаллы».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://google.github.io/filament/Filament.html" target="_blank">Filament PBR guide</a> <span>— лучшее объяснение PBR-теории с картинками</span></li>
<li><a href="https://marmoset.co/posts/basic-theory-of-physically-based-rendering/" target="_blank">Marmoset: PBR theory</a> <span>— арт-ориентированное введение</span></li>
</ul></div>`,

83:`
<h3>Простыми словами</h3>
<p>Свет бывает трёх режимов. Realtime — честный каждый кадр: дорого, зато всё движется. Baked — посчитан заранее в текстуры-лайтмапы: в рантайме бесплатен, но только для неподвижного. Mixed — компромисс: непрямой свет запечён, прямые тени живые. А динамические объекты, которым лайтмапы недоступны, получают свет из расставленных «проб» (Light Probes).</p>
<h3>Схема, которую собирают в проде</h3>
<pre>Статика:    baked/mixed → лайтмапы (непрямой свет красивый
            и бесплатный)
Динамика:   Light Probes (простые объекты) +
            Reflection Probes (отражения)
Солнце:     mixed — запечённый bounce + realtime тень
Unity 6:    Adaptive Probe Volumes — автоматическая сетка
            проб вместо ручной расстановки, попиксельный
            сэмплинг (вопрос №112)

Классика багов: персонаж «не вписан» в сцену —
пробы расставлены редко/не там; тёмный объект в светлой
комнате — пробы за стеной; смена времени суток ломает
запечённое — нужны сценарии APV или realtime GI</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Схема: запечённый непрямой для статики, mixed для солнца (живые тени + baked bounce), Light/Reflection Probes для динамики. Качество вписывания персонажей решается плотностью и позициями проб — в Unity 6 это автоматизируют Adaptive Probe Volumes с попиксельным сэмплингом и сценариями для времени суток. Режимы света и что именно запекается в каждом — рассказываю по таблице Baked Indirect/Shadowmask/Subtractive».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/LightMode.html" target="_blank">Light Modes</a> <span>— baked/mixed/realtime подробно</span></li>
<li><a href="https://docs.unity3d.com/6000.0/Documentation/Manual/urp/probevolumes.html" target="_blank">Adaptive Probe Volumes</a> <span>— современная замена ручных проб</span></li>
</ul></div>`,

84:`
<h3>Простыми словами</h3>
<p>Тень — это рендер сцены С ТОЧКИ ЗРЕНИЯ света в текстуру глубины: «что свет видит — освещено, чего не видит — тень». Из-за конечного разрешения и точности возникает семейство артефактов с именами: acne (полосы самозатенения), peter-panning (тень «отклеилась» от ног), швы каскадов. Каждый лечится своей ручкой, и каждая ручка имеет побочный эффект.</p>
<h3>Словарь артефактов</h3>
<pre>Acne (полосатое самозатенение):
  квантование глубины → поверхность затеняет саму себя
  Лечение: depth bias ↑ (но перебор → peter-panning)
           normal bias, front-face culling в тень-проходе
Peter-panning (тень отделилась от объекта):
  перебор bias → тень «уползла» → объект летит
Швы каскадов: 4 карты на разные дистанции — на границе
  видно смену разрешения → cascade blending
Мерцание при движении камеры: texel snapping каскадов

Главный рычаг производительности: Shadow Distance —
дистанция теней режет и разрешение на метр, и число кастеров</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Shadow map — глубина из точки света; сравнение с ней при шейдинге. Баланс bias-ов: мало — acne, много — peter-panning; normal bias мягче depth bias. Каскады дают разрешение у камеры, швы лечатся блендингом. Первое, что кручу для перфа — shadow distance: он определяет и качество на метр, и объём перерисовки. На мобилках часто одна каскада + контактные тени».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/shadow-mapping.html" target="_blank">Unity: Shadow mapping</a> <span>— механика и артефакты</span></li>
<li><a href="https://learn.microsoft.com/en-us/windows/win32/dxtecharts/common-techniques-to-improve-shadow-depth-maps" target="_blank">MSDN: Shadow depth maps techniques</a> <span>— классический разбор всех артефактов</span></li>
</ul></div>`,

85:`
<h3>Простыми словами</h3>
<p>Пост-обработка — это полноэкранные проходы после рендера сцены: bloom, тонмаппинг, виньетка, цветокоррекция. URP управляет ими через Volume-ы (глобальные и локальные зоны с блендингом), а исполняет по возможности одним «убер-проходом». Цена — трафик памяти: каждый полноэкранный проход читает и пишет весь экран, что на мобилках больно.</p>
<h3>Цены по эффектам</h3>
<pre>Дёшево (в убер-проходе): виньетка, цветокоррекция через
  LUT, тонмаппинг, зерно
Средне: bloom (пирамида downsample/upsample — но на
  пониженном разрешении), chromatic aberration
Дорого: depth of field (доп. проходы + глубина),
  motion blur (векторы движения), SSAO (глубина+нормали),
  любой кастомный блюр полного разрешения

Мобильный набор: тонмаппинг + LUT + виньетка (почти
бесплатно), bloom по бюджету, остальное — по тирам
качества через Volume-профили</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Volume-фреймворк блендит настройки по приоритетам и зонам, исполнение — убер-пасс, где возможно. Мыслю трафиком: каждый fullscreen-проход = чтение+запись экрана; bloom живёт на пирамиде пониженного разрешения, цветокор — в LUT. На мобилках профиль по тирам: LUT+виньетка всем, bloom среднему+, DoF/motion blur — только топу. Кастомные эффекты — через Render Graph с transient-текстурами (вопрос №131)».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/6000.0/Documentation/Manual/urp/integration-with-post-processing.html" target="_blank">URP: Post-processing</a> <span>— Volume-система и эффекты</span></li>
<li><a href="https://docs.unity3d.com/6000.0/Documentation/Manual/urp/post-processing/post-processing-in-urp.html" target="_blank">URP: эффекты и их настройки</a> <span>— список с ценами</span></li>
</ul></div>`,
94:`
<h3>Простыми словами</h3>
<p>Пинг 80 мс означает: нажал «вперёд» — сервер узнает через 40 мс, ответ придёт ещё через 40. Если ждать сервер — управление как по телефону из другого города. Решение из трёх частей: предсказание (двигаюсь сразу, не дожидаясь), сверка (сервер прислал истину — тихо поправился) и интерполяция (чужих игроков показываю чуть в прошлом, зато плавно).</p>
<h3>Цикл на пальцах</h3>
<pre>Каждый тик клиента:
1. Ввод → сразу применил к себе (предсказание)
   + отправил серверу с номером тика
   + запомнил (тик, ввод, получившееся состояние)

Пришёл ответ сервера (за тик T, он всегда в прошлом):
2. Сравнил с тем, что я предсказал на тике T
   Совпало → выбросил историю до T, живём дальше
   Нет → ОТКАТ к серверному состоянию на T и
   ПЕРЕИГРОВКА всех моих вводов от T+1 до сейчас
   (несколько шагов симуляции за один кадр)
3. Визуально рывок сглаживается за ~100 мс

Чужие игроки: рендер в прошлом (буфер снапшотов +
интерполяция) — их предсказать нельзя, только сгладить.
Выстрелы по ним честит лаг-компенсация на сервере (в.№285)</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Предсказание: применяю ввод сразу, храню кольцевой буфер (тик, ввод, состояние). Реконсиляция: на серверном состоянии за тик T откатываюсь и переигрываю неподтверждённые вводы — поэтому симуляция должна быть дешёвой и без побочных эффектов при реплее. Чужие — интерполяция в прошлом. Частота мисспредиктов — метрика здоровья системы».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://gafferongames.com/post/introduction_to_networked_physics/" target="_blank">Gaffer On Games: networked physics series</a> <span>— каноничное объяснение цикла</span></li>
<li><a href="https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking" target="_blank">Valve: Source Multiplayer Networking</a> <span>— документ, по которому учились все</span></li>
<li><a href="https://www.gabrielgambetta.com/client-server-game-architecture.html" target="_blank">Gambetta: Client-Server Architecture</a> <span>— с интерактивными демками, лучший старт</span></li>
</ul></div>`,

95:`
<h3>Простыми словами</h3>
<p>Выбор сетевого стека — как выбор двигателя: менять посреди проекта — значит перебирать полмашины. Оси выбора: кто владеет истиной (сервер/хост/все поровну), сколько игроков, насколько страшны читеры, есть ли бюджет на серверы, и нужна ли предсказательная магия из коробки.</p>
<h3>Карта решений</h3>
<pre>NGO (Netcode for GameObjects): официальный, простой,
  кооп/казуал; предсказание — сам; UGS-интеграция
Netcode for Entities: официальный конкурентный стек —
  предсказание+роллбэк+AOI из коробки, но DOTS обязателен
Photon Fusion: зрелое предсказание, тики, хостинг —
  быстрые игры без своей инфраструктуры; платно, lock-in
Quantum (Photon): детерминизм+роллбэк продуктом —
  файтинги, RTS, мобильный синхронный PvP
Mirror/FishNet: open source; FishNet — активный наследник
  с prediction v2; своя инфраструктура, без lock-in

Кооп-инди → NGO/FishNet; шутер с бюджетом → Fusion/NfE;
детерминизм → Quantum/свой lockstep</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Сначала оси: топология авторитета, масштаб, ставки античита, бюджет на серверы, зрелость предсказания. Потом имена: NGO — кооп и простота, NfE — конкурентный масштаб на DOTS, Fusion — предсказание как сервис, Quantum — детерминированный роллбэк, FishNet — открытый и живой. Смена стека посреди проекта — переписывание: выбор через прототип-bake-off, а не по маркетингу».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs-multiplayer.unity3d.com/" target="_blank">Unity Multiplayer docs</a> <span>— NGO и NfE официально</span></li>
<li><a href="https://doc.photonengine.com/fusion/current/getting-started/fusion-intro" target="_blank">Photon Fusion docs</a> <span>— модель предсказания Fusion</span></li>
<li><a href="https://fish-networking.gitbook.io/docs/" target="_blank">FishNet docs</a> <span>— открытая альтернатива</span></li>
</ul></div>`,

278:`
<h3>Простыми словами</h3>
<p>Кто владеет «истиной» игры? Выделенный сервер: нейтральный судья в дата-центре — честно, дорого. Listen server: один из игроков — судья на своём компьютере — бесплатно, но у него нулевой пинг и абсолютная власть (читы!). Детерминированный P2P: судьи нет, все считают одинаково и сверяются — гениально для RTS, но любое расхождение фатально.</p>
<h3>Выбор с последствиями</h3>
<pre>Dedicated: соревновательное, ставки на честность,
  бюджет на хостинг. + масштаб, + античит, − деньги/ops
Listen host: кооп с друзьями. + бесплатно,
  − host advantage, − читерящий хост, − нужен host migration
Lockstep P2P: RTS/файтинги. + трафик копеечный (только
  ввод!), + реплеи бесплатно, − полный детерминизм
  обязателен, − все ждут самого лагающего

Гибриды: relay (Unity Relay) убирает боль NAT для
host/P2P; серверная валидация прогресса поверх кооп-хоста</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Выбор определяет всю архитектуру ниже. Dedicated — когда читы и честность критичны и есть бюджет; listen host — кооп, помня host advantage и вопрос миграции; lockstep — жанры с тысячами юнитов, где синхронизируем только ввод, ценой жёсткого детерминизма. Relay-серверы решают связность без полной серверной инфраструктуры».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://gafferongames.com/post/what_every_programmer_needs_to_know_about_game_networking/" target="_blank">Gaffer: What every programmer needs to know</a> <span>— обзор моделей от первоисточника</span></li>
<li><a href="https://docs.unity.com/ugs/manual/relay/manual/introduction" target="_blank">Unity Relay</a> <span>— связность без выделенных серверов</span></li>
</ul></div>`,

279:`
<h3>Простыми словами</h3>
<p>TCP гарантирует доставку всего по порядку — и в этом его беда для игр: потерялся пакет — ВСЁ новое ждёт его повторной отправки (head-of-line blocking). А в игре старый пакет с позицией бесполезен — уже пришёл новее. Поэтому игры берут UDP («кидай и забудь») и достраивают сверху ровно столько надёжности, сколько нужно каждому типу данных.</p>
<h3>Каналы и обвязка</h3>
<pre>Каналы по типам данных:
  unreliable-sequenced: снапшоты позиций
    (потерялся — плевать, следующий заменит; старые дропаем)
  reliable-ordered: чат, инвентарь, важные события
  reliable-unordered: подтверждения, независимые факты

Что ещё достраивают над UDP:
  - хендшейк и keep-alive (UDP «бессоединительный»)
  - MTU ~1200-1400 байт: больше — фрагментация
    (потеря 1 фрагмента = потеря всего сообщения)
  - ack-битфилды: «получил 100 и вот маска 99..68»
  - congestion control: не заливать канал
  - шифрование (DTLS)
WebGL: сырого UDP нет → WebSockets/WebTransport</pre>
<h3>Что сказать на собеседовании</h3>
<p>«TCP страдает head-of-line blocking — потеря стопорит всё новое, что фатально для реалтайма, где новейшее важнее полного. UDP плюс каналы: unreliable-sequenced для состояния, reliable для событий. Знаю обвязку: MTU и фрагментация, ack-векторы, keep-alive, DTLS. В Unity это Unity Transport с его pipeline-стадиями».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://gafferongames.com/post/udp_vs_tcp/" target="_blank">Gaffer: UDP vs TCP</a> <span>— первая статья великой серии</span></li>
<li><a href="https://docs.unity3d.com/Packages/com.unity.transport@2.1/manual/index.html" target="_blank">Unity Transport</a> <span>— каналы и pipeline-стадии</span></li>
</ul></div>`,

280:`
<h3>Простыми словами</h3>
<p>Слать всё состояние каждый тик — надёжно, но толсто. Дельта-компрессия: шлём только ИЗМЕНЕНИЯ относительно того, что клиент уже подтвердил. Квантование: позиция не float на 32 бита, а «сантиметровая сетка» на 18 бит. Вместе они сжимают трафик в разы — и вся хитрость в деталях против потерь пакетов.</p>
<h3>Стек сжатия</h3>
<pre>1. Квантование полей:
   позиция: мир 2км × точность 1см = 18 бит/ось
   ротация: smallest-three кватернион ≈ 29 бит
   ВАЖНО: симуляция никогда не читает квантованное
   обратно — иначе дрейф физики

2. Дельта против ПОДТВЕРЖДЁННОЙ базы:
   сервер помнит per-client последний acked-снапшот
   и кодирует дифф от НЕГО (не от «последнего
   отправленного» — тот мог потеряться!)
   Неизменившееся поле = 1 бит «нет изменений»

3. Битпакинг → при желании LZ4 сверху
Ориентир: 100-300 байт/пакет на клиента при 20-60 Гц</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Квантование по диапазонам (сантиметры позиции, smallest-three для ротаций), дельта строго против acked-базы — наивная дельта от последнего отправленного разваливается на потерях, — битпакинг сверху. Симуляция не видит квантованных значений. Метрика — биты на сущность на тик; и приоритет отбора, что вообще попадает в пакет, важнее сжатия попавшего».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://gafferongames.com/post/snapshot_compression/" target="_blank">Gaffer: Snapshot compression</a> <span>— квантование и дельты с числами</span></li>
<li><a href="https://www.gdcvault.com/play/1024597/" target="_blank">GDC: Overwatch Gameplay Architecture</a> <span>— как это собрано в шипнутом AAA</span></li>
</ul></div>`,

281:`
<h3>Простыми словами</h3>
<p>В бою 100 игроков, но тебе важны ближайшие 20 — остальные за горой. Interest management (AOI): сервер шлёт каждому только «релевантное». Это единственный способ масштабировать больше ~20 игроков — и заодно лучший античит: врага за стеной радар-хак не покажет, если данные о нём просто не приходили.</p>
<h3>Механика</h3>
<pre>Пространство: сетка ячеек — подписка на свою + соседние
  (O(1), рабочая лошадка); гистерезис границ:
  вход в интерес на 95м, выход на 105м — без дребезга

Релевантность ≠ только дистанция:
  всегда: союзники, цели, носитель флага
  видимость: не слать невидимое (Valorant Fog of War)
  ЧАСТОТА по приоритету: ближний враг 30 Гц,
  далёкая декорация 2 Гц (аккумуляторы приоритета)

Вход/выход из интереса = spawn/despawn у клиента
  (пул на клиенте для мгновенного появления)
Движки: visibility-делегаты NGO, relevancy sets NfE,
  observer-системы FishNet/Mirror</pre>
<h3>Что сказать на собеседовании</h3>
<p>«AOI превращает O(n²) вещание в почти линейное: сетка ячеек с гистерезисом, always-relevant наборы, фильтрация по видимости как античит, и приоритет модулирует частоту, а не только членство. За ~20 игроков без AOI не масштабируется ничего. В выбранном стеке знаю его механизм — от visibility-делегатов NGO до relevancy sets NfE».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://technology.riotgames.com/news/demolishing-wallhacks-valorants-fog-war" target="_blank">Riot: Valorant Fog of War</a> <span>— видимость как античит, эталонная статья</span></li>
<li><a href="https://docs-multiplayer.unity3d.com/netcode/current/basics/object-visibility/" target="_blank">NGO: Object visibility</a> <span>— механизм в Unity-стеке</span></li>
</ul></div>`,

282:`
<h3>Простыми словами</h3>
<p>Три независимых ритма: тик сервера (как часто судья пересчитывает мир), send rate (как часто он рассылает результаты) и FPS клиента (как часто рисуется картинка). Их развязка — основа архитектуры: можно симулировать на 60 Гц, слать на 20, рисовать на 144 — и всё будет плавно благодаря буферам и интерполяции.</p>
<h3>Как это сцеплено</h3>
<pre>Клиент живёт ЧУТЬ ВПЕРЕДИ сервера (на RTT/2 + буфер):
  его ввод для тика N приезжает на сервер ровно к тику N.
  Слишком впереди → лишняя задержка;
  слишком близко → ввод опаздывает, сервер экстраполирует
  → резинка. Смещение подстраивается постоянно.

Чужие сущности рендерятся ПОЗАДИ на интерполяционную
  задержку (~2 интервала снапшотов) — плавность из буфера.

Грабли: физика 50 Гц + тик 60 Гц = биения (выровнять!);
  ввод сэмплится кадрами, потребляется тиками — очередь
  со штампами тиков, не «прямо из Update»
Числа по жанрам: кооп 20-30, шутеры 60+, файтинги 60 lockstep</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Развязанные часы: тик симуляции фиксирован, send rate ниже с интерполяцией поверх, рендер свободен. Клиентские часы синхронизированы чуть вперёд сервера, чтобы ввод приезжал вовремя — смещение адаптивно; чужое рендерится позади на интерполяционный буфер. Выравниваю частоту физики с тиком — иначе биения. Ввод — очередь со штампами тиков».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking" target="_blank">Valve: Source Networking</a> <span>— тики, интерполяция, cl_interp — вся классика</span></li>
<li><a href="https://docs-multiplayer.unity3d.com/netcode/current/advanced-topics/networktime-ticks/" target="_blank">NGO: NetworkTime & ticks</a> <span>— тиковые часы в Unity-стеке</span></li>
</ul></div>`,

283:`
<h3>Простыми словами</h3>
<p>Два вида сетевых данных. Состояние — «сколько у меня здоровья СЕЙЧАС»: должно доехать до всех, включая опоздавших, и сходиться после потерь — это NetworkVariable/синхронизируемые поля. События — «произошёл взрыв»: одноразовый факт, опоздавшему неинтересен — это RPC. Перепутаешь — получишь несводимые баги.</p>
<h3>Правило выбора и его нарушения</h3>
<pre>Это важно ПОСЛЕ момента события? (late join увидит?)
  ДА → состояние (дверь открыта, счёт, здоровье)
  НЕТ → RPC (звук, вспышка, «матч начался»)

Классические ошибки:
✗ дверь через RPC «открылась» → опоздавший видит закрытую
  навсегда (пропустил событие)
✗ выстрел через bool-флаг в состоянии → пропущенные и
  двойные срабатывания, мусорный трафик
✗ доверие клиентскому RPC «я попал» → сервер валидирует
  сам (клиент шлёт намерение, не результат)

Порядок не гарантирован между системами: RPC может
приехать РАНЬШЕ спавна сущности, на которую ссылается —
нужно отложенное разрешение</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Тест: важно ли после момента? Состояние — для непрерывной истины с late join и сходимостью; RPC — для одноразовых фактов. Знаю провалы обоих направлений и тонкость порядка: RPC против прихода состояния не упорядочен — ссылки на сущности резолвлю отложенно. В серверной модели клиентские RPC — это запросы, истину пишет только сервер».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs-multiplayer.unity3d.com/netcode/current/basics/networkvariable/" target="_blank">NGO: NetworkVariable</a> <span>— состояние</span></li>
<li><a href="https://docs-multiplayer.unity3d.com/netcode/current/advanced-topics/message-system/rpc/" target="_blank">NGO: RPC</a> <span>— события и их семантика</span></li>
</ul></div>`,

284:`
<h3>Простыми словами</h3>
<p>Предсказание в деталях — это три структуры данных и одна дисциплина. Кольцевой буфер вводов и состояний; переотправка последних N вводов (потери!); и переигровка от точки расхождения. Дисциплина: симуляция должна уметь выполниться 10 раз за кадр без звуков, эффектов и прочих побочек.</p>
<h3>Детали, на которых валятся</h3>
<pre>Ввод шлётся С ИЗБЫТКОМ: пакет несёт вводы тиков N-2..N —
  потеря одного пакета не оставляет сервер без ввода

Реплей БЕЗ побочных эффектов: флаг isReplaying —
  звуки/партиклы/камера только при первом проходе
  (иначе очередь выстрелов при каждой коррекции)

Другие сущности при реплее: их НЕ пересимулируем —
  используем их интерполированные исторические позиции
  (предсказать чужой ввод нельзя)

Граница предсказанного: свой персонаж — да; толкаемый
  ящик — уже решение (в предсказанный набор или нет);
  весь мир — это rollback-неткод (в.№290)

Сглаживание коррекции: визуал догоняет симуляцию
  за ~100 мс, а не телепорт</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Кольцевые буферы (тик, ввод, состояние), избыточная отправка вводов, откат к серверному тику и реплей неподтверждённых. Побочные эффекты глушатся флагом реплея; чужие сущности при реплее — исторические, не пересимулированные. Граница предсказанного набора — осознанное решение. Метрики: частота и величина мисспредиктов на HUD разработчика».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://www.gabrielgambetta.com/client-side-prediction-server-reconciliation.html" target="_blank">Gambetta: Prediction & Reconciliation</a> <span>— пошагово с демками</span></li>
<li><a href="https://docs-multiplayer.unity3d.com/netcode/current/learn/dealing-with-latency/" target="_blank">Unity: Dealing with latency</a> <span>— обзор техник в NGO-контексте</span></li>
</ul></div>`,

285:`
<h3>Простыми словами</h3>
<p>Ты выстрелил точно в голову — но пока пакет летел, враг на сервере уже шагнул. Лаг-компенсация: сервер помнит прошлые позиции всех и проверяет попадание В ТОМ прошлом, которое видел стрелок. Оборотная сторона: жертву убивают «за стеной» — она уже спряталась в своём настоящем, но была открыта в чужом прошлом.</p>
<h3>Механика и границы</h3>
<pre>Сервер: кольцевой буфер хитбоксов всех игроков
  (~0.2-1 с истории по тикам)
Выстрел приходит со временем взгляда стрелка →
  сервер вычисляет исторический тик =
  время отправки − интерполяционный сдвиг стрелка →
  откат хитбоксов ЖЕРТВ на тот тик → рейкаст →
  урон в настоящем → восстановление

Пределы (дизайн-решения!):
- глубина отката капится (~200 мс): higher ping =
  теряешь компенсацию, а не ломаешь чужую реальность
- «favor the shooter» до предела — жертва получает
  killed-behind-cover, это осознанный трейд
- валидация самого запроса: штамп времени вне разумного →
  отклонить (иначе компенсация = вектор для читов)</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Сервер хранит историю хитбоксов, откатывает жертв к тику взгляда стрелка, рейкастит и применяет урон в настоящем. Знаю трейд: favor the shooter против killed-behind-cover, глубина отката капится, а таймстампы запросов валидируются — иначе сама компенсация становится читом. Ссылаюсь на схему Source и доклад Overwatch».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://developer.valvesoftware.com/wiki/Lag_Compensation" target="_blank">Valve: Lag compensation</a> <span>— первоисточник техники</span></li>
<li><a href="https://youtu.be/W3aieHjyNvw" target="_blank">GDC: Overwatch Netcode</a> <span>— favor the shooter в современном AAA</span></li>
</ul></div>`,

96:`
<h3>Простыми словами</h3>
<p>Редакторные инструменты — это код, который пишет команда для команды. Правильный кастомный инспектор проведён через систему сериализации Unity (SerializedProperty) — тогда undo, мультиредактирование и префаб-оверрайды работают сами. Неправильный (прямая правка полей) — выглядит так же, а ломает всё перечисленное тихо.</p>
<h3>Канон и когда что</h3>
<pre><span class="cm">// Канон Editor-а:</span>
public override void OnInspectorGUI() {
    serializedObject.Update();
    EditorGUILayout.PropertyField(_speedProp);
    if (GUILayout.Button("Bake")) Bake();     <span class="cm">// кнопки — норм</span>
    serializedObject.ApplyModifiedProperties();
}
<span class="cm">// Всё через SerializedProperty → undo/multi-edit/overrides бесплатно</span>

PropertyDrawer: на ТИП или атрибут — работает во всех
  инспекторах, списках, вложениях (переиспользуемо)
Editor: на компонент целиком — лейаут, кнопки, превью
UI Toolkit (CreateInspectorGUI): тяжёлые инспекторы,
  биндинг по путям, живые стили

Когда строить: шаг, который люди повторяют еженедельно,
или класс ошибок, превращаемый в валидацию (в.№310)</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Инспекторы — только через SerializedObject/SerializedProperty: undo, мультиредактирование и жирные префаб-оверрайды бесплатно; прямые правки target-а — источник тихих поломок. PropertyDrawer для переиспользуемых полей, Editor для компонентных панелей, UI Toolkit для тяжёлого. Editor-код живёт в Editor-сборке и оценивается по сэкономленным человеко-часам».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/editor-CustomEditors.html" target="_blank">Custom Editors</a> <span>— канон с SerializedProperty</span></li>
<li><a href="https://docs.unity3d.com/Manual/editor-PropertyDrawers.html" target="_blank">Property Drawers</a> <span>— переиспользуемые поля</span></li>
</ul></div>`,

97:`
<h3>Простыми словами</h3>
<p>CI для Unity — это «никто не собирает релизы руками»: сервер сам собирает билд на каждый мерж, гоняет тесты и кладёт артефакты. Ключевые Unity-особенности: сборка из командной строки через -batchmode, кэш папки Library (иначе каждый билд — часовой холодный импорт) и лицензии для агентов.</p>
<h3>Скелет пайплайна</h3>
<pre>Unity -batchmode -nographics -quit
  -projectPath . -executeMethod Build.Android
  -logFile build.log

static void Android() {
  <span class="cm">// версия из git, дефайны, ADDRESSABLES ДО плеера!</span>
  AddressableAssetSettings.BuildPlayerContent();
  BuildPipeline.BuildPlayer(opts);
  <span class="cm">// BuildReport → размеры в дашборд, регрессия = fail</span>
}

Полосы: PR → компиляция + EditMode-тесты (минуты)
  Ночь → полные билды платформ + PlayMode на устройствах
  Релиз → подпись, символы, выкладка (fastlane)
Ускорение: кэш Library по платформам, Unity Accelerator,
  инкрементальный IL2CPP</pre>
<h3>Что сказать на собеседовании</h3>
<p>«batchmode + executeMethod со скриптом сборки: версия из git describe, Addressables до BuildPlayer — классический баг порядка, разбор BuildReport с гейтами на размер. Кэш Library на агентах решает время, Accelerator шарит импорт. Полосы: быстрая на PR, полная ночью, релизная с подписью и символами. Каждый отгруженный байт трассируется до коммита».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/EditorCommandLineArguments.html" target="_blank">Command line arguments</a> <span>— все ключи batchmode</span></li>
<li><a href="https://game.ci/" target="_blank">GameCI</a> <span>— готовые GitHub Actions для Unity</span></li>
</ul></div>`,

98:`
<h3>Простыми словами</h3>
<p>Особенность Unity-проектов в VCS: сцены и префабы — это YAML-файлы, которые обычный merge ломает, а художники работают с бинарями, которые не мержатся вообще. Поэтому поверх git нужны: текстовая сериализация, LFS для бинарей, UnityYAMLMerge для сцен и — главное — процесс, при котором два человека не правят одну сцену.</p>
<h3>Настройка и процесс</h3>
<pre>База: Force Text + Visible Meta Files; .gitignore:
  Library/, Temp/, Logs/, Build/; LFS: текстуры, модели,
  аудио (*.psd, *.fbx, *.png...)
UnityYAMLMerge как mergetool — мержит непересекающиеся
  правки сцены; пересёкшиеся по одному объекту — нет

Процесс (важнее тулинга):
- аддитивные подсцены: свет/гео/геймплей — у каждого своя
- prefab-first: сцена = расстановка, контент в префабах
- lock на hero-сцены (LFS locks / Plastic)
- мержить мелко и часто; недельная ветка сцены = катастрофа
- meta-файлы коммитятся ВСЕГДА вместе с ассетом
  (потерянный meta = новый GUID = битые ссылки у всех)</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Force Text, meta в коммите с ассетом (GUID!), LFS для бинарей, UnityYAMLMerge для сцен. Но сцены — проблема координации, не мержа: аддитивное разбиение по владельцам, prefab-first, локи на немержимое. Ветки короткие. Смотрю и Unity Version Control для арт-тяжёлых команд — локи и частичные чекауты там нативные».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/SmartMerge.html" target="_blank">Smart Merge / UnityYAMLMerge</a> <span>— настройка mergetool</span></li>
<li><a href="https://unity.com/how-to/version-control-systems" target="_blank">Unity: Version control guide</a> <span>— практики для команд</span></li>
</ul></div>`,

99:`
<h3>Простыми словами</h3>
<p>Баг «только в билде на устройстве» — это всегда разница сред: IL2CPP вместо Mono, стриппинг, другие тайминги, другая файловая система, релизные настройки. Стратегия: сделать баг наблюдаемым (логи, репортер), затем сузить разницу сред до конкретного подозреваемого.</p>
<h3>Протокол охоты</h3>
<pre>1. Development build + Script Debugging → воспроизвёлся?
   НЕТ → подозревай стриппинг/IL2CPP/release-тайминги
2. Логи в файл на устройстве (persistentDataPath),
   adb logcat / Xcode console — читать нативный поток
3. Разница конфигов: stripping level, backend, exceptions
   (release может урезать managed-исключения!)
4. Стриппинг-гипотеза: link.xml на подозреваемую сборку
   целиком → починилось = найден класс проблемы
5. Краши: символизированный нативный стек (в.№305)
6. Гейзенбаги: реплей ввода + ring-buffer логов,
   дамп по Application.logMessageReceived

Профилактика: smoke-тест IL2CPP-билда в CI ловит
класс «в редакторе работает» до QA</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Сначала делаю наблюдаемым: dev-билд с отладчиком, файловые логи, платформенные консоли. Затем бинарный поиск по разнице сред: Mono/IL2CPP, стриппинг (link.xml на всю сборку как тест гипотезы), поддержка исключений, тайминги. Краши — только с символами. И ночной IL2CPP-smoke в CI, чтобы класс таких багов ловился систематически».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/Manual/ManagedCodeDebugging.html" target="_blank">Managed code debugging</a> <span>— отладчик на устройстве</span></li>
<li><a href="https://docs.unity3d.com/Manual/ScriptingRestrictions.html" target="_blank">Scripting restrictions</a> <span>— чеклист AOT-подозреваемых</span></li>
</ul></div>`,

100:`
<h3>Простыми словами</h3>
<p>Кодовая база живёт годы, люди меняются, дедлайны давят. Здоровье держится не на героизме, а на системах: границы, которые проверяет компилятор (asmdef); ошибки, которые ловит CI, а не игроки; апгрейды по расписанию, а не «когда припрёт»; и инструменты, делающие правильное — лёгким.</p>
<h3>Система из пяти опор</h3>
<pre>1. Границы компилятором: asmdef с направленным графом
   зависимостей; циклы = ошибка сборки
2. Автоматизация забываемого: валидация импорта и ссылок,
   перф- и размер-гейты, smoke каждой сцены — всё в CI
3. Логика в чистом C#: тестируема, переживает апгрейды
   движка; MonoBehaviour — тонкая обвязка
4. Апгрейды осознанно: LTS, ветка-разведка, по расписанию;
   отставание на 3 версии = переписывание
5. Инструменты контента: скорость итерации дизайнеров
   определяет стоимость проекта (в.№310)

И культура: перф-бюджеты с владельцами, ревью с фокусом
на границы, задокументированные «почему» решений</pre>
<h3>Что сказать на собеседовании</h3>
<p>«Здоровье — это системы, а не дисциплина силы воли: компилятор охраняет архитектуру через asmdef, CI ловит регрессии перфа/размера/контента, игровая логика в чистом C# переживает движковые апгрейды, апгрейды идут по расписанию через spike-ветку, а инвестиции в инструменты команды — самые окупаемые. Мой KPI: просьба дизайнера ложится без рефакторинга, новый инженер продуктивен в первую неделю».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://unity.com/resources/level-up-your-code-with-game-programming-patterns" target="_blank">Unity e-book: Level up your code</a> <span>— паттерны и организация от Unity</span></li>
<li><a href="https://unity.com/how-to/organizing-your-project" target="_blank">Organizing your project</a> <span>— структура, конвенции</span></li>
</ul></div>`,

296:`
<h3>Простыми словами</h3>
<p>Разница между «работающим» и «правильным» кастомным инспектором невидима глазу: оба рисуют поля. Но правильный (через SerializedProperty) бесплатно получает undo, редактирование нескольких объектов сразу и жирный шрифт префаб-оверрайдов, а неправильный (myTarget.field = ...) молча ломает всё это — и команда узнаёт через месяц.</p>
<h3>Два пути на одном примере</h3>
<pre><span class="cm">// НЕПРАВИЛЬНО (но работает на вид):</span>
var t = (Enemy)target;
t.speed = EditorGUILayout.FloatField("Speed", t.speed);
<span class="cm">// нет undo, нет multi-edit, нет override-жирности,</span>
<span class="cm">// сцена не помечается dirty</span>

<span class="cm">// ПРАВИЛЬНО:</span>
serializedObject.Update();
EditorGUILayout.PropertyField(
    serializedObject.FindProperty("speed"));
serializedObject.ApplyModifiedProperties();

<span class="cm">// Реакция на изменение:</span>
EditorGUI.BeginChangeCheck();
...
if (EditorGUI.EndChangeCheck()) Rebake();</pre>
<p>PropertyDrawer против Editor: дроер вешается на тип/атрибут и работает всюду (в списках, вложенных классах, чужих инспекторах) — для переиспользуемого UX; Editor — на компонент, для кнопок и композиции. UI Toolkit-инспекторы — для тяжёлых случаев: биндинг по путям и производительность.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Только через SerializedObject/Property — это не стилистика, а функциональность: undo, multi-edit, префаб-оверрайды, dirty-состояние. BeginChangeCheck для реакций, PropertyDrawer для переиспользуемого, Editor для панелей, UIT для тяжёлого. Инспектор, ломающий отображение оверрайдов, порождает загадочные ревёрты у всей команды — поэтому это пункт код-ревью».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/ScriptReference/SerializedObject.html" target="_blank">SerializedObject</a> <span>— API канона</span></li>
<li><a href="https://docs.unity3d.com/Manual/UIE-HowTo-CreateCustomInspector.html" target="_blank">Custom inspector with UI Toolkit</a> <span>— современный путь</span></li>
</ul></div>`,

297:`
<h3>Простыми словами</h3>
<p>AssetPostprocessor — код, который выполняется при каждом импорте ассета и может выставить настройки ДО импорта. Это превращает договорённости («текстуры UI без мипов», «модели без Read/Write») из вики-страницы в физику проекта: художник кидает файл в папку — файл сам получает правильные настройки. Забыть невозможно.</p>
<h3>Паттерн «конвенции папок»</h3>
<pre>class ImportRules : AssetPostprocessor {
    void OnPreprocessTexture() {
        var imp = (TextureImporter)assetImporter;
        if (assetPath.Contains("/UI/")) {
            imp.textureType = TextureImporterType.Sprite;
            imp.mipmapEnabled = false;
        }
        if (assetPath.EndsWith("_N.png"))
            imp.textureType = TextureImporterType.NormalMap;
    }
    <span class="cm">// OnPreprocessModel: Read/Write off, scale, материалы</span>
    <span class="cm">// OnPreprocessAudio: Vorbis/mono по папкам Music|SFX</span>
}</pre>
<p>Дисциплина: правила — в конфиг-ассете с порогами (дизайнер видит), GetVersion() бампается при смене правил (форс-реимпорт), каждое авторешение логируется. И выбор философии: тихая мутация против валидатора, роняющего импорт с внятным сообщением — для спорных вещей валидатор честнее.</p>
<h3>Что сказать на собеседовании</h3>
<p>«Постпроцессоры превращают правила импорта в код: конвенции папок/суффиксов выставляют настройки автоматически — бюджет памяти защищает себя сам. Версионирую процессор для реимпортов, логирую решения, спорное валидирую с падением вместо тихой перезаписи. Плюс CI-аудит настроек по всему репозиторию против дрейфа».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/ScriptReference/AssetPostprocessor.html" target="_blank">AssetPostprocessor</a> <span>— все хуки</span></li>
<li><a href="https://docs.unity3d.com/Manual/DefaultPresetsByFolder.html" target="_blank">Presets by folder</a> <span>— декларативная альтернатива для простых случаев</span></li>
</ul></div>`,

298:`
<h3>Простыми словами</h3>
<p>OnValidate вызывается при каждом изменении поля в инспекторе и после загрузки — место для поддержания согласованности данных компонента: клампы, пересчёт производных, обновление превью. Но он выполняется в «опасное» время (во время сериализации), где половина Unity API запрещена — и на каждой рекомпиляции для каждого инстанса, поэтому тяжесть в нём умножается.</p>
<h3>Правила безопасности</h3>
<pre>void OnValidate() {
    maxHp = Mathf.Max(1, maxHp);          <span class="cm">// ✔ данные — ок</span>
    _cachedRadius = ComputeRadius();       <span class="cm">// ✔ производные — ок</span>

    <span class="cm">// ✘ SetActive/Destroy/AddComponent — предупреждения,</span>
    <span class="cm">// порча префабов. Побочное — отложенно:</span>
#if UNITY_EDITOR
    UnityEditor.EditorApplication.delayCall += () =&gt; {
        if (this == null) return;          <span class="cm">// мог умереть!</span>
        RefreshPreview();
    };
#endif
}
<span class="cm">// Выполняется на КАЖДОЙ рекомпиляции × каждый инстанс:</span>
<span class="cm">// держать дешёвым, guard-ить change-check-ами</span></pre>
<p>Границы применения: OnValidate — про согласованность ОДНОГО компонента. Кросс-объектная валидация проекта (битые ссылки, сломанные сетапы) — это отдельные проходы: сканер сцен/префабов из меню и в CI с отчётом.</p>
<h3>Что сказать на собеседовании</h3>
<p>«OnValidate — клампы и производные данные; побочные эффекты — только через delayCall с null-проверкой, потому что выполняется в фазе сериализации. Помню про рекомпиляции: тяжёлый OnValidate × тысячи инстансов = медленный domain reload. Проектная валидация — не его работа: отдельный сканер в меню и CI».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/ScriptReference/MonoBehaviour.OnValidate.html" target="_blank">OnValidate</a> <span>— когда вызывается и ограничения</span></li>
</ul></div>`,

299:`
<h3>Простыми словами</h3>
<p>Gizmos — рисование в Scene view: конусы обзора ИИ, радиусы взрыва, патрульные маршруты. Без них дизайнер настраивает невидимые данные вслепую. Handles — то же, но ИНТЕРАКТИВНОЕ: вейпоинты можно таскать прямо в сцене, а не вбивать координаты в инспекторе. Пара дней на такие инструменты окупается неделями сэкономленных итераций.</p>
<h3>Практика</h3>
<pre><span class="cm">// Gizmos — в MonoBehaviour:</span>
void OnDrawGizmosSelected() {          <span class="cm">// Selected: только выделенный —</span>
    Gizmos.color = Color.red;          <span class="cm">// сцена с 5000 гизмо нечитаема</span>
    Gizmos.DrawWireSphere(transform.position, aggroRadius);
}

<span class="cm">// Handles — в Editor-е (OnSceneGUI):</span>
void OnSceneGUI() {
    var t = (PatrolPath)target;
    for (int i = 0; i &lt; t.points.Length; i++) {
        EditorGUI.BeginChangeCheck();
        var p = Handles.PositionHandle(t.points[i], Quaternion.identity);
        if (EditorGUI.EndChangeCheck()) {
            Undo.RecordObject(t, "Move Point");   <span class="cm">// undo обязателен!</span>
            t.points[i] = p;
        }
    }
}
<span class="cm">// Уровень выше: EditorTool — свой инструмент в тулбаре как Move/Rotate</span></pre>
<h3>Что сказать на собеседовании</h3>
<p>«Gizmos визуализируют невидимые данные — конусы, радиусы, пути; дорогое рисование за OnDrawGizmosSelected или debug-флагом. Handles делают данные редактируемыми в сцене — с обязательными Undo.RecordObject и ChangeCheck. Для полноценных инструментов — EditorTool в тулбаре. Аргумент — экономика: секунды вместо минут на итерацию × число итераций в день».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/ScriptReference/Handles.html" target="_blank">Handles</a> <span>— интерактивные манипуляторы</span></li>
<li><a href="https://docs.unity3d.com/Manual/UsingCustomEditorTools.html" target="_blank">Custom Editor Tools</a> <span>— инструменты уровня тулбара</span></li>
</ul></div>`,

300:`
<h3>Простыми словами</h3>
<p>Скрипт сборки — это код, который делает то, что человек делает мышкой в Build Settings, плюс всё, что человек забывает: версию, дефайны, Addressables, символы, отчёт о размере. Цель — чтобы «собрать релиз» было одной командой, одинаковой на ноутбуке и на CI-сервере.</p>
<h3>Анатомия скрипта сборки</h3>
<pre>public static void BuildAndroid() {   <span class="cm">// вызывается из CLI</span>
    PlayerSettings.bundleVersion = GitDescribe();
    SetDefines("RELEASE");             <span class="cm">// флейворы через дефайны</span>

    AddressableAssetSettings.BuildPlayerContent();
    <span class="cm">// ^ ДО BuildPlayer — иначе устаревший контент, классика</span>

    var report = BuildPipeline.BuildPlayer(new BuildPlayerOptions {
        scenes = EnabledScenes(), target = BuildTarget.Android,
        locationPathName = "Builds/game.aab"
    });

    <span class="cm">// BuildReport → размер по категориям → дашборд;</span>
    <span class="cm">// превышение бюджета = throw = красный CI</span>
    if (report.summary.totalSize &gt; Budget) throw new Exception(...);
}
<span class="cm">// Пост-шаги: загрузка символов в краш-репортер, подпись, стор</span></pre>
<h3>Что сказать на собеседовании</h3>
<p>«Статический метод под -executeMethod: версия из git, дефайны флейворов, Addressables строго до BuildPlayer, разбор BuildReport с гейтами размера, пост-шаги — символы и подпись. Одна команда локально и на CI. Build Profiles в новых версиях упрощают флейворы. Порядок Addressables/Player — вопрос-ловушка, на нём горят реальные проекты».</p>
<div class="links"><h3>Где почитать</h3><ul>
<li><a href="https://docs.unity3d.com/ScriptReference/Build.Reporting.BuildReport.html" target="_blank">BuildReport</a> <span>— разбор результатов сборки</span></li>
<li><a href="https://docs.unity3d.com/Manual/build-profiles.html" target="_blank">Build Profiles</a> <span>— современное управление конфигурациями</span></li>
</ul></div>`,
};
