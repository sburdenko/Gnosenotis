/**
 * Searching & ordering patterns — how to find or rank without scanning
 * everything, or without sorting everything.
 */
import type { AlgoPattern } from "@/types/content";

export const searchPatterns: AlgoPattern[] = [
  {
    id: "binary-search",
    n: "Binary search",
    nru: "Бинарный поиск",
    idea: "Maintain a half-open range [lo, hi) that is guaranteed to contain the answer, and halve it every step by testing the midpoint.",
    idearu:
      "Держать полуоткрытый диапазон [lo, hi), в котором гарантированно лежит ответ, и на каждом шаге делить его пополам, проверяя середину.",
    when: [
      "The data is sorted, or sorted in pieces (a rotated array)",
      "You need O(log n) lookup, insertion point, or first/last index of a value",
      "The required complexity in the statement is log-shaped",
    ],
    whenru: [
      "Данные отсортированы или отсортированы кусками (повёрнутый массив)",
      "Нужен поиск, точка вставки или первый/последний индекс значения за O(log n)",
      "В условии требуется логарифмическая сложность",
    ],
    cx: "O(log n) time / O(1) space",
    code: `// Lower bound: first index where a[i] >= target (== a.Length if none).
int lo = 0, hi = a.Length;          // half-open: hi is "one past"
while (lo < hi)
{
    int mid = lo + (hi - lo) / 2;   // never (lo + hi) / 2 — that overflows
    if (a[mid] < target) lo = mid + 1;
    else hi = mid;
}
return lo;

// Rotated array: exactly one half is always sorted — find it, then decide
// whether the target lies inside it.
if (a[lo] <= a[mid])
    hi = (a[lo] <= target && target < a[mid]) ? mid : hi;`,
    traps: [
      "`(lo + hi) / 2` overflows for large indices — always `lo + (hi - lo) / 2`",
      "Mixing the closed `hi = n - 1` and half-open `hi = n` templates in the same function; pick one and stay in it",
      "Infinite loop from `lo = mid` in a loop that can leave `mid == lo`",
    ],
    trapsru: [
      "`(lo + hi) / 2` переполняется на больших индексах — всегда `lo + (hi - lo) / 2`",
      "Смешивать закрытый `hi = n - 1` и полуоткрытый `hi = n` шаблоны в одной функции; выберите один",
      "Бесконечный цикл из-за `lo = mid`, когда `mid` может остаться равным `lo`",
    ],
  },
  {
    id: "binary-search-answer",
    n: "Binary search on the answer",
    nru: "Бинарный поиск по ответу",
    idea: 'When the answer is a number and "is X good enough?" is monotone — false, false, …, true, true — binary search the value itself and use a linear feasibility check as the predicate.',
    idearu:
      "Если ответ — число, а проверка «достаточно ли X?» монотонна (нет, нет, …, да, да), — бинарно ищите само значение, а предикатом ставьте линейную проверку выполнимости.",
    when: [
      '"Minimum largest…", "maximum minimum…", "smallest capacity/speed/time such that…"',
      "You can verify a candidate answer far more easily than construct the optimum",
      "The search space is a range of numbers, not an array",
    ],
    whenru: [
      "«Минимальный максимум…», «максимальный минимум…», «наименьшая скорость/вместимость/время, при которых…»",
      "Проверить кандидата гораздо проще, чем построить оптимум",
      "Пространство поиска — диапазон чисел, а не массив",
    ],
    cx: "O(check × log(range)) time",
    code: `bool CanDo(int candidate) { /* greedy or BFS/DFS feasibility pass */ }

int lo = MinPossible, hi = MaxPossible;   // answer is somewhere in [lo, hi]
while (lo < hi)
{
    int mid = lo + (hi - lo) / 2;
    if (CanDo(mid)) hi = mid;             // mid works — maybe smaller does too
    else lo = mid + 1;                    // mid fails — the answer is bigger
}
return lo;`,
    traps: [
      "Binary searching a predicate that is not actually monotone — say out loud why it is before writing code",
      "Bounds that exclude the answer: `hi` must be a value that certainly works",
      "Forgetting that the feasibility check runs log(range) times when you quote the complexity",
    ],
    trapsru: [
      "Бинарный поиск по немонотонному предикату — сначала вслух обоснуйте монотонность",
      "Границы, не включающие ответ: `hi` обязан быть заведомо рабочим значением",
      "Забыть, что проверка выполнимости запускается log(range) раз, когда называете сложность",
    ],
  },
  {
    id: "heap-topk",
    n: "Heap (top-K, k-way merge)",
    nru: "Куча (top-K, слияние k списков)",
    idea: "Keep only what you need ordered: a size-k heap of the best candidates, or a heap holding one head per source list.",
    idearu:
      "Держать упорядоченным только необходимое: кучу из k лучших кандидатов либо кучу из голов всех списков-источников.",
    when: [
      '"K largest / K closest / K most frequent" over a stream or a large array',
      "Merging several already-sorted sequences",
      "You repeatedly need the current minimum or maximum while inserting",
    ],
    whenru: [
      "«K наибольших / K ближайших / K самых частых» по потоку или большому массиву",
      "Слияние нескольких уже отсортированных последовательностей",
      "Нужно многократно брать текущий минимум/максимум, продолжая вставлять",
    ],
    cx: "O(n log k) for top-K / O(n log k) for a k-way merge of n items",
    code: `// Top-K largest: a MIN-heap of size k — the smallest of the winners is
// the one to evict, which is why the comparator is inverted from instinct.
var heap = new PriorityQueue<int, int>();
foreach (int x in values)
{
    heap.Enqueue(x, x);
    if (heap.Count > k) heap.Dequeue();
}

// K-way merge: seed with every list head, then pull-and-refill.
foreach (var list in lists)
    if (list != null) heap.Enqueue(list, list.Value);
while (heap.TryDequeue(out var node, out _))
{
    Append(node);
    if (node.Next != null) heap.Enqueue(node.Next, node.Next.Value);
}`,
    traps: [
      'Using a max-heap for "top K largest" and keeping all n elements — that is O(n log n), not O(n log k)',
      "Quoting O(n log n) for heapifying: building a heap from an array is O(n)",
      "Reaching for a heap when counting into buckets is O(n) — frequency problems with a bounded range often are",
    ],
    trapsru: [
      "Брать max-heap для «top K наибольших» и держать все n элементов — это O(n log n), а не O(n log k)",
      "Называть O(n log n) для построения кучи: heapify из массива — это O(n)",
      "Тянуться к куче там, где подсчёт по корзинам даёт O(n) — задачи о частотах с ограниченным диапазоном часто такие",
    ],
  },
  {
    id: "quickselect",
    n: "Quickselect",
    nru: "Quickselect",
    idea: "Partition around a pivot like quicksort, but recurse into only the side that contains the k-th position — the other half is never sorted at all.",
    idearu:
      "Разбить относительно опорного элемента, как в quicksort, но рекурсивно идти только в ту половину, где лежит k-я позиция, — вторая не сортируется вовсе.",
    when: [
      "You need the k-th element (or the top k unordered), not a full ordering",
      "Average O(n) matters and you can accept an O(n²) worst case",
      "Median-of-something questions",
    ],
    whenru: [
      "Нужен k-й элемент (или top-k без порядка), а не полная сортировка",
      "Важно среднее O(n), и допустим худший случай O(n²)",
      "Задачи про медиану",
    ],
    cx: "O(n) average / O(n²) worst / O(1) extra space",
    code: `int Select(int[] a, int lo, int hi, int k)   // k is an index into a
{
    while (true)
    {
        int p = Partition(a, lo, hi);            // random pivot, please
        if (p == k) return a[p];
        if (p < k) lo = p + 1;
        else hi = p - 1;
    }
}`,
    traps: [
      "A fixed (first or last) pivot on sorted input degrades to O(n²) — randomise it and say so",
      'Confusing "k-th largest" with index k: it is index `n - k` in ascending order',
      "Claiming a guaranteed O(n) without mentioning median-of-medians",
    ],
    trapsru: [
      "Фиксированный опорный (первый или последний) на отсортированном входе даёт O(n²) — рандомизируйте и скажите об этом",
      "Путать «k-й по величине» с индексом k: это индекс `n - k` в порядке возрастания",
      "Заявлять гарантированное O(n), не упомянув median-of-medians",
    ],
  },
  {
    id: "monotonic",
    n: "Monotonic stack / deque",
    nru: "Монотонный стек и дек",
    idea: "Keep a stack or deque whose values are always increasing (or always decreasing) by popping everything a new element dominates — what survives is exactly the useful history.",
    idearu:
      "Держать стек или дек, значения в котором всегда возрастают (или всегда убывают), выталкивая всё, что новый элемент перекрывает, — остаётся ровно полезная история.",
    when: [
      '"Next greater / previous smaller element"',
      "Maximum or minimum of a sliding window, in O(1) amortised",
      'Histogram, skyline, rain-trapping and other "bounded by both sides" shapes',
    ],
    whenru: [
      "«Следующий больший / предыдущий меньший элемент»",
      "Максимум или минимум скользящего окна за амортизированное O(1)",
      "Гистограммы, скайлайн, сбор дождевой воды и прочие «ограничено с обеих сторон» задачи",
    ],
    cx: "O(n) time — each index is pushed and popped at most once",
    code: `// Window maximum: the deque holds INDICES, values decreasing front to back.
var dq = new LinkedList<int>();
for (int i = 0; i < a.Length; i++)
{
    if (dq.Count > 0 && dq.First.Value <= i - k) dq.RemoveFirst();  // slid out
    while (dq.Count > 0 && a[dq.Last.Value] <= a[i]) dq.RemoveLast(); // dominated
    dq.AddLast(i);
    if (i >= k - 1) result[i - k + 1] = a[dq.First.Value];
}`,
    traps: [
      "Storing values instead of indices, so you cannot tell when the front has slid out of the window",
      "Getting `<` vs `<=` wrong on the pop test — it decides how duplicates are handled",
      "Recording the answer before the window is full (`i >= k - 1`)",
    ],
    trapsru: [
      "Хранить значения вместо индексов — тогда не понять, когда голова вышла из окна",
      "Перепутать `<` и `<=` в условии выталкивания — от этого зависит обработка дубликатов",
      "Записывать ответ до того, как окно заполнилось (`i >= k - 1`)",
    ],
  },
  {
    id: "greedy",
    n: "Greedy",
    nru: "Жадный алгоритм",
    idea: "Commit to the locally best choice and never reconsider — valid only when you can argue that some optimal solution agrees with that choice (an exchange argument).",
    idearu:
      "Брать локально лучший вариант и не пересматривать решение — корректно только если можно доказать, что какой-то оптимум согласуется с этим выбором (аргумент обмена).",
    when: [
      "Scheduling by earliest end time, coin systems that are canonical, reachability",
      "The DP solution exists but the state collapses to a single running value",
      "You can state the exchange argument in one sentence — if you cannot, use DP",
    ],
    whenru: [
      "Планирование по раннему концу, канонические системы монет, достижимость",
      "DP-решение существует, но состояние схлопывается в одно бегущее значение",
      "Аргумент обмена формулируется одним предложением — если нет, берите DP",
    ],
    cx: "Usually O(n) after an O(n log n) sort",
    code: `// Reachability: track the furthest index reachable so far.
int reach = 0;
for (int i = 0; i < a.Length; i++)
{
    if (i > reach) return false;              // a gap we can never cross
    reach = Math.Max(reach, i + a[i]);
}
return true;

// Kadane: reset whenever the accumulated prefix stops helping.
int best = a[0], current = a[0];
for (int i = 1; i < a.Length; i++)
{
    current = Math.Max(a[i], current + a[i]);
    best = Math.Max(best, current);
}`,
    traps: [
      'Pattern-matching "greedy" without a correctness argument — this is where most live failures happen',
      "Kadane initialised to 0 instead of `a[0]`, which returns 0 for an all-negative array",
      "Greedy on a non-canonical coin system (coins 1, 3, 4 and target 6) — that needs DP",
    ],
    trapsru: [
      "Угадать «жадность» без доказательства корректности — здесь чаще всего сыплются вживую",
      "Кадане с инициализацией нулём вместо `a[0]` — на полностью отрицательном массиве вернёт 0",
      "Жадность на неканонической системе монет (1, 3, 4 и цель 6) — тут нужен DP",
    ],
  },
];
