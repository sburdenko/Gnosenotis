/**
 * Async and threading bugs: the ones that pass every test on a fast local
 * machine and only appear on a slow network, a second thread, or a scene
 * unloaded mid-await.
 */
import type { BugHuntItem } from "@/types/content";

export const asyncBugs: BugHuntItem[] = [
  {
    id: "a-async-void",
    c: "async",
    t: "Saving from a button",
    tru: "Сохранение по кнопке",
    code: `public async void OnSaveClicked()
{
    await SaveAsync();
    ShowToast("Saved");
}`,
    bug: [1],
    a: "An async void method cannot be awaited and its exception is thrown on the synchronization context instead of being returned — a failed save crashes somewhere unrelated, or vanishes.",
    aru: "Метод async void нельзя дождаться, а его исключение выбрасывается в контексте синхронизации, а не возвращается — упавшее сохранение уронит что-то постороннее или исчезнет бесследно.",
    fix: "Return async Task and await it from a handler that try/catches, keeping async void only where an event signature forces it (and then wrap the whole body in try/catch).",
    fixru: "Возвращать async Task и дожидаться его в обработчике с try/catch, оставляя async void только там, где этого требует сигнатура события (и тогда оборачивать всё тело в try/catch).",
  },
  {
    id: "a-result-deadlock",
    c: "async",
    t: "Getting the config synchronously",
    tru: "Синхронное получение конфига",
    code: `Config Load()
{
    return FetchAsync().Result;
}`,
    bug: [3],
    a: "Blocking on .Result freezes the calling thread until the task completes — on Unity's main thread that is a frozen game, and with a continuation that needs the main thread it is a permanent deadlock.",
    aru: "Блокировка на .Result замораживает вызывающий поток до завершения задачи — на главном потоке Unity это зависшая игра, а если продолжению нужен главный поток, то и вечный дедлок.",
    fix: "Make the caller async all the way up and `await FetchAsync()`.",
    fixru: "Сделать вызывающий код асинхронным доверху и писать `await FetchAsync()`.",
  },
  {
    id: "a-unity-api-off-thread",
    c: "async",
    t: "Parsing on a worker thread",
    tru: "Парсинг в рабочем потоке",
    code: `async Task Apply(string json)
{
    await Task.Run(() =>
    {
        var data = JsonUtility.FromJson<LevelData>(json);
        transform.position = data.spawn;
    });
}`,
    bug: [6],
    a: "Almost all of the Unity API is main-thread only: touching transform from a thread pool thread throws (or, worse, corrupts state in a build).",
    aru: "Почти весь Unity API доступен только с главного потока: обращение к transform из потока пула бросает исключение (а в билде может и испортить состояние).",
    fix: "Do the pure computation in Task.Run, return the result, and apply it after the await — back on the main thread.",
    fixru: "В Task.Run оставить только чистые вычисления, вернуть результат и применить его после await — уже на главном потоке.",
  },
  {
    id: "a-fire-and-forget",
    c: "async",
    t: "Kicking off analytics",
    tru: "Запуск отправки аналитики",
    code: `void OnLevelComplete()
{
    _ = SendStatsAsync();
    LoadNextLevel();
}`,
    bug: [3],
    a: "Discarding the task discards its failures too: a network exception becomes an unobserved task exception that no log line and no crash reporter will attribute to this call.",
    aru: "Отбрасывая задачу, вы отбрасываете и её ошибки: сетевое исключение превращается в необработанное исключение задачи, которое ни лог, ни крэш-репортер не свяжут с этим вызовом.",
    fix: "Await it, or keep the fire-and-forget but attach the handling: `SendStatsAsync().ContinueWith(t => Debug.LogException(t.Exception), TaskContinuationOptions.OnlyOnFaulted)`.",
    fixru: "Либо дождаться, либо оставить «выстрелил и забыл», но повесить обработку: `SendStatsAsync().ContinueWith(t => Debug.LogException(t.Exception), TaskContinuationOptions.OnlyOnFaulted)`.",
  },
  {
    id: "a-token-never-passed",
    c: "async",
    t: "A cancellable download",
    tru: "Отменяемая загрузка",
    code: `async Task Download(CancellationToken token)
{
    var bytes = await client.GetByteArrayAsync(url);
    await File.WriteAllBytesAsync(path, bytes);
}`,
    bug: [3, 4],
    a: "The token is accepted and never used, so cancelling changes nothing: the download runs to completion and still writes the file after the player left the screen.",
    aru: "Токен принят, но не используется, поэтому отмена ни на что не влияет: загрузка доходит до конца и файл пишется даже после того, как игрок ушёл с экрана.",
    fix: "Pass it into every awaited call that accepts one, and check `token.ThrowIfCancellationRequested()` between stages.",
    fixru: "Передавать его во все вызовы, которые его принимают, и между этапами проверять `token.ThrowIfCancellationRequested()`.",
  },
  {
    id: "a-use-after-destroy",
    c: "async",
    t: "Showing the loaded name",
    tru: "Показ загруженного имени",
    code: `async Task Refresh()
{
    var profile = await Api.GetProfileAsync();
    nameLabel.text = profile.Name;
}`,
    bug: [4],
    a: "Nothing guarantees this component still exists after the await: if the scene changed meanwhile, nameLabel is a destroyed object and the assignment throws a MissingReferenceException.",
    aru: "Ничто не гарантирует, что компонент ещё существует после await: если сцена за это время сменилась, nameLabel уничтожен и присваивание бросит MissingReferenceException.",
    fix: "Await with `destroyCancellationToken`, or check `if (this == null) return;` right after every await that crosses a frame.",
    fixru: "Ждать с `destroyCancellationToken` либо сразу после каждого await, пересекающего кадр, проверять `if (this == null) return;`.",
  },
  {
    id: "a-thread-sleep-in-async",
    c: "async",
    t: "Backing off before a retry",
    tru: "Пауза перед повтором",
    code: `async Task Retry()
{
    Thread.Sleep(1000);
    await SendAsync();
}`,
    bug: [3],
    a: "Thread.Sleep blocks the thread rather than yielding it — on the main thread the whole game stalls for a second, and on a pool thread it burns a worker.",
    aru: "Thread.Sleep блокирует поток вместо того, чтобы его освободить: на главном потоке на секунду встаёт вся игра, а в пуле сжигается рабочий поток.",
    fix: "`await Task.Delay(1000, token);`.",
    fixru: "`await Task.Delay(1000, token);`.",
  },
  {
    id: "a-delay-without-token",
    c: "async",
    t: "Polling the match status",
    tru: "Опрос статуса матча",
    code: `async Task Poll(CancellationToken token)
{
    while (!token.IsCancellationRequested)
    {
        await Query(token);
        await Task.Delay(5000);
    }
}`,
    bug: [6],
    a: "Cancellation is only observed between iterations: a cancel during the delay still waits out the full five seconds before the loop notices.",
    aru: "Отмена замечается только между итерациями: отмена во время задержки всё равно ждёт полные пять секунд, прежде чем цикл это увидит.",
    fix: "`await Task.Delay(5000, token);` — the delay then throws immediately on cancellation.",
    fixru: "`await Task.Delay(5000, token);` — тогда задержка немедленно прерывается при отмене.",
  },
  {
    id: "a-semaphore-sync-wait",
    c: "async",
    t: "Serializing save writes",
    tru: "Упорядочивание записей сохранения",
    code: `async Task SaveAsync(string json)
{
    gate.Wait();
    await File.WriteAllTextAsync(path, json);
    gate.Release();
}`,
    bug: [3],
    a: "The synchronous Wait blocks the thread while holding the slot — combined with the await inside, it is the classic way to deadlock a single-threaded context.",
    aru: "Синхронный Wait блокирует поток, удерживая слот, — вместе с await внутри это классический способ получить дедлок в однопоточном контексте.",
    fix: "`await gate.WaitAsync(token);`.",
    fixru: "`await gate.WaitAsync(token);`.",
  },
  {
    id: "a-semaphore-no-finally",
    c: "async",
    t: "Releasing the lock",
    tru: "Освобождение блокировки",
    code: `async Task WriteAsync(byte[] data)
{
    await gate.WaitAsync();
    await stream.WriteAsync(data);
    gate.Release();
}`,
    bug: [5],
    a: "If WriteAsync throws, Release never runs: the semaphore stays taken and every later writer waits forever.",
    aru: "Если WriteAsync бросит исключение, Release не выполнится: семафор останется занятым, и все последующие писатели будут ждать вечно.",
    fix: "Wrap the body in try/finally and release in the finally block.",
    fixru: "Обернуть тело в try/finally и освобождать в блоке finally.",
  },
  {
    id: "a-lazy-init-race",
    c: "async",
    t: "Lazily creating the pool",
    tru: "Ленивое создание пула",
    code: `Pool Get()
{
    if (pool == null)
        pool = new Pool(size);
    return pool;
}`,
    bug: [3, 4],
    a: "Two threads can both see null and both construct a pool — one of them is silently thrown away, along with everything already registered in it.",
    aru: "Два потока могут одновременно увидеть null и создать по пулу — один из них молча выбрасывается вместе со всем, что уже успели в нём зарегистрировать.",
    fix: "Create it eagerly on the main thread, or use `Lazy<Pool>` / a lock if it genuinely must be lazy and shared.",
    fixru: "Создавать заранее на главном потоке либо использовать `Lazy<Pool>` или lock, если объект и правда должен быть ленивым и общим.",
  },
  {
    id: "a-list-from-threads",
    c: "async",
    t: "Collecting results in parallel",
    tru: "Сбор результатов параллельно",
    code: `var results = new List<int>();
Parallel.For(0, items.Length, i =>
{
    results.Add(Process(items[i]));
});`,
    bug: [4],
    a: "List<T> is not thread-safe: concurrent Adds corrupt its internal array — you get lost items, duplicated slots, or an IndexOutOfRangeException from inside Add.",
    aru: "List<T> не потокобезопасен: одновременные Add портят внутренний массив — элементы теряются, дублируются, либо из самого Add вылетает IndexOutOfRangeException.",
    fix: "Write into a pre-sized array by index, or collect into a ConcurrentBag and order afterwards.",
    fixru: "Писать по индексу в заранее выделенный массив либо собирать в ConcurrentBag и упорядочивать потом.",
  },
  {
    id: "a-interlocked-missing",
    c: "async",
    t: "Counting finished jobs",
    tru: "Подсчёт завершённых задач",
    code: `void OnJobDone()
{
    completed++;
    if (completed == total) Finish();
}`,
    bug: [3],
    a: "`++` on a shared field is read-modify-write, not atomic: two threads finishing at once can both read the same value, so the counter never reaches total and Finish never fires.",
    aru: "`++` над общим полем — это чтение-изменение-запись, а не атомарная операция: два потока, завершившиеся одновременно, прочитают одно значение, счётчик не дойдёт до total, и Finish не вызовется.",
    fix: "`if (Interlocked.Increment(ref completed) == total) Finish();`.",
    fixru: "`if (Interlocked.Increment(ref completed) == total) Finish();`.",
  },
  {
    id: "a-non-volatile-flag",
    c: "async",
    t: "Stopping a worker loop",
    tru: "Остановка рабочего цикла",
    code: `private bool stop;

void Worker()
{
    while (!stop) { Step(); }
}`,
    bug: [5],
    a: "A plain field read in a tight loop can be hoisted into a register by the JIT, so the worker never observes the write made by another thread and spins forever.",
    aru: "Обычное поле, читаемое в плотном цикле, JIT может держать в регистре, поэтому рабочий поток не увидит запись из другого потока и будет крутиться вечно.",
    fix: "Use a CancellationToken (the idiomatic answer), or mark the field volatile if a raw flag is truly all you need.",
    fixru: "Использовать CancellationToken (идиоматичный вариант) либо пометить поле volatile, если действительно нужен именно флаг.",
  },
  {
    id: "a-sequential-awaits",
    c: "async",
    t: "Fetching three catalogs",
    tru: "Загрузка трёх каталогов",
    code: `async Task Warm()
{
    var a = await Fetch("weapons");
    var b = await Fetch("armor");
    var c = await Fetch("skins");
}`,
    bug: [3, 4, 5],
    a: "Three independent requests are awaited one after another, so the loading screen takes the sum of the round-trips instead of the longest one.",
    aru: "Три независимых запроса ждутся по очереди, поэтому экран загрузки длится столько, сколько сумма запросов, а не самый долгий из них.",
    fix: "Start them all, then await together: `await Task.WhenAll(ta, tb, tc);`.",
    fixru: "Запустить все, а затем дождаться вместе: `await Task.WhenAll(ta, tb, tc);`.",
  },
  {
    id: "a-missing-await",
    c: "async",
    t: "Writing before reading back",
    tru: "Запись перед повторным чтением",
    code: `async Task Persist(SaveData data)
{
    WriteAsync(data);
    var check = await ReadAsync();
}`,
    bug: [3],
    a: "The write is started and not awaited, so the read races it — sometimes the file is complete, sometimes half-written, and the failure only shows up on slow storage.",
    aru: "Запись запущена, но не дождана, поэтому чтение гонится с ней: иногда файл целый, иногда записан наполовину, и проблема проявляется только на медленном хранилище.",
    fix: "`await WriteAsync(data);` — and enable the compiler warning for unawaited tasks so this is caught at build time.",
    fixru: "`await WriteAsync(data);` — и включить предупреждение компилятора о недожданных задачах, чтобы ловить это на сборке.",
  },
  {
    id: "a-httpclient-per-call",
    c: "async",
    t: "Calling the leaderboard API",
    tru: "Запрос к API таблицы лидеров",
    code: `async Task<string> GetBoard()
{
    using var client = new HttpClient();
    return await client.GetStringAsync(url);
}`,
    bug: [3],
    a: "A new HttpClient per call opens a new connection each time and leaves the socket in TIME_WAIT after disposal — under load the process runs out of sockets.",
    aru: "Новый HttpClient на каждый вызов открывает новое соединение, а после Dispose сокет остаётся в TIME_WAIT — под нагрузкой сокеты в процессе заканчиваются.",
    fix: "Share one long-lived HttpClient (or an IHttpClientFactory) for the lifetime of the app.",
    fixru: "Держать один долгоживущий HttpClient (или IHttpClientFactory) на всё время жизни приложения.",
  },
  {
    id: "a-webrequest-not-disposed",
    c: "async",
    t: "Downloading a texture",
    tru: "Загрузка текстуры",
    code: `async Task<Texture2D> Load(string url)
{
    var req = UnityWebRequestTexture.GetTexture(url);
    await req.SendWebRequest();
    return DownloadHandlerTexture.GetContent(req);
}`,
    bug: [3],
    a: "UnityWebRequest owns native buffers that the GC does not account for: without disposal the download handler's memory leaks outside the managed heap, which is where mobile OOM crashes come from.",
    aru: "UnityWebRequest владеет нативными буферами, которых не видит GC: без освобождения память обработчика течёт вне управляемой кучи — именно отсюда берутся OOM-краши на мобилках.",
    fix: "`using var req = ...;` so the native memory is released even when the request fails.",
    fixru: "`using var req = ...;`, чтобы нативная память освобождалась даже при неудачном запросе.",
  },
  {
    id: "a-progress-from-thread",
    c: "async",
    t: "Reporting load progress",
    tru: "Отчёт о прогрессе загрузки",
    code: `void Start(IProgress<float> _)
{
    Task.Run(() =>
    {
        for (int i = 0; i < 100; i++)
            bar.fillAmount = i / 100f;
    });
}`,
    bug: [6],
    a: "The UI is written from a pool thread — a Unity API call off the main thread, and a data race with the renderer at the same time.",
    aru: "UI пишется из потока пула — это и вызов Unity API вне главного потока, и одновременно гонка с рендером.",
    fix: "Report through `IProgress<float>` created on the main thread (Progress<T> captures the sync context) and update the bar in its callback.",
    fixru: "Сообщать прогресс через `IProgress<float>`, созданный на главном потоке (Progress<T> захватывает контекст синхронизации), и обновлять полоску в его колбэке.",
  },
  {
    id: "a-configureawait-false",
    c: "async",
    t: "Avoiding a context capture",
    tru: "Отказ от захвата контекста",
    code: `async Task Show()
{
    var text = await Api.GetTextAsync().ConfigureAwait(false);
    label.text = text;
}`,
    bug: [3, 4],
    a: "ConfigureAwait(false) explicitly drops the main-thread context, so the continuation runs on a pool thread — and the very next line touches a Unity object from it.",
    aru: "ConfigureAwait(false) явно отбрасывает контекст главного потока, поэтому продолжение выполняется в пуле — и следующая же строка трогает оттуда объект Unity.",
    fix: "Leave the capture on in code that touches the engine; use ConfigureAwait(false) only in pure library layers that never call Unity.",
    fixru: "Оставлять захват контекста в коде, который трогает движок; ConfigureAwait(false) — только в чистых библиотечных слоях, не вызывающих Unity.",
  },
];
