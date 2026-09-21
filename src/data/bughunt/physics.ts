/**
 * Physics, input and time bugs: the family where the code reads correctly and
 * the character still falls through the floor at 30 fps.
 */
import type { BugHuntItem } from "@/types/content";

export const physicsBugs: BugHuntItem[] = [
  {
    id: "p-rigidbody-transform-set",
    c: "physics",
    t: "Moving a physics body",
    tru: "Перемещение физического тела",
    code: `void FixedUpdate()
{
    transform.position += move * speed * Time.deltaTime;
}`,
    bug: [3],
    a: "Writing transform on a simulated Rigidbody teleports it: the solver never sees the motion, so collisions are missed, interpolation snaps, and velocity stays zero.",
    aru: "Запись в transform у симулируемого Rigidbody телепортирует его: решатель не видит движения, поэтому столкновения пропускаются, интерполяция дёргается, а скорость остаётся нулевой.",
    fix: "`rb.MovePosition(rb.position + move * speed * Time.fixedDeltaTime);`, or drive it with velocity/forces.",
    fixru: "`rb.MovePosition(rb.position + move * speed * Time.fixedDeltaTime);` либо управлять скоростью/силами.",
  },
  {
    id: "p-addforce-in-update",
    c: "physics",
    t: "Thrusting forward",
    tru: "Ускорение вперёд",
    code: `void Update()
{
    if (Input.GetKey(KeyCode.W))
        rb.AddForce(transform.forward * thrust);
}`,
    bug: [4],
    a: "Forces applied in Update are accumulated per rendered frame, not per physics step, so the ship accelerates faster on a 144 Hz monitor than on a 60 Hz one.",
    aru: "Силы, приложенные в Update, накапливаются по кадрам рендера, а не по шагам физики, поэтому на мониторе 144 Гц корабль разгоняется быстрее, чем на 60 Гц.",
    fix: "Read input in Update, store it, and apply the force in FixedUpdate.",
    fixru: "Читать ввод в Update, сохранять его и прикладывать силу в FixedUpdate.",
  },
  {
    id: "p-input-in-fixedupdate",
    c: "physics",
    t: "Jumping on a key press",
    tru: "Прыжок по нажатию",
    code: `void FixedUpdate()
{
    if (Input.GetKeyDown(KeyCode.Space))
        rb.AddForce(Vector3.up * jump, ForceMode.Impulse);
}`,
    bug: [3],
    a: "GetKeyDown is true for exactly one *frame*; FixedUpdate can run zero times in that frame, so jumps are silently dropped — and twice in another frame, so some jumps double up.",
    aru: "GetKeyDown истинен ровно один *кадр*; FixedUpdate в этом кадре может не выполниться ни разу — прыжок молча теряется, а в другом кадре выполниться дважды — прыжок удваивается.",
    fix: "Latch the press in Update (`jumpQueued = true`) and consume the flag in FixedUpdate.",
    fixru: "Запоминать нажатие в Update (`jumpQueued = true`) и разбирать флаг в FixedUpdate.",
  },
  {
    id: "p-trigger-no-rigidbody",
    c: "physics",
    t: "A pickup that never fires",
    tru: "Подбор, который не срабатывает",
    code: `// Pickup: BoxCollider (isTrigger = true), no Rigidbody
// Player: CapsuleCollider, no Rigidbody
void OnTriggerEnter(Collider other)
{
    Give(other);
}`,
    bug: [1, 2],
    a: "Trigger events need at least one Rigidbody in the pair: two static colliders never generate contacts, so this callback is dead code.",
    aru: "Для событий триггера нужен хотя бы один Rigidbody в паре: два статических коллайдера не порождают контактов, поэтому колбэк — мёртвый код.",
    fix: "Add a Rigidbody to the moving object (kinematic if it is driven by a CharacterController).",
    fixru: "Добавить Rigidbody движущемуся объекту (кинематический, если он управляется CharacterController).",
  },
  {
    id: "p-collision-by-name",
    c: "physics",
    t: "Identifying what was hit",
    tru: "Определение того, во что попали",
    code: `void OnCollisionEnter(Collision c)
{
    if (c.gameObject.name == "Enemy")
        Damage(c.gameObject);
}`,
    bug: [3],
    a: "Instantiated clones are named \"Enemy(Clone)\", renaming a prefab breaks the check silently, and name comparison allocates on every hit.",
    aru: "Созданные через Instantiate клоны называются «Enemy(Clone)», переименование префаба молча ломает проверку, а сравнение имён аллоцирует на каждом ударе.",
    fix: "Check for the component that defines the behaviour: `if (c.gameObject.TryGetComponent(out Health hp)) hp.Apply(...)`.",
    fixru: "Проверять компонент, определяющий поведение: `if (c.gameObject.TryGetComponent(out Health hp)) hp.Apply(...)`.",
  },
  {
    id: "p-raycast-hits-self",
    c: "physics",
    t: "Ground check under the feet",
    tru: "Проверка земли под ногами",
    code: `bool IsGrounded()
{
    return Physics.Raycast(transform.position, Vector3.down, 1.1f);
}`,
    bug: [3],
    a: "The ray starts inside the character's own collider, so it can report the player standing on himself — grounded stays true in mid-air.",
    aru: "Луч начинается внутри собственного коллайдера персонажа, поэтому он может «встать сам на себя» — grounded остаётся истинным в воздухе.",
    fix: "Start below the collider or pass a ground LayerMask (with `QueryTriggerInteraction.Ignore`) so only real ground answers.",
    fixru: "Начинать луч ниже коллайдера или передавать LayerMask земли (и `QueryTriggerInteraction.Ignore`), чтобы отвечала только настоящая земля.",
  },
  {
    id: "p-raycastall-alloc",
    c: "physics",
    t: "Scanning for targets every frame",
    tru: "Поиск целей каждый кадр",
    code: `void Update()
{
    var hits = Physics.SphereCastAll(transform.position, 5f, transform.forward);
    foreach (var h in hits) Consider(h);
}`,
    bug: [3],
    a: "The …All queries allocate a fresh array per call — sixty arrays a second per scanner, straight into the GC.",
    aru: "Запросы …All выделяют новый массив на каждый вызов — шестьдесят массивов в секунду на каждого сканирующего, прямиком в GC.",
    fix: "Use the NonAlloc variant with a reusable buffer: `Physics.SphereCastNonAlloc(..., buffer, ...)`.",
    fixru: "Использовать NonAlloc-вариант с переиспользуемым буфером: `Physics.SphereCastNonAlloc(..., buffer, ...)`.",
  },
  {
    id: "p-normalize-zero",
    c: "physics",
    t: "Facing the current target",
    tru: "Разворот к текущей цели",
    code: `void FaceTarget(Vector3 target)
{
    Vector3 dir = (target - transform.position).normalized;
    transform.rotation = Quaternion.LookRotation(dir);
}`,
    bug: [3, 4],
    a: "When the target coincides with the position the direction is zero: normalized returns zero and LookRotation logs an error and leaves the rotation untouched (or produces NaN through other math).",
    aru: "Когда цель совпадает с позицией, направление нулевое: normalized возвращает ноль, а LookRotation пишет ошибку и оставляет поворот как есть (в иной арифметике — даёт NaN).",
    fix: "Guard the degenerate case: `if (dir.sqrMagnitude < 1e-6f) return;` before rotating.",
    fixru: "Отсечь вырожденный случай: перед поворотом `if (dir.sqrMagnitude < 1e-6f) return;`.",
  },
  {
    id: "p-velocity-clobber",
    c: "physics",
    t: "Steering with velocity",
    tru: "Управление через скорость",
    code: `void FixedUpdate()
{
    rb.linearVelocity = new Vector3(input.x * speed, 0f, input.y * speed);
}`,
    bug: [3],
    a: "Assigning the whole vector overwrites the vertical component every step — gravity is cancelled, jumps die instantly, and the body floats.",
    aru: "Присваивание всего вектора каждый шаг затирает вертикальную составляющую: гравитация гасится, прыжок мгновенно умирает, тело парит.",
    fix: "Preserve it: `rb.linearVelocity = new Vector3(x, rb.linearVelocity.y, z);`.",
    fixru: "Сохранять её: `rb.linearVelocity = new Vector3(x, rb.linearVelocity.y, z);`.",
  },
  {
    id: "p-force-mode",
    c: "physics",
    t: "One-shot knockback",
    tru: "Одиночный отброс",
    code: `void Knockback(Vector3 dir)
{
    rb.AddForce(dir * 500f, ForceMode.Force);
}`,
    bug: [3],
    a: "ForceMode.Force means \"newtons applied continuously over this step\", so a single call gives a barely visible nudge scaled by fixedDeltaTime and mass.",
    aru: "ForceMode.Force означает «ньютоны, приложенные непрерывно за этот шаг», поэтому одиночный вызов даёт едва заметный толчок, поделённый на fixedDeltaTime и массу.",
    fix: "For an instant hit use ForceMode.Impulse (mass-scaled) or VelocityChange (mass-independent).",
    fixru: "Для мгновенного удара использовать ForceMode.Impulse (с учётом массы) или VelocityChange (без учёта массы).",
  },
  {
    id: "p-cc-double-move",
    c: "physics",
    t: "Gravity plus input",
    tru: "Гравитация плюс ввод",
    code: `void Update()
{
    controller.Move(input * speed * Time.deltaTime);
    controller.Move(Vector3.down * gravity * Time.deltaTime);
}`,
    bug: [3, 4],
    a: "Two Move calls per frame run two separate collide-and-slide passes: the second undoes the first on slopes and steps, producing stutter and lost ground contact.",
    aru: "Два вызова Move за кадр запускают два отдельных прохода collide-and-slide: на склонах и ступенях второй отменяет первый — отсюда дёрганье и потеря контакта с землёй.",
    fix: "Combine into one vector and call Move once per frame.",
    fixru: "Сложить в один вектор и вызывать Move один раз за кадр.",
  },
  {
    id: "p-kinematic-no-collision",
    c: "physics",
    t: "A moving platform that crushes",
    tru: "Движущаяся платформа, которая давит",
    code: `// Platform: Rigidbody isKinematic = true
// Crate:    Rigidbody isKinematic = true
void OnCollisionEnter(Collision c) => Crush(c);`,
    bug: [1, 2],
    a: "Two kinematic bodies never generate collision events against each other — PhysX only reports contacts when at least one body is dynamic.",
    aru: "Два кинематических тела не порождают событий столкновения друг с другом — PhysX сообщает о контактах, только если хотя бы одно тело динамическое.",
    fix: "Make the crate dynamic, or detect the overlap yourself with a trigger volume on the platform.",
    fixru: "Сделать ящик динамическим либо самим ловить перекрытие триггерным объёмом на платформе.",
  },
  {
    id: "p-timescale-ui",
    c: "physics",
    t: "Animating the pause menu",
    tru: "Анимация меню паузы",
    code: `void Update()
{
    panel.alpha += Time.deltaTime / fadeTime;
}`,
    bug: [3],
    a: "The pause menu is shown with Time.timeScale = 0, and deltaTime is scaled — so alpha never changes and the menu never fades in.",
    aru: "Меню паузы показывают при Time.timeScale = 0, а deltaTime масштабируется — поэтому alpha не меняется и меню не появляется.",
    fix: "Use Time.unscaledDeltaTime for anything that must animate while the game is paused.",
    fixru: "Для всего, что должно анимироваться на паузе, использовать Time.unscaledDeltaTime.",
  },
  {
    id: "p-framerate-lerp",
    c: "physics",
    t: "Smoothing the camera follow",
    tru: "Сглаживание следования камеры",
    code: `void LateUpdate()
{
    transform.position = Vector3.Lerp(transform.position, target.position, 0.1f);
}`,
    bug: [3],
    a: "A constant t per frame makes the smoothing frame-rate dependent: the camera lags twice as far behind at 30 fps as at 60, so feel changes with hardware.",
    aru: "Постоянный t на кадр делает сглаживание зависимым от частоты кадров: при 30 fps камера отстаёт вдвое сильнее, чем при 60, и ощущение меняется от железа.",
    fix: "Make it exponential in time: `t = 1f - Mathf.Exp(-rate * Time.deltaTime)`, or use SmoothDamp.",
    fixru: "Сделать зависимость экспоненциальной по времени: `t = 1f - Mathf.Exp(-rate * Time.deltaTime)` — или взять SmoothDamp.",
  },
  {
    id: "p-screentoworld-no-z",
    c: "physics",
    t: "Dragging a sprite with the mouse",
    tru: "Перетаскивание спрайта мышью",
    code: `void Update()
{
    transform.position = Camera.main.ScreenToWorldPoint(Input.mousePosition);
}`,
    bug: [3],
    a: "mousePosition has z = 0, and ScreenToWorldPoint treats z as the distance from the camera — so the point is on the camera plane and the object sticks to the lens.",
    aru: "У mousePosition z = 0, а ScreenToWorldPoint трактует z как расстояние от камеры — точка оказывается в плоскости камеры, и объект «прилипает к объективу».",
    fix: "Supply the depth: `new Vector3(Input.mousePosition.x, Input.mousePosition.y, distanceFromCamera)`.",
    fixru: "Задать глубину: `new Vector3(Input.mousePosition.x, Input.mousePosition.y, distanceFromCamera)`.",
  },
  {
    id: "p-click-through-ui",
    c: "physics",
    t: "Selecting a unit by click",
    tru: "Выбор юнита кликом",
    code: `void Update()
{
    if (!Input.GetMouseButtonDown(0)) return;
    var ray = Camera.main.ScreenPointToRay(Input.mousePosition);
    if (Physics.Raycast(ray, out var hit)) Select(hit.collider);
}`,
    bug: [5],
    a: "Nothing asks whether the click landed on the UI, so pressing a button in the HUD also selects whatever unit happens to be behind it.",
    aru: "Никто не спрашивает, попал ли клик в UI, поэтому нажатие кнопки в HUD заодно выбирает юнита, оказавшегося за ней.",
    fix: "Bail out first: `if (EventSystem.current.IsPointerOverGameObject()) return;`.",
    fixru: "Сначала выйти: `if (EventSystem.current.IsPointerOverGameObject()) return;`.",
  },
  {
    id: "p-tunneling",
    c: "physics",
    t: "A fast projectile",
    tru: "Быстрый снаряд",
    code: `// Bullet Rigidbody: collisionDetectionMode = Discrete
void Fire()
{
    rb.linearVelocity = transform.forward * 200f;
}`,
    bug: [1],
    a: "At 200 m/s a bullet travels 4 metres per physics step: with discrete detection it is simply teleported through any wall thinner than that.",
    aru: "При 200 м/с пуля пролетает 4 метра за шаг физики: при дискретном обнаружении она просто телепортируется сквозь любую стену тоньше этого.",
    fix: "Set collisionDetectionMode to ContinuousDynamic, or raycast along the travelled segment each step instead of relying on the body.",
    fixru: "Поставить collisionDetectionMode в ContinuousDynamic либо на каждом шаге делать рейкаст по пройденному отрезку вместо опоры на тело.",
  },
  {
    id: "p-triggerstay-damage",
    c: "physics",
    t: "Damage inside a lava pool",
    tru: "Урон внутри лавы",
    code: `void OnTriggerStay(Collider other)
{
    other.GetComponent<Health>().Take(10f);
}`,
    bug: [3],
    a: "OnTriggerStay runs once per physics step, so the damage rate is tied to the fixed timestep — change Fixed Timestep in project settings and the lava becomes twice as deadly.",
    aru: "OnTriggerStay вызывается раз за шаг физики, поэтому темп урона привязан к фиксированному шагу — поменяйте Fixed Timestep в настройках, и лава станет вдвое смертоноснее.",
    fix: "Scale by time: `Take(damagePerSecond * Time.fixedDeltaTime)` — and cache the Health component instead of fetching it per step.",
    fixru: "Масштабировать по времени: `Take(damagePerSecond * Time.fixedDeltaTime)` — и кэшировать компонент Health вместо поиска на каждом шаге.",
  },
  {
    id: "p-moveposition-in-update",
    c: "physics",
    t: "Kinematic elevator",
    tru: "Кинематический лифт",
    code: `void Update()
{
    rb.MovePosition(rb.position + Vector3.up * speed * Time.deltaTime);
}`,
    bug: [1],
    a: "MovePosition is interpolated by the physics step; calling it from Update means several calls per step (or none), so the platform jitters and riders slide off.",
    aru: "MovePosition интерполируется шагом физики; вызов из Update даёт несколько вызовов за шаг (или ни одного) — платформа дрожит, а пассажиры с неё соскальзывают.",
    fix: "Move it from FixedUpdate with Time.fixedDeltaTime.",
    fixru: "Двигать из FixedUpdate с Time.fixedDeltaTime.",
  },
  {
    id: "p-cooldown-time-time",
    c: "physics",
    t: "Weapon cooldown",
    tru: "Перезарядка оружия",
    code: `bool CanFire()
{
    return Time.time - lastShot > cooldown;
}`,
    bug: [3],
    a: "Time.time is scaled and resets between scene loads: pausing with timeScale = 0 freezes the cooldown, and a reload makes every weapon instantly ready — or never ready, if lastShot came from the previous scene.",
    aru: "Time.time масштабируется и обнуляется между загрузками сцен: пауза с timeScale = 0 замораживает перезарядку, а перезагрузка делает всё оружие мгновенно готовым — либо не готовым никогда, если lastShot остался из прошлой сцены.",
    fix: "Count down a per-weapon timer in Update, or use Time.unscaledTime deliberately and reset it on scene load.",
    fixru: "Вести обратный отсчёт собственным таймером в Update либо осознанно использовать Time.unscaledTime и сбрасывать его при загрузке сцены.",
  },
];
