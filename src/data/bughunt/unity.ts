/**
 * Engine-level bugs: lifecycle order, deferred destruction, serialization and
 * the Unity API calls whose signature reads one way and behaves another.
 */
import type { BugHuntItem } from "@/types/content";

export const unityBugs: BugHuntItem[] = [
  {
    id: "u-awake-order",
    c: "unity",
    t: "Reading a neighbour's field",
    tru: "Чтение поля соседнего компонента",
    code: `public class Weapon : MonoBehaviour
{
    void Awake()
    {
        var stats = GetComponent<Stats>();
        damage = stats.BaseDamage;
    }
}`,
    bug: [6],
    a: "Awake order between components is undefined, so Stats.Awake may not have filled BaseDamage yet — this works on one machine and reads 0 on another.",
    aru: "Порядок Awake между компонентами не определён, поэтому Stats.Awake мог ещё не заполнить BaseDamage — на одной машине работает, на другой читается 0.",
    fix: "Read other components' initialized data in Start (Awake initializes *self*, Start reads *others*), or make the dependency explicit with an Initialize call.",
    fixru: "Читать проинициализированные данные других компонентов в Start (Awake — про себя, Start — про других) либо сделать зависимость явной через Initialize.",
  },
  {
    id: "u-destroy-is-deferred",
    c: "unity",
    t: "Cleaning up the old prop",
    tru: "Уборка старого объекта",
    code: `void Replace(GameObject prop)
{
    Destroy(prop);
    if (prop == null)
        Spawn();
}`,
    bug: [4],
    a: "Destroy is deferred to the end of the frame, so the object is still alive on the next line — the check is false and Spawn never runs.",
    aru: "Destroy откладывается до конца кадра, поэтому на следующей строке объект ещё жив — условие ложно, и Spawn не вызывается.",
    fix: "Don't branch on post-Destroy state: clear your own reference and spawn unconditionally, or use DestroyImmediate only in editor code.",
    fixru: "Не ветвиться по состоянию после Destroy: обнулить свою ссылку и вызвать спавн безусловно, а DestroyImmediate использовать только в редакторном коде.",
  },
  {
    id: "u-tag-equality",
    c: "unity",
    t: "Is this the player?",
    tru: "Это игрок?",
    code: `void OnTriggerEnter(Collider other)
{
    if (other.gameObject.tag == "Palyer")
        Damage(other);
}`,
    bug: [3],
    a: "A misspelled tag compared with `==` just quietly returns false forever; CompareTag throws on a tag that does not exist in the project, turning the typo into an error you can see.",
    aru: "Опечатка в теге при сравнении через `==` просто навсегда возвращает false; CompareTag бросает исключение на несуществующий тег, превращая опечатку в заметную ошибку.",
    fix: "`if (other.CompareTag(\"Player\"))` — and better still, check for the component you actually need instead of a string.",
    fixru: "`if (other.CompareTag(\"Player\"))`, а ещё лучше — проверять нужный компонент вместо строки.",
  },
  {
    id: "u-children-inactive",
    c: "unity",
    t: "Collecting the HUD icons",
    tru: "Сбор иконок HUD",
    code: `void RefreshIcons()
{
    var icons = GetComponentsInChildren<Icon>();
    foreach (var icon in icons)
        icon.Redraw();
}`,
    bug: [3],
    a: "GetComponentsInChildren skips inactive objects by default, so every icon that is currently hidden never gets refreshed and shows stale data when it reappears.",
    aru: "GetComponentsInChildren по умолчанию пропускает неактивные объекты, поэтому скрытые сейчас иконки не обновятся и покажут старые данные, когда снова включатся.",
    fix: "Pass the flag explicitly: `GetComponentsInChildren<Icon>(includeInactive: true)` — and cache the array instead of rebuilding it.",
    fixru: "Передать флаг явно: `GetComponentsInChildren<Icon>(includeInactive: true)` — и закэшировать массив вместо пересборки.",
  },
  {
    id: "u-missing-serializefield",
    c: "unity",
    t: "A tunable private field",
    tru: "Настраиваемое приватное поле",
    code: `public class Spawner : MonoBehaviour
{
    private float interval = 2f;

    void Start() => InvokeRepeating(nameof(Spawn), 0f, interval);
}`,
    bug: [3],
    a: "A plain private field is not serialized: it never appears in the Inspector, and the value a designer sets in a prefab has nothing to bind to.",
    aru: "Обычное приватное поле не сериализуется: в инспекторе его нет, и значению, которое дизайнер выставляет в префабе, не к чему привязаться.",
    fix: "`[SerializeField] private float interval = 2f;` — keeps encapsulation and gets the Inspector field.",
    fixru: "`[SerializeField] private float interval = 2f;` — инкапсуляция сохраняется, поле в инспекторе появляется.",
  },
  {
    id: "u-static-not-serialized",
    c: "unity",
    t: "Shared spawn settings",
    tru: "Общие настройки спавна",
    code: `public class Config : MonoBehaviour
{
    [SerializeField] public static int MaxEnemies = 10;
}`,
    bug: [3],
    a: "Static fields are never serialized, so [SerializeField] does nothing here: the Inspector cannot show it, and the value in the prefab is ignored at runtime.",
    aru: "Статические поля не сериализуются, поэтому [SerializeField] здесь бесполезен: инспектор его не покажет, а значение из префаба в рантайме игнорируется.",
    fix: "Make it an instance field, or move shared settings into a ScriptableObject that is a real asset.",
    fixru: "Сделать поле экземплярным или вынести общие настройки в ScriptableObject — настоящий ассет.",
  },
  {
    id: "u-loadscene-same-frame",
    c: "unity",
    t: "Setting up the next level",
    tru: "Настройка следующего уровня",
    code: `void NextLevel()
{
    SceneManager.LoadScene("Level2");
    var spawn = GameObject.Find("PlayerSpawn");
    player.position = spawn.transform.position;
}`,
    bug: [4],
    a: "LoadScene only *schedules* the load — the new scene's objects do not exist until the next frame, so Find returns null and the next line throws.",
    aru: "LoadScene только *планирует* загрузку — объекты новой сцены появятся лишь в следующем кадре, поэтому Find вернёт null и следующая строка упадёт.",
    fix: "Do the placement from the sceneLoaded callback: `SceneManager.sceneLoaded += OnLoaded;`.",
    fixru: "Расставлять объекты в колбэке sceneLoaded: `SceneManager.sceneLoaded += OnLoaded;`.",
  },
  {
    id: "u-invoke-by-string",
    c: "unity",
    t: "Delaying a respawn",
    tru: "Отложенный респаун",
    code: `void Die()
{
    Invoke("Respawn", 3f);
}

void Respawn() { /* ... */ }`,
    bug: [3],
    a: "The method name is a string: renaming Respawn compiles fine and fails silently at runtime, and no \"find usages\" will ever point here.",
    aru: "Имя метода — строка: после переименования Respawn всё скомпилируется и молча сломается в рантайме, и «найти использования» сюда не приведёт.",
    fix: "At minimum `Invoke(nameof(Respawn), 3f)`; better, drive the delay from an explicit timer in Update so the flow is visible.",
    fixru: "Как минимум `Invoke(nameof(Respawn), 3f)`; лучше — вести задержку явным таймером в Update, чтобы поток управления был виден.",
  },
  {
    id: "u-random-range-off-by-one",
    c: "unity",
    t: "Picking a random loot entry",
    tru: "Выбор случайного лута",
    code: `Item PickLoot(List<Item> table)
{
    int i = Random.Range(0, table.Count - 1);
    return table[i];
}`,
    bug: [3],
    a: "The int overload's upper bound is exclusive, so subtracting one makes the last entry unreachable — the rarest item in the table never drops.",
    aru: "У целочисленной перегрузки верхняя граница не включается, поэтому минус один делает последний элемент недостижимым — самый редкий предмет не выпадает никогда.",
    fix: "`Random.Range(0, table.Count)` — and remember the float overload is inclusive on both ends, unlike this one.",
    fixru: "`Random.Range(0, table.Count)` — и помните, что у float-перегрузки, в отличие от этой, включены обе границы.",
  },
  {
    id: "u-scriptableobject-runtime-mutation",
    c: "unity",
    t: "Spending ammo from the weapon asset",
    tru: "Трата патронов из ассета оружия",
    code: `public class WeaponAsset : ScriptableObject
{
    public int ammo;

    public void Fire() => ammo--;
}`,
    bug: [5],
    a: "A ScriptableObject is a shared asset, not per-instance state: every weapon using it spends the same counter, and in the editor the change is written into the asset and survives exiting play mode.",
    aru: "ScriptableObject — общий ассет, а не состояние экземпляра: все использующие его оружия тратят один счётчик, а в редакторе изменение записывается в ассет и переживает выход из Play Mode.",
    fix: "Keep the asset read-only as configuration and hold mutable ammo in the runtime component (or a runtime copy via Instantiate).",
    fixru: "Оставить ассет неизменяемой конфигурацией, а изменяемые патроны держать в рантайм-компоненте (или в копии, созданной через Instantiate).",
  },
  {
    id: "u-onvalidate-heavy",
    c: "unity",
    t: "Keeping a preview in sync",
    tru: "Синхронизация превью",
    code: `void OnValidate()
{
    foreach (Transform child in transform)
        DestroyImmediate(child.gameObject);
    Rebuild();
}`,
    bug: [4],
    a: "OnValidate runs during serialization — destroying objects from it is not allowed, spams errors, and can corrupt the prefab being imported.",
    aru: "OnValidate вызывается во время сериализации — уничтожать объекты оттуда нельзя: сыплются ошибки, а импортируемый префаб может испортиться.",
    fix: "Defer the work: set a dirty flag in OnValidate and rebuild from `EditorApplication.delayCall` or an explicit Inspector button.",
    fixru: "Отложить работу: в OnValidate выставить флаг, а перестраивать из `EditorApplication.delayCall` или по явной кнопке в инспекторе.",
  },
  {
    id: "u-euler-accumulation",
    c: "unity",
    t: "Tilting the camera with the mouse",
    tru: "Наклон камеры мышью",
    code: `void Update()
{
    float dy = Input.GetAxis("Mouse Y");
    transform.eulerAngles += new Vector3(-dy, 0f, 0f);
}`,
    bug: [4],
    a: "eulerAngles is *derived* from the quaternion, so reading it back gives an equivalent-but-different triple; accumulating into it drifts, flips near ±90°, and cannot be clamped.",
    aru: "eulerAngles *выводится* из кватерниона, поэтому при чтении возвращается эквивалентная, но другая тройка; накопление в неё уплывает, переворачивается около ±90° и не поддаётся ограничению.",
    fix: "Keep pitch and yaw in your own float fields, clamp pitch, and assign `transform.localRotation = Quaternion.Euler(pitch, yaw, 0f)`.",
    fixru: "Держать pitch и yaw в собственных float-полях, ограничивать pitch и присваивать `transform.localRotation = Quaternion.Euler(pitch, yaw, 0f)`.",
  },
  {
    id: "u-quaternion-order",
    c: "unity",
    t: "Offsetting an aim rotation",
    tru: "Смещение поворота прицела",
    code: `void Aim(Quaternion look, Quaternion recoil)
{
    transform.rotation = look * Quaternion.Inverse(recoil);
    barrel.localRotation = Quaternion.Euler(0f, 0f, 10f) * barrel.localRotation;
}`,
    bug: [4],
    a: "Quaternion multiplication is not commutative: `offset * local` applies the offset in the parent's space, while `local * offset` applies it around the barrel's own axes. Only one of them is the intended roll.",
    aru: "Умножение кватернионов некоммутативно: `offset * local` применяет смещение в пространстве родителя, а `local * offset` — вокруг собственных осей ствола. Нужный наклон даёт только один из вариантов.",
    fix: "Decide the space explicitly: `barrel.localRotation *= Quaternion.Euler(0f, 0f, 10f)` for a local roll.",
    fixru: "Явно выбрать пространство: для локального наклона — `barrel.localRotation *= Quaternion.Euler(0f, 0f, 10f)`.",
  },
  {
    id: "u-missing-deltatime",
    c: "unity",
    t: "Sliding a platform",
    tru: "Движение платформы",
    code: `void Update()
{
    transform.position += Vector3.right * speed;
}`,
    bug: [3],
    a: "Movement per *frame* instead of per second: the platform crawls at 30 fps and doubles its speed at 60, so gameplay depends on the machine.",
    aru: "Движение за *кадр*, а не за секунду: при 30 fps платформа ползёт, при 60 — едет вдвое быстрее, и геймплей зависит от железа.",
    fix: "`transform.position += Vector3.right * speed * Time.deltaTime;`.",
    fixru: "`transform.position += Vector3.right * speed * Time.deltaTime;`.",
  },
  {
    id: "u-lerp-misuse",
    c: "unity",
    t: "Fading the volume in",
    tru: "Плавное нарастание громкости",
    code: `void Update()
{
    source.volume = Mathf.Lerp(0f, 1f, Time.time);
}`,
    bug: [3],
    a: "Lerp's t is a 0..1 fraction, not a clock: Time.time passes 1 a second after startup and the value is pinned at max forever after.",
    aru: "Параметр t у Lerp — доля 0..1, а не часы: Time.time проходит 1 через секунду после старта, и дальше значение навсегда упирается в максимум.",
    fix: "Track your own elapsed time and divide by the duration: `Mathf.Lerp(0f, 1f, elapsed / fadeSeconds)`.",
    fixru: "Вести собственное прошедшее время и делить на длительность: `Mathf.Lerp(0f, 1f, elapsed / fadeSeconds)`.",
  },
  {
    id: "u-playerprefs-trust",
    c: "unity",
    t: "Storing the coin balance",
    tru: "Хранение баланса монет",
    code: `void AddCoins(int amount)
{
    int coins = PlayerPrefs.GetInt("coins", 0);
    PlayerPrefs.SetInt("coins", coins + amount);
}`,
    bug: [4],
    a: "PlayerPrefs is a plain, player-editable file (registry on Windows, plist on iOS) — a soft currency kept there is editable in a text editor, and without a Save call it can be lost on a crash.",
    aru: "PlayerPrefs — обычный редактируемый игроком файл (реестр на Windows, plist на iOS): мягкая валюта там правится текстовым редактором, а без вызова Save может потеряться при краше.",
    fix: "Keep anything of value server-side (or at least signed), and call PlayerPrefs.Save() at safe points for the settings that do belong there.",
    fixru: "Всё ценное держать на сервере (или хотя бы подписывать), а для настроек, которым там место, вызывать PlayerPrefs.Save() в безопасные моменты.",
  },
  {
    id: "u-datapath-write",
    c: "unity",
    t: "Writing the save file",
    tru: "Запись файла сохранения",
    code: `void Save(string json)
{
    File.WriteAllText(Application.dataPath + "/save.json", json);
}`,
    bug: [3],
    a: "dataPath points inside the installed application — read-only on iOS/Android and inside the app bundle on macOS, so the write throws on the platforms that matter.",
    aru: "dataPath указывает внутрь установленного приложения — на iOS/Android он доступен только для чтения, а на macOS находится внутри бандла, поэтому запись падает как раз на нужных платформах.",
    fix: "Write to Application.persistentDataPath, and build the path with Path.Combine.",
    fixru: "Писать в Application.persistentDataPath, собирая путь через Path.Combine.",
  },
  {
    id: "u-singleton-duplicate",
    c: "unity",
    t: "A persistent audio manager",
    tru: "Постоянный аудио-менеджер",
    code: `public class Audio : MonoBehaviour
{
    public static Audio Instance;

    void Awake()
    {
        Instance = this;
        DontDestroyOnLoad(gameObject);
    }
}`,
    bug: [7],
    a: "Reloading a scene that contains this object creates a second copy: it overwrites Instance and survives too, so every reload adds one more manager.",
    aru: "Перезагрузка сцены с этим объектом создаёт вторую копию: она перезаписывает Instance и тоже переживает загрузку, поэтому каждый перезаход добавляет ещё один менеджер.",
    fix: "Guard first: `if (Instance != null && Instance != this) { Destroy(gameObject); return; }`.",
    fixru: "Сначала защита: `if (Instance != null && Instance != this) { Destroy(gameObject); return; }`.",
  },
  {
    id: "u-color-0-255",
    c: "unity",
    t: "Tinting the damage flash",
    tru: "Подсветка при получении урона",
    code: `void Flash(SpriteRenderer sr)
{
    sr.color = new Color(255f, 60f, 60f, 255f);
}`,
    bug: [3],
    a: "Color components are 0..1 floats, not bytes — everything above 1 clamps, so the sprite turns pure white instead of red.",
    aru: "Компоненты Color — это float 0..1, а не байты: всё выше 1 обрезается, и спрайт становится не красным, а белым.",
    fix: "Use `new Color32(255, 60, 60, 255)` or divide by 255f.",
    fixru: "Использовать `new Color32(255, 60, 60, 255)` или делить на 255f.",
  },
  {
    id: "u-layermask-index",
    c: "unity",
    t: "Raycasting against the ground layer",
    tru: "Рейкаст по слою земли",
    code: `bool Grounded(int groundLayer)
{
    return Physics.Raycast(transform.position, Vector3.down, 1.1f, groundLayer);
}`,
    bug: [3],
    a: "The parameter is a bit *mask*, not a layer index: passing layer 8 actually means the mask 0b1000, i.e. layers 3 only — the ray tests the wrong layers entirely.",
    aru: "Параметр — это битовая *маска*, а не индекс слоя: передав слой 8, вы на самом деле задаёте маску 0b1000, то есть только слой 3 — луч проверяет совсем не те слои.",
    fix: "Shift when building it: `1 << groundLayer`, or take a LayerMask field so the Inspector builds the mask for you.",
    fixru: "Сдвигать при построении: `1 << groundLayer` — или завести поле LayerMask, чтобы маску собирал инспектор.",
  },
];
