/**
 * Language-level bugs: the C# traps that survive code review because the
 * snippet compiles, runs, and is wrong only under load, over time, or on the
 * second call.
 */
import type { BugHuntItem } from "@/types/content";

export const csharpBugs: BugHuntItem[] = [
  {
    id: "cs-string-concat-loop",
    c: "csharp",
    t: "Joining names for a log line",
    tru: "Склейка имён для строки лога",
    code: `string BuildLabel(List<string> names)
{
    string line = "";
    for (int i = 0; i < names.Count; i++)
        line += names[i] + ", ";
    return line;
}`,
    bug: [5],
    a: "Strings are immutable, so every `+=` allocates a brand-new string and copies everything gathered so far — n allocations and O(n²) copying for one label.",
    aru: "Строки неизменяемы, поэтому каждый `+=` создаёт новую строку и копирует всё накопленное — n аллокаций и O(n²) копирования ради одной подписи.",
    fix: "Use a StringBuilder, or `string.Join(\", \", names)` when the separator is all you need.",
    fixru: "Взять StringBuilder или `string.Join(\", \", names)`, если нужен только разделитель.",
  },
  {
    id: "cs-float-equality",
    c: "csharp",
    t: "Has the slider reached the end?",
    tru: "Ползунок доехал до конца?",
    code: `bool IsFull(float current, float max)
{
    float ratio = current / max;
    return ratio == 1.0f;
}`,
    bug: [4],
    a: "Float arithmetic almost never lands on an exact value: 0.1f summed ten times is not 1.0f, so this returns false for a bar the player sees as full.",
    aru: "Арифметика с float почти никогда не даёт точное значение: 0.1f, сложенный десять раз, не равен 1.0f — и для игрока полная полоска вернёт false.",
    fix: "Compare with a tolerance: `ratio >= 1f - 1e-4f`, or `Mathf.Approximately` when the magnitudes are near 1.",
    fixru: "Сравнивать с допуском: `ratio >= 1f - 1e-4f`, или `Mathf.Approximately`, когда величины около единицы.",
  },
  {
    id: "cs-modify-while-foreach",
    c: "csharp",
    t: "Dropping dead enemies from the list",
    tru: "Удаление мёртвых врагов из списка",
    code: `void Cleanup(List<Enemy> enemies)
{
    foreach (var e in enemies)
    {
        if (e.Health <= 0)
            enemies.Remove(e);
    }
}`,
    bug: [6],
    a: "Removing from a List while enumerating it invalidates the enumerator — the next MoveNext throws InvalidOperationException.",
    aru: "Удаление из List во время перебора ломает энумератор — следующий MoveNext бросит InvalidOperationException.",
    fix: "Iterate backwards by index, or use `enemies.RemoveAll(e => e.Health <= 0)`.",
    fixru: "Идти по индексу с конца или вызвать `enemies.RemoveAll(e => e.Health <= 0)`.",
  },
  {
    id: "cs-integer-division",
    c: "csharp",
    t: "Percent of the wave cleared",
    tru: "Процент зачищенной волны",
    code: `float Progress(int killed, int total)
{
    if (total == 0) return 0f;
    return killed / total * 100f;
}`,
    bug: [4],
    a: "`killed / total` is integer division and truncates to 0 for every partial wave, so the result is 0 until the very last kill flips it to 100.",
    aru: "`killed / total` — целочисленное деление, оно обрезается до 0 на любой незавершённой волне: результат равен 0 до последнего убийства, а потом сразу 100.",
    fix: "Promote before dividing: `(float)killed / total * 100f`.",
    fixru: "Привести тип до деления: `(float)killed / total * 100f`.",
  },
  {
    id: "cs-equals-no-hashcode",
    c: "csharp",
    t: "Value equality for an item id",
    tru: "Сравнение по значению для id предмета",
    code: `struct ItemId
{
    public int Value;

    public override bool Equals(object o) => o is ItemId other && other.Value == Value;
}`,
    bug: [5],
    a: "Overriding Equals without GetHashCode breaks every hash-based container: two equal ids can land in different buckets, so a Dictionary lookup misses the entry it just stored.",
    aru: "Переопределённый Equals без GetHashCode ломает все хэш-контейнеры: два равных id попадут в разные корзины, и Dictionary не найдёт то, что только что положил.",
    fix: "Override GetHashCode alongside it (`=> Value;`) and implement IEquatable<ItemId> to avoid boxing on every comparison.",
    fixru: "Переопределить рядом GetHashCode (`=> Value;`) и реализовать IEquatable<ItemId>, чтобы не боксировать на каждом сравнении.",
  },
  {
    id: "cs-event-never-unsubscribed",
    c: "csharp",
    t: "Listening to a global event",
    tru: "Подписка на глобальное событие",
    code: `public class HudPanel : MonoBehaviour
{
    void OnEnable()
    {
        GameEvents.ScoreChanged += Redraw;
    }

    void Redraw(int score) { /* ... */ }
}`,
    bug: [5],
    a: "A static event holds a strong reference to this panel forever: the object is never collected, and Redraw keeps firing on a destroyed MonoBehaviour after the scene unloads.",
    aru: "Статическое событие вечно держит сильную ссылку на панель: объект не соберётся, а Redraw продолжит вызываться на уничтоженном MonoBehaviour после выгрузки сцены.",
    fix: "Unsubscribe symmetrically in OnDisable: `GameEvents.ScoreChanged -= Redraw;`.",
    fixru: "Симметрично отписываться в OnDisable: `GameEvents.ScoreChanged -= Redraw;`.",
  },
  {
    id: "cs-swallowed-exception",
    c: "csharp",
    t: "Loading the save file",
    tru: "Загрузка файла сохранения",
    code: `SaveData Load(string path)
{
    try
    {
        return JsonUtility.FromJson<SaveData>(File.ReadAllText(path));
    }
    catch (Exception)
    {
        return null;
    }
}`,
    bug: [7, 9],
    a: "The catch swallows everything — a missing file, a corrupt save and a permissions error all become a silent null, and the player's bug report contains nothing to act on.",
    aru: "Catch проглатывает всё: отсутствующий файл, битое сохранение и проблема с правами превращаются в молчаливый null, и в баг-репорте игрока не остаётся ничего полезного.",
    fix: "Catch the specific exceptions you can handle, log the rest with context, and let the truly unexpected ones surface.",
    fixru: "Ловить конкретные исключения, которые умеете обработать, остальные логировать с контекстом, а по-настоящему неожиданные — пропускать наверх.",
  },
  {
    id: "cs-struct-copy-mutation",
    c: "csharp",
    t: "Nudging a stored position",
    tru: "Сдвиг сохранённой позиции",
    code: `struct Slot { public Vector3 Pos; }

void Nudge(List<Slot> slots)
{
    slots[0].Pos += Vector3.up;
}`,
    bug: [5],
    a: "A List indexer returns a *copy* of a struct, so this mutates a temporary. (With `List<T>` it does not even compile; with an array or a property it silently does nothing.)",
    aru: "Индексатор List возвращает *копию* структуры, поэтому меняется временный объект. (С `List<T>` это даже не скомпилируется, а с массивом или свойством молча ничего не произойдёт.)",
    fix: "Read out, modify, write back: `var s = slots[0]; s.Pos += Vector3.up; slots[0] = s;` — or use a class, or `CollectionsMarshal.AsSpan`.",
    fixru: "Прочитать, изменить, записать обратно: `var s = slots[0]; s.Pos += Vector3.up; slots[0] = s;` — либо класс, либо `CollectionsMarshal.AsSpan`.",
  },
  {
    id: "cs-captured-loop-variable",
    c: "csharp",
    t: "Wiring up ten buttons",
    tru: "Привязка десяти кнопок",
    code: `void Bind(Button[] buttons)
{
    for (int i = 0; i < buttons.Length; i++)
    {
        buttons[i].onClick.AddListener(() => Select(i));
    }
}`,
    bug: [5],
    a: "The lambda captures the loop *variable*, not its value, so every listener runs with i equal to buttons.Length once the loop ends.",
    aru: "Лямбда захватывает саму *переменную* цикла, а не её значение, поэтому после выхода из цикла все обработчики получат i, равный buttons.Length.",
    fix: "Copy into a local inside the loop: `int index = i;` and capture `index`. (A `foreach` variable is per-iteration since C# 5; a `for` variable is not.)",
    fixru: "Скопировать в локальную переменную внутри цикла: `int index = i;` и захватывать `index`. (Переменная `foreach` с C# 5 своя на итерацию, переменная `for` — нет.)",
  },
  {
    id: "cs-linq-multiple-enumeration",
    c: "csharp",
    t: "Picking the visible targets",
    tru: "Отбор видимых целей",
    code: `void Aim(IEnumerable<Target> all)
{
    var visible = all.Where(t => IsVisible(t));
    if (visible.Any())
        Debug.Log(visible.First().name + " of " + visible.Count());
}`,
    bug: [3],
    a: "`visible` is a lazy query, not a result: Any, First and Count each re-run the whole Where and call the IsVisible raycast three more times.",
    aru: "`visible` — это ленивый запрос, а не результат: Any, First и Count заново прогоняют весь Where и вызывают проверку видимости ещё три раза.",
    fix: "Materialize once — `var visible = all.Where(...).ToList();` — then query the list.",
    fixru: "Материализовать один раз — `var visible = all.Where(...).ToList();` — и работать со списком.",
  },
  {
    id: "cs-lock-on-this",
    c: "csharp",
    t: "Guarding a shared queue",
    tru: "Защита общей очереди",
    code: `public class Uploader
{
    private readonly Queue<byte[]> pending = new();

    public void Enqueue(byte[] data)
    {
        lock (this) { pending.Enqueue(data); }
    }
}`,
    bug: [7],
    a: "`this` is publicly reachable, so any outside code that locks the same Uploader instance participates in your lock — a deadlock you cannot see from inside this class.",
    aru: "`this` доступен снаружи, поэтому любой внешний код, взявший блокировку на тот же Uploader, участвует в вашей синхронизации — дедлок, которого изнутри класса не видно.",
    fix: "Lock a private object owned by the class: `private readonly object gate = new();`.",
    fixru: "Блокировать приватный объект самого класса: `private readonly object gate = new();`.",
  },
  {
    id: "cs-virtual-call-in-ctor",
    c: "csharp",
    t: "Initializing a weapon",
    tru: "Инициализация оружия",
    code: `public class Weapon
{
    public Weapon()
    {
        Reset();
    }

    public virtual void Reset() { }
}`,
    bug: [5],
    a: "A virtual call from a constructor runs the *derived* override before the derived constructor has initialized its own fields — the override sees nulls and default values.",
    aru: "Виртуальный вызов из конструктора выполняет переопределение *наследника* до того, как конструктор наследника проинициализировал свои поля — внутри будут null и значения по умолчанию.",
    fix: "Make the method non-virtual, or move the call to an explicit Initialize() the caller invokes after construction.",
    fixru: "Сделать метод невиртуальным или вынести вызов в явный Initialize(), который вызывается после конструктора.",
  },
  {
    id: "cs-dictionary-double-lookup",
    c: "csharp",
    t: "Reading a cached stat",
    tru: "Чтение закэшированного стата",
    code: `int Stat(Dictionary<string, int> stats, string key)
{
    if (stats.ContainsKey(key))
        return stats[key];
    return 0;
}`,
    bug: [3, 4],
    a: "Two hash lookups for one answer, and the pattern rots into a race the moment another thread or a callback writes between the check and the read.",
    aru: "Два хэш-поиска ради одного ответа, и эта схема превращается в гонку, как только между проверкой и чтением что-то пишет другой поток или колбэк.",
    fix: "One lookup: `return stats.TryGetValue(key, out var value) ? value : 0;`.",
    fixru: "Один поиск: `return stats.TryGetValue(key, out var value) ? value : 0;`.",
  },
  {
    id: "cs-enum-hasflag-mask",
    c: "csharp",
    t: "Testing a damage flag",
    tru: "Проверка флага урона",
    code: `[Flags] enum Damage { None = 0, Fire = 1, Ice = 2, Shock = 4 }

bool IsFire(Damage d)
{
    return (d & Damage.Fire) == 1;
}`,
    bug: [5],
    a: "A flags test must compare against the flag, not the literal 1 — this does not even compile as written, and the `!= 0` form is what actually generalises to every flag.",
    aru: "Проверка флага должна сравниваться с самим флагом, а не с литералом 1 — в таком виде это даже не скомпилируется, а обобщается на все флаги только форма `!= 0`.",
    fix: "`return (d & Damage.Fire) != 0;` — the allocation-free equivalent of HasFlag.",
    fixru: "`return (d & Damage.Fire) != 0;` — эквивалент HasFlag без аллокаций.",
  },
  {
    id: "cs-static-mutable-state",
    c: "csharp",
    t: "A handy global counter",
    tru: "Удобный глобальный счётчик",
    code: `public static class Score
{
    public static int Points;

    public static void Add(int p) => Points += p;
}`,
    bug: [3],
    a: "Static state survives scene loads and domain reloads being disabled in the editor, so the second playthrough starts with the first one's score.",
    aru: "Статическое состояние переживает загрузку сцен и отключённый в редакторе domain reload, поэтому второй заход начинается со счётом от первого.",
    fix: "Own the state in an instance (a service or ScriptableObject) with an explicit reset, or clear it from `[RuntimeInitializeOnLoadMethod]`.",
    fixru: "Держать состояние в экземпляре (сервис или ScriptableObject) с явным сбросом либо очищать его из `[RuntimeInitializeOnLoadMethod]`.",
  },
  {
    id: "cs-idisposable-not-disposed",
    c: "csharp",
    t: "Writing a debug dump",
    tru: "Запись отладочного дампа",
    code: `void Dump(string path, string text)
{
    var writer = new StreamWriter(path);
    writer.Write(text);
    writer.Close();
}`,
    bug: [3],
    a: "If Write throws, Close never runs and the file handle leaks — on Windows the file then stays locked until the process exits.",
    aru: "Если Write бросит исключение, Close не выполнится и хэндл файла утечёт — на Windows файл после этого заблокирован до выхода из процесса.",
    fix: "`using var writer = new StreamWriter(path);` — disposal then happens on every path out, including exceptions.",
    fixru: "`using var writer = new StreamWriter(path);` — освобождение произойдёт на любом выходе, включая исключение.",
  },
  {
    id: "cs-null-coalescing-unity-object",
    c: "csharp",
    t: "Falling back to a default target",
    tru: "Подстановка цели по умолчанию",
    code: `public Transform target;

Transform Resolve(Transform fallback)
{
    return target ?? fallback;
}`,
    bug: [5],
    a: "`??` uses the real reference, bypassing UnityEngine.Object's overloaded `==`: a destroyed Transform is not null to the runtime, so this returns a dead object instead of the fallback.",
    aru: "`??` работает с настоящей ссылкой и обходит перегруженный `==` у UnityEngine.Object: уничтоженный Transform для рантайма не null, поэтому вернётся мёртвый объект вместо запасного.",
    fix: "Use the Unity-aware comparison: `return target != null ? target : fallback;`.",
    fixru: "Использовать сравнение, знающее про Unity: `return target != null ? target : fallback;`.",
  },
  {
    id: "cs-default-switch-missing",
    c: "csharp",
    t: "Mapping a state to a speed",
    tru: "Сопоставление состояния и скорости",
    code: `float SpeedFor(MoveState state)
{
    switch (state)
    {
        case MoveState.Walk: return 2f;
        case MoveState.Run:  return 6f;
    }
    return 0f;
}`,
    bug: [8],
    a: "A new enum member silently falls through to 0 — the character freezes in the new state and nothing anywhere reports why.",
    aru: "Новый член перечисления молча провалится в 0 — персонаж замирает в новом состоянии, и нигде ничего об этом не сообщается.",
    fix: "Handle the default explicitly: throw, or log once and return a safe value, so an unhandled state is loud.",
    fixru: "Обработать default явно: бросить исключение либо один раз залогировать и вернуть безопасное значение, чтобы необработанное состояние было заметно.",
  },
  {
    id: "cs-datetime-now",
    c: "csharp",
    t: "Stamping a daily reward",
    tru: "Отметка ежедневной награды",
    code: `bool CanClaim(DateTime lastClaim)
{
    return DateTime.Now - lastClaim > TimeSpan.FromHours(24);
}`,
    bug: [3],
    a: "DateTime.Now is local time: it jumps on DST changes and on a timezone switch, and the player can walk the reward forward by changing the device clock.",
    aru: "DateTime.Now — локальное время: оно прыгает при переходе на летнее время и при смене часового пояса, а игрок может «прокрутить» награду, переставив часы устройства.",
    fix: "Use DateTime.UtcNow for spans, and validate anything the player can profit from against a server timestamp.",
    fixru: "Для интервалов брать DateTime.UtcNow, а всё, на чём игрок может выиграть, сверять с серверным временем.",
  },
  {
    id: "cs-boxing-in-hot-path",
    c: "csharp",
    t: "Sorting hits by distance",
    tru: "Сортировка попаданий по дистанции",
    code: `void SortHits(List<Hit> hits)
{
    hits.Sort((a, b) => ((IComparable)a.Distance).CompareTo(b.Distance));
}`,
    bug: [3],
    a: "Casting a float to IComparable boxes it — two allocations per comparison, so an n log n sort produces thousands of garbage objects per call.",
    aru: "Приведение float к IComparable боксирует значение — две аллокации на сравнение, и сортировка за n log n рождает тысячи мусорных объектов за вызов.",
    fix: "Compare the values directly: `hits.Sort((a, b) => a.Distance.CompareTo(b.Distance));`.",
    fixru: "Сравнивать значения напрямую: `hits.Sort((a, b) => a.Distance.CompareTo(b.Distance));`.",
  },
];
