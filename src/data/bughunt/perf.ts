/**
 * Performance and rendering bugs: code that is functionally correct and shows
 * up as a spike in the profiler, a garbage collection every few seconds, or a
 * canvas that rebuilds itself sixty times a second.
 */
import type { BugHuntItem } from "@/types/content";

export const perfBugs: BugHuntItem[] = [
  {
    id: "perf-getcomponent-update",
    c: "perf",
    t: "Reading health every frame",
    tru: "Чтение здоровья каждый кадр",
    code: `void Update()
{
    var health = GetComponent<Health>();
    bar.fillAmount = health.Current / health.Max;
}`,
    bug: [3],
    a: "GetComponent walks the component list on every frame and per object — free-looking in a one-object test scene, a profiler line of its own with three hundred enemies.",
    aru: "GetComponent каждый кадр обходит список компонентов у каждого объекта — в тестовой сцене с одним объектом это незаметно, а с тремя сотнями врагов превращается в отдельную строку профайлера.",
    fix: "Cache the reference in Awake and reuse the field.",
    fixru: "Закэшировать ссылку в Awake и переиспользовать поле.",
  },
  {
    id: "perf-camera-main",
    c: "perf",
    t: "Billboarding towards the camera",
    tru: "Разворот к камере",
    code: `void LateUpdate()
{
    transform.forward = Camera.main.transform.forward;
}`,
    bug: [3],
    a: "Camera.main is a tag lookup over the scene, not a field: called per frame per billboard it becomes one of the most common profiler surprises in Unity projects.",
    aru: "Camera.main — это поиск по тегу в сцене, а не поле: вызов каждый кадр для каждого билборда — одна из самых частых неожиданностей в профайлере Unity-проектов.",
    fix: "Cache the camera once in Awake, or inject it.",
    fixru: "Закэшировать камеру один раз в Awake или передать её зависимостью.",
  },
  {
    id: "perf-find-update",
    c: "perf",
    t: "Locating the player",
    tru: "Поиск игрока",
    code: `void Update()
{
    var player = GameObject.Find("Player");
    if (player != null) Chase(player.transform);
}`,
    bug: [3],
    a: "Find scans every object in every loaded scene by name, every frame, for every chaser — and returns nothing for an inactive player, so the AI silently stops.",
    aru: "Find каждый кадр для каждого преследователя обходит по имени все объекты во всех загруженных сценах — и возвращает null для выключенного игрока, отчего ИИ молча останавливается.",
    fix: "Resolve the reference once (registry, event on spawn, serialized field) and keep it.",
    fixru: "Получить ссылку один раз (реестр, событие при спавне, сериализованное поле) и хранить её.",
  },
  {
    id: "perf-no-pooling",
    c: "perf",
    t: "Firing the machine gun",
    tru: "Стрельба из пулемёта",
    code: `void Fire()
{
    var b = Instantiate(bulletPrefab, muzzle.position, muzzle.rotation);
    Destroy(b, 3f);
}`,
    bug: [3, 4],
    a: "Instantiate/Destroy at twenty rounds a second allocates and collects continuously — the GC spike lands in the middle of the firefight, which is exactly when frame time matters.",
    aru: "Instantiate/Destroy двадцать раз в секунду непрерывно выделяет и собирает память — всплеск GC приходится на середину перестрелки, то есть ровно туда, где важно время кадра.",
    fix: "Pool the bullets: take from a pool on fire, return on hit or timeout.",
    fixru: "Пулить пули: брать из пула при выстреле и возвращать при попадании или по таймеру.",
  },
  {
    id: "perf-material-leak",
    c: "perf",
    t: "Highlighting a selected unit",
    tru: "Подсветка выбранного юнита",
    code: `void Highlight(Renderer r)
{
    r.material.color = Color.yellow;
}`,
    bug: [3],
    a: "Reading `.material` clones the material for this renderer — a new instance per highlighted unit, which leaks (nothing destroys it) and breaks batching for every one of them.",
    aru: "Чтение `.material` клонирует материал для этого рендерера — по экземпляру на каждого подсвеченного юнита; они утекают (их никто не уничтожает) и ломают батчинг.",
    fix: "Use a MaterialPropertyBlock (`r.SetPropertyBlock`) — no instance, no leak, batching preserved.",
    fixru: "Использовать MaterialPropertyBlock (`r.SetPropertyBlock`) — без экземпляра, без утечки, батчинг сохраняется.",
  },
  {
    id: "perf-debug-log-hot",
    c: "perf",
    t: "Tracing the AI decision",
    tru: "Трассировка решения ИИ",
    code: `void Update()
{
    Debug.Log("state " + state + " dist " + distance);
}`,
    bug: [3],
    a: "The string is built and the log is written every frame even in a release build: string concatenation garbage plus a stack trace capture per call, which is far more expensive than the log itself.",
    aru: "Строка собирается и лог пишется каждый кадр даже в релизной сборке: мусор от склейки строк плюс захват стектрейса на каждый вызов, что дороже самого логирования.",
    fix: "Guard it behind a `[Conditional(\"UNITY_EDITOR\")]` wrapper or a verbosity check, and disable stack traces for Log level.",
    fixru: "Обернуть в метод с `[Conditional(\"UNITY_EDITOR\")]` или проверкой уровня логирования и отключить стектрейсы для уровня Log.",
  },
  {
    id: "perf-animator-string",
    c: "perf",
    t: "Driving the animator",
    tru: "Управление аниматором",
    code: `void Update()
{
    animator.SetFloat("Speed", rb.linearVelocity.magnitude);
}`,
    bug: [3],
    a: "Every string overload hashes the name at call time; done per frame per character it is pure waste, and a typo in the name fails silently.",
    aru: "Строковая перегрузка каждый раз хэширует имя; на кадр на персонажа это чистые потери, а опечатка в имени не вызывает никакой ошибки.",
    fix: "Cache `Animator.StringToHash(\"Speed\")` in a static readonly int and pass the hash.",
    fixru: "Закэшировать `Animator.StringToHash(\"Speed\")` в static readonly int и передавать хэш.",
  },
  {
    id: "perf-empty-update",
    c: "perf",
    t: "A component that waits",
    tru: "Компонент, который ждёт",
    code: `public class Pickup : MonoBehaviour
{
    void Update()
    {
    }
}`,
    bug: [3],
    a: "An empty Update still costs a native→managed call per object per frame: a thousand pickups means a thousand interop calls for nothing.",
    aru: "Пустой Update всё равно стоит перехода native→managed на объект за кадр: тысяча подбираемых предметов — тысяча вызовов интеропа впустую.",
    fix: "Delete the method (Unity only registers it when it exists), or drive many objects from one manager's single Update.",
    fixru: "Удалить метод (Unity регистрирует его только при наличии) либо управлять множеством объектов из одного Update менеджера.",
  },
  {
    id: "perf-ui-text-every-frame",
    c: "perf",
    t: "Showing the score",
    tru: "Показ счёта",
    code: `void Update()
{
    scoreLabel.text = "Score: " + score;
}`,
    bug: [3],
    a: "Assigning text marks the canvas dirty and regenerates the text mesh every frame — plus a new string per frame — even when the score has not changed.",
    aru: "Присваивание text помечает канвас «грязным» и каждый кадр пересобирает меш текста — плюс новая строка каждый кадр — даже когда счёт не менялся.",
    fix: "Only write on change (`if (score == shown) return;`) and use SetText with a numeric overload to avoid the allocation.",
    fixru: "Писать только при изменении (`if (score == shown) return;`) и использовать SetText с числовой перегрузкой, чтобы не аллоцировать.",
  },
  {
    id: "perf-canvas-mixed",
    c: "perf",
    t: "One canvas for the whole HUD",
    tru: "Один канвас на весь HUD",
    code: `// Canvas "HUD"
//   ├ StaticBackground, Portrait, 40 static icons
//   └ HealthBar (changes every frame)`,
    bug: [3],
    a: "A canvas rebuilds its whole batch when any element inside it changes, so one per-frame health bar re-batches all forty static icons with it.",
    aru: "Канвас пересобирает весь свой батч при изменении любого элемента внутри, поэтому одна полоска здоровья, меняющаяся каждый кадр, тянет за собой перебатчивание всех сорока статичных иконок.",
    fix: "Split dynamic elements onto their own child canvas — rebuilds then stop at that sub-canvas boundary.",
    fixru: "Вынести динамические элементы на отдельный дочерний канвас — пересборка остановится на его границе.",
  },
  {
    id: "perf-transform-repeat",
    c: "perf",
    t: "Distance to every target",
    tru: "Дистанция до каждой цели",
    code: `for (int i = 0; i < targets.Count; i++)
{
    if (Vector3.Distance(transform.position, targets[i].position) < range)
        Consider(targets[i]);
}`,
    bug: [3],
    a: "transform.position is a property that crosses into native code, and it is read once per target; the value cannot change inside the loop, so every read after the first is waste.",
    aru: "transform.position — это свойство с переходом в нативный код, и оно читается на каждую цель; внутри цикла значение измениться не может, поэтому все чтения после первого — потери.",
    fix: "Hoist it: `var origin = transform.position;` before the loop.",
    fixru: "Вынести наружу: `var origin = transform.position;` перед циклом.",
  },
  {
    id: "perf-distance-sqrt",
    c: "perf",
    t: "Radius check in a big loop",
    tru: "Проверка радиуса в большом цикле",
    code: `bool InRange(Vector3 a, Vector3 b, float range)
{
    return Vector3.Distance(a, b) < range;
}`,
    bug: [3],
    a: "Distance takes a square root to answer a question that does not need one — across tens of thousands of checks per frame that root is measurable.",
    aru: "Distance извлекает квадратный корень ради вопроса, которому корень не нужен, — на десятках тысяч проверок за кадр это уже заметно.",
    fix: "Compare squared values: `(a - b).sqrMagnitude < range * range`.",
    fixru: "Сравнивать квадраты: `(a - b).sqrMagnitude < range * range`.",
  },
  {
    id: "perf-alloc-in-update",
    c: "perf",
    t: "Gathering nearby enemies",
    tru: "Сбор ближайших врагов",
    code: `void Update()
{
    var nearby = new List<Enemy>();
    foreach (var e in all) if (InRange(e)) nearby.Add(e);
    Target(nearby);
}`,
    bug: [3],
    a: "A fresh list (and its growth reallocations) every frame — sixty throwaway lists per second per agent, which is exactly the allocation pattern that produces periodic GC hitches.",
    aru: "Новый список (и его переаллокации при росте) каждый кадр — шестьдесят одноразовых списков в секунду на агента: ровно тот паттерн аллокаций, который даёт периодические подтормаживания от GC.",
    fix: "Keep one reusable list as a field and call Clear() at the top of the frame.",
    fixru: "Держать один переиспользуемый список в поле и вызывать Clear() в начале кадра.",
  },
  {
    id: "perf-linq-update",
    c: "perf",
    t: "Nearest target with LINQ",
    tru: "Ближайшая цель через LINQ",
    code: `void Update()
{
    var best = all.Where(e => e.Alive)
                  .OrderBy(e => (e.pos - pos).sqrMagnitude)
                  .FirstOrDefault();
}`,
    bug: [3, 4],
    a: "Each operator allocates an enumerator and a closure, and OrderBy sorts the whole sequence just to take one element — in a per-frame path this is both garbage and unnecessary work.",
    aru: "Каждый оператор выделяет энумератор и замыкание, а OrderBy сортирует всю последовательность ради одного элемента — в покадровом коде это и мусор, и лишняя работа.",
    fix: "One manual loop keeping the running minimum: no allocation, no sort.",
    fixru: "Один ручной цикл с текущим минимумом: без аллокаций и без сортировки.",
  },
  {
    id: "perf-resources-load",
    c: "perf",
    t: "Loading the hit effect",
    tru: "Загрузка эффекта попадания",
    code: `void OnHit()
{
    var fx = Resources.Load<GameObject>("FX/Hit");
    Instantiate(fx, point, Quaternion.identity);
}`,
    bug: [3],
    a: "Resources.Load hits the filesystem/bundle catalog on the first call and does a lookup on every later one — in a hit handler it happens during the busiest frames, and Resources is also the folder that bloats build size and startup.",
    aru: "Resources.Load при первом вызове идёт в файловую систему/каталог бандла, а при последующих делает поиск — в обработчике попадания это происходит в самые нагруженные кадры, да и сама папка Resources раздувает размер сборки и старт.",
    fix: "Reference the prefab through a serialized field (or Addressables) and preload it.",
    fixru: "Ссылаться на префаб через сериализованное поле (или Addressables) и загружать заранее.",
  },
  {
    id: "perf-playclipatpoint",
    c: "perf",
    t: "Playing the impact sound",
    tru: "Проигрывание звука удара",
    code: `void OnHit(Vector3 point)
{
    AudioSource.PlayClipAtPoint(clip, point);
}`,
    bug: [3],
    a: "PlayClipAtPoint creates a GameObject with an AudioSource per call and destroys it when the clip ends — an allocation and a destruction per bullet impact, with no way to stop or mix the sound.",
    aru: "PlayClipAtPoint на каждый вызов создаёт GameObject с AudioSource и уничтожает его по окончании клипа — аллокация и уничтожение на каждое попадание, и звук нельзя ни остановить, ни смикшировать.",
    fix: "Use a small pool of AudioSources (or one-shot sources on the emitter) routed through a mixer group.",
    fixru: "Использовать небольшой пул AudioSource (или one-shot на самом источнике), направленный в группу микшера.",
  },
  {
    id: "perf-children-per-frame",
    c: "perf",
    t: "Dimming every child sprite",
    tru: "Затемнение всех дочерних спрайтов",
    code: `void Update()
{
    foreach (var r in GetComponentsInChildren<SpriteRenderer>())
        r.color = tint;
}`,
    bug: [3],
    a: "GetComponentsInChildren allocates a new array *and* walks the hierarchy every frame; the deeper the prefab, the worse it scales.",
    aru: "GetComponentsInChildren каждый кадр и выделяет новый массив, *и* обходит иерархию; чем глубже префаб, тем хуже масштабируется.",
    fix: "Collect the renderers once in Awake into a field (or use the List overload with a reusable buffer).",
    fixru: "Собрать рендереры один раз в Awake в поле (или использовать перегрузку со списком и переиспользуемым буфером).",
  },
  {
    id: "perf-list-capacity",
    c: "perf",
    t: "Building the visibility buffer",
    tru: "Сборка буфера видимости",
    code: `var visible = new List<Renderer>();
for (int i = 0; i < 10000; i++)
    if (IsVisible(all[i])) visible.Add(all[i]);`,
    bug: [1],
    a: "A List starting at capacity 0 doubles as it grows: filling ten thousand entries means about fourteen reallocations and copies of the backing array.",
    aru: "Список с начальной ёмкостью 0 растёт удвоением: на десять тысяч элементов это около четырнадцати переаллокаций и копирований внутреннего массива.",
    fix: "Pre-size it: `new List<Renderer>(all.Length)`, or keep one buffer and Clear it.",
    fixru: "Задать размер заранее: `new List<Renderer>(all.Length)` — либо держать один буфер и очищать его.",
  },
  {
    id: "perf-getpixels",
    c: "perf",
    t: "Sampling the terrain mask",
    tru: "Чтение маски ландшафта",
    code: `Color SampleMask(Texture2D mask, int x, int y)
{
    return mask.GetPixels()[y * mask.width + x];
}`,
    bug: [3],
    a: "GetPixels copies the *entire* texture into a new managed array on every sample — a 2048² mask is 16 MB of garbage per call.",
    aru: "GetPixels на каждое чтение копирует *всю* текстуру в новый управляемый массив — маска 2048² даёт 16 МБ мусора за вызов.",
    fix: "Read one texel with GetPixel, or cache the array once (better: keep the mask as a NativeArray via GetRawTextureData).",
    fixru: "Читать один тексель через GetPixel либо закэшировать массив один раз (а лучше держать маску как NativeArray через GetRawTextureData).",
  },
  {
    id: "perf-closure-alloc",
    c: "perf",
    t: "Sorting hits every frame",
    tru: "Сортировка попаданий каждый кадр",
    code: `void Update()
{
    hits.Sort((a, b) => (a.pos - origin).sqrMagnitude
                        .CompareTo((b.pos - origin).sqrMagnitude));
}`,
    bug: [3],
    a: "The lambda captures `origin`, so a closure object and a Comparison delegate are allocated on every frame this runs.",
    aru: "Лямбда захватывает `origin`, поэтому на каждом кадре выделяются объект замыкания и делегат Comparison.",
    fix: "Use a cached IComparer struct that carries the origin as a field, so the comparison allocates nothing.",
    fixru: "Использовать закэшированный IComparer-структуру, хранящую origin полем, — тогда сравнение ничего не выделяет.",
  },
];
