/**
 * Array & string patterns — the ones that turn an O(n²) first instinct into
 * a single pass.
 */
import type { AlgoPattern } from "@/types/content";

export const arrayPatterns: AlgoPattern[] = [
  {
    id: "two-pointers",
    n: "Two pointers",
    nru: "Два указателя",
    idea: "Walk one array with two indices instead of two nested loops — either from both ends towards the middle, or one slow and one fast index moving in the same direction.",
    idearu:
      "Идти по массиву двумя индексами вместо двух вложенных циклов — либо с двух концов навстречу, либо медленный и быстрый индекс в одну сторону.",
    when: [
      "The array is sorted (or you can afford to sort it) and you need a pair with some property",
      'You are asked to do something "in place" without extra allocation',
      "The obvious answer is a nested loop over the same array",
    ],
    whenru: [
      "Массив отсортирован (или его можно отсортировать) и нужна пара с каким-то свойством",
      "Просят сделать «на месте», без лишних аллокаций",
      "Очевидный ответ — вложенный цикл по тому же массиву",
    ],
    cx: "O(n) time / O(1) space",
    code: `// Opposite ends: converge while a condition tells you which side to move.
int lo = 0, hi = a.Length - 1;
while (lo < hi)
{
    int sum = a[lo] + a[hi];
    if (sum == target) return (lo, hi);
    if (sum < target) lo++;
    else hi--;
}

// Same direction ("read/write"): write compacts what read keeps.
int write = 0;
for (int read = 0; read < a.Length; read++)
    if (Keep(a[read])) a[write++] = a[read];
// a[0..write) is the compacted result; tail from write is garbage.`,
    traps: [
      "Using `lo <= hi` when the pair must be two distinct elements — that lets an element pair with itself",
      "Forgetting to clear or truncate the tail after in-place compaction",
      "Assuming the input is sorted when the problem never said so",
    ],
    trapsru: [
      "`lo <= hi` там, где нужны два различных элемента — элемент составит пару сам с собой",
      "Забыть очистить или обрезать хвост после уплотнения на месте",
      "Считать вход отсортированным, когда в условии этого нет",
    ],
  },
  {
    id: "sliding-window",
    n: "Sliding window",
    nru: "Скользящее окно",
    idea: "Keep a contiguous range [left, right] plus a running summary of what is inside it; extend right, and shrink left only while the window is invalid.",
    idearu:
      "Держать непрерывный отрезок [left, right] и сводку того, что внутри; двигать right вперёд, а left подтягивать, только пока окно некорректно.",
    when: [
      'The words "contiguous", "substring", "subarray" appear in the statement',
      "You need the longest/shortest/best range satisfying a condition",
      "A fixed window size k is given outright",
    ],
    whenru: [
      "В условии есть слова «непрерывный», «подстрока», «подмассив»",
      "Нужен самый длинный/короткий/лучший отрезок с каким-то условием",
      "Размер окна k задан прямо",
    ],
    cx: "O(n) time / O(k) space — each element enters and leaves the window once",
    code: `var count = new Dictionary<char, int>();
int left = 0, best = 0;

for (int right = 0; right < s.Length; right++)
{
    count.TryGetValue(s[right], out int seen);
    count[s[right]] = seen + 1;

    while (WindowIsInvalid(count))      // shrink, never reset
    {
        count[s[left]]--;
        if (count[s[left]] == 0) count.Remove(s[left]);
        left++;
    }

    best = Math.Max(best, right - left + 1);
}`,
    traps: [
      "Resetting `left = right` instead of shrinking — that breaks the O(n) amortisation and the answer",
      "Measuring the window before shrinking it back to a valid state",
      "Leaving zero-count keys in the map when the validity check counts distinct keys",
    ],
    trapsru: [
      "Сброс `left = right` вместо сжатия — ломает и O(n), и сам ответ",
      "Померить окно до того, как оно снова стало корректным",
      "Оставлять нулевые счётчики в словаре, когда проверка считает число различных ключей",
    ],
  },
  {
    id: "prefix-sum",
    n: "Prefix / suffix passes",
    nru: "Префиксные и суффиксные проходы",
    idea: "Precompute an aggregate over everything before index i (and, if needed, everything after it), so any range query becomes arithmetic on two stored values.",
    idearu:
      "Заранее посчитать агрегат по всему, что до индекса i (и, если нужно, по всему, что после), — тогда любой запрос по диапазону становится арифметикой над двумя числами.",
    when: [
      "Many range queries over data that does not change",
      '"…except self" or "…of every other element" phrasing',
      "You want an O(1) answer per query after O(n) setup",
    ],
    whenru: [
      "Много запросов по диапазонам над неизменяемыми данными",
      "Формулировки вида «кроме себя», «по всем остальным элементам»",
      "Нужен ответ за O(1) на запрос после O(n) подготовки",
    ],
    cx: "O(n) preprocessing / O(1) per query",
    code: `// prefix[i] = aggregate of a[0..i-1]; sum of a[l..r] = prefix[r+1] - prefix[l].
var prefix = new int[a.Length + 1];
for (int i = 0; i < a.Length; i++) prefix[i + 1] = prefix[i] + a[i];

// Two-pass, O(1) extra: fold the suffix in on the way back.
var result = new int[a.Length];
int running = 1;
for (int i = 0; i < a.Length; i++) { result[i] = running; running *= a[i]; }
running = 1;
for (int i = a.Length - 1; i >= 0; i--) { result[i] *= running; running *= a[i]; }`,
    traps: [
      "Off-by-one in the `prefix[r + 1] - prefix[l]` formula — size the array n+1 and it stops hurting",
      "Overflow: sums of `int` need a `long` accumulator more often than people expect",
      "Counting the output array as extra space when the problem explicitly excludes it",
    ],
    trapsru: [
      "Сдвиг на единицу в формуле `prefix[r + 1] - prefix[l]` — берите массив размера n+1, и проблема исчезает",
      "Переполнение: суммам `int` чаще, чем кажется, нужен аккумулятор `long`",
      "Считать выходной массив дополнительной памятью, когда в условии он вынесен за скобки",
    ],
  },
  {
    id: "intervals",
    n: "Sort + sweep over intervals",
    nru: "Сортировка и свип по интервалам",
    idea: "Sort intervals by start, then walk once keeping the current merged interval: either the next one overlaps and extends it, or it starts a new one.",
    idearu:
      "Отсортировать интервалы по началу и пройти один раз, храня текущий объединённый интервал: следующий либо пересекается и продлевает его, либо начинает новый.",
    when: [
      "Anything with ranges, bookings, timelines, cooldowns, AABB extents",
      '"Merge", "overlap", "how many rooms/CPUs do I need"',
      "Events with start and end times",
    ],
    whenru: [
      "Всё про диапазоны, брони, таймлайны, кулдауны, границы AABB",
      "«Слить», «пересечение», «сколько нужно комнат/ядер»",
      "События с временем начала и конца",
    ],
    cx: "O(n log n) time (the sort dominates) / O(n) output",
    code: `Array.Sort(intervals, (x, y) => x.Start.CompareTo(y.Start));

var merged = new List<Interval>();
foreach (var next in intervals)
{
    if (merged.Count > 0 && next.Start <= merged[^1].End)
        merged[^1] = merged[^1] with { End = Math.Max(merged[^1].End, next.End) };
    else
        merged.Add(next);
}

// Counting overlaps instead of merging: +1 at every start, -1 at every end,
// sort the events, sweep, and track the running maximum.`,
    traps: [
      "Deciding whether touching intervals ([1,2] and [2,3]) count as overlapping — ask, then be consistent",
      "Taking `next.End` as the new end instead of `max(current.End, next.End)` — a fully contained interval then truncates the result",
      "Sorting by end when the sweep needs starts (or the reverse, for the greedy scheduling variant)",
    ],
    trapsru: [
      "Считаются ли соприкасающиеся интервалы ([1,2] и [2,3]) пересекающимися — уточните и держитесь одного варианта",
      "Брать `next.End` вместо `max(current.End, next.End)` — вложенный интервал тогда обрежет результат",
      "Сортировка по концу там, где свипу нужны начала (или наоборот — в жадном варианте про расписание)",
    ],
  },
  {
    id: "in-place",
    n: "In-place rewriting",
    nru: "Перезапись на месте",
    idea: "Use the container itself as scratch space — a write cursor behind a read cursor, or the first row/column as bookkeeping — so the extra memory stays O(1).",
    idearu:
      "Использовать сам контейнер как рабочую память — курсор записи позади курсора чтения либо первая строка/столбец как хранилище пометок, — чтобы доп. память осталась O(1).",
    when: [
      'The problem says "in place", "O(1) extra space", or "do not allocate"',
      "You are removing/compacting elements and order of the survivors matters",
      "Gameplay code: removing dead entities from a pooled array every frame",
    ],
    whenru: [
      "В условии «на месте», «O(1) дополнительной памяти», «без аллокаций»",
      "Удаляете/уплотняете элементы, и порядок оставшихся важен",
      "Геймплейный код: удаление мёртвых сущностей из пулового массива каждый кадр",
    ],
    cx: "O(n) time / O(1) extra space",
    code: `// Compaction: everything kept slides forward, order preserved.
int write = 0;
for (int read = 0; read < a.Length; read++)
    if (a[read] != 0) a[write++] = a[read];
while (write < a.Length) a[write++] = 0;

// Order does NOT matter? Swap with the tail instead — O(1) per removal,
// the pattern behind Unity's "swap-remove" object pools.
void SwapRemove(List<T> items, int index)
{
    items[index] = items[^1];
    items.RemoveAt(items.Count - 1);
}`,
    traps: [
      "Swap-removing while iterating forward and then advancing the index — you skip the element you just moved in",
      "Forgetting that the marker you write into the container can collide with real data",
      "Claiming O(1) space while building a `HashSet` of rows to zero",
    ],
    trapsru: [
      "Swap-remove при обходе вперёд с последующим `i++` — пропускаете только что переставленный элемент",
      "Забыть, что метка, записанная в контейнер, может совпасть с настоящими данными",
      "Заявлять O(1) памяти, попутно строя `HashSet` строк для обнуления",
    ],
  },
  {
    id: "matrix-traversal",
    n: "Matrix traversal & transforms",
    nru: "Обходы и преобразования матриц",
    idea: "Express a 2D rewrite as a composition of simple whole-matrix operations (transpose, reverse rows) or as four shrinking boundaries you walk between.",
    idearu:
      "Выразить 2D-преобразование через композицию простых операций над всей матрицей (транспонирование, разворот строк) или через четыре сходящиеся границы, между которыми идёт обход.",
    when: [
      "Rotate / spiral / diagonal / layer-by-layer traversal",
      "Anything that maps (row, col) to a new (row, col)",
      "Transform and texture work where you want to reason about the maths, not the indices",
    ],
    whenru: [
      "Поворот / спираль / диагонали / обход слоями",
      "Всё, что отображает (row, col) в новые (row, col)",
      "Работа с трансформами и текстурами, где хочется рассуждать математикой, а не индексами",
    ],
    cx: "O(rows × cols) time / O(1) extra space",
    code: `// Rotate 90° clockwise = transpose, then reverse each row.
for (int r = 0; r < n; r++)
    for (int c = r + 1; c < n; c++)
        (m[r][c], m[c][r]) = (m[c][r], m[r][c]);
foreach (var row in m) Array.Reverse(row);

// Spiral: four boundaries, each pass shrinks one of them.
int top = 0, bottom = rows - 1, left = 0, right = cols - 1;
while (top <= bottom && left <= right)
{
    for (int c = left; c <= right; c++) Visit(top, c);
    top++;
    for (int r = top; r <= bottom; r++) Visit(r, right);
    right--;
    if (top <= bottom) { for (int c = right; c >= left; c--) Visit(bottom, c); bottom--; }
    if (left <= right) { for (int r = bottom; r >= top; r--) Visit(r, left); left++; }
}`,
    traps: [
      "Transposing over the full grid instead of `c > r` — you swap every pair twice and get the original back",
      "Missing the `top <= bottom` / `left <= right` re-check in the spiral, which double-visits the middle row of an odd matrix",
      "Assuming a square matrix when the input is rectangular",
    ],
    trapsru: [
      "Транспонировать всю сетку вместо `c > r` — каждая пара меняется дважды, и матрица возвращается к исходной",
      "Пропустить повторные проверки `top <= bottom` / `left <= right` в спирали — средняя строка нечётной матрицы обойдётся дважды",
      "Считать матрицу квадратной, когда вход прямоугольный",
    ],
  },
];
