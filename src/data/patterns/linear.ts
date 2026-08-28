/**
 * Hashing, bits, linked lists and stacks — the patterns that live in a single
 * pass over linear data.
 */
import type { AlgoPattern } from "@/types/content";

export const linearPatterns: AlgoPattern[] = [
  {
    id: "hash-map",
    n: "Hash map / set lookup",
    nru: "Хэш-таблица и множество",
    idea: "Trade memory for time: store what you have already seen so the second occurrence is an O(1) question instead of a rescan.",
    idearu:
      "Обменять память на время: складывать уже увиденное, чтобы вопрос о повторе стоил O(1), а не повторного прохода.",
    when: [
      '"Have I seen this before?", "does the complement exist?", "how many of each?"',
      "Deduplication, grouping, frequency counting",
      "Your first instinct is a nested loop comparing every pair",
    ],
    whenru: [
      "«Встречалось ли это раньше?», «есть ли дополнение?», «сколько каждого?»",
      "Дедупликация, группировка, подсчёт частот",
      "Первый инстинкт — вложенный цикл со сравнением всех пар",
    ],
    cx: "O(n) average time / O(n) space",
    code: `// One pass: ask about the complement BEFORE inserting the current element,
// so an element cannot pair with itself.
var seen = new Dictionary<int, int>();          // value -> index
for (int i = 0; i < a.Length; i++)
{
    if (seen.TryGetValue(target - a[i], out int j)) return (j, i);
    seen[a[i]] = i;
}

// Counting with a bounded alphabet: an array beats a dictionary outright —
// no hashing, no allocation, cache-friendly.
var counts = new int[26];
foreach (char ch in s) counts[ch - 'a']++;`,
    traps: [
      "Inserting before querying, so `target - a[i] == a[i]` matches the element itself",
      "Quoting O(1) as a worst case — hashing degrades on adversarial keys, and mutable keys corrupt the map outright",
      "Using a dictionary where a fixed-size array works: for ASCII or enum keys the array is the better answer",
    ],
    trapsru: [
      "Вставлять до запроса — тогда при `target - a[i] == a[i]` элемент найдёт сам себя",
      "Называть O(1) худшим случаем — хэширование деградирует на подобранных ключах, а изменяемые ключи ломают словарь",
      "Брать словарь там, где хватает массива фиксированного размера: для ASCII или enum-ключей массив лучше",
    ],
  },
  {
    id: "bitwise",
    n: "Bit manipulation",
    nru: "Битовые операции",
    idea: "Treat an integer as 32 or 64 independent flags: XOR cancels pairs, AND masks, and `x & (x - 1)` clears the lowest set bit.",
    idearu:
      "Считать целое число набором из 32 или 64 независимых флагов: XOR гасит пары, AND маскирует, а `x & (x - 1)` сбрасывает младший установленный бит.",
    when: [
      "Layer masks, culling masks, ECS component signatures, dirty flags",
      '"Every element appears twice except one"',
      "Subset enumeration over a small set (2^n with n ≤ 20)",
    ],
    whenru: [
      "Маски слоёв, маски отсечения, сигнатуры компонентов в ECS, dirty-флаги",
      "«Каждый элемент встречается дважды, кроме одного»",
      "Перебор подмножеств небольшого набора (2^n при n ≤ 20)",
    ],
    cx: "O(1) per operation, O(bits) per number",
    code: `bool HasFlag(int mask, int bit) => (mask & (1 << bit)) != 0;
int  Set(int mask, int bit)     => mask | (1 << bit);
int  Clear(int mask, int bit)   => mask & ~(1 << bit);
int  Toggle(int mask, int bit)  => mask ^ (1 << bit);

// Population count without a lookup table: strip the lowest set bit each turn.
int count = 0;
while (x != 0) { x &= x - 1; count++; }

// XOR cancels duplicates, so the survivor is the unpaired value.
int missing = 0;
for (int i = 0; i < a.Length; i++) missing ^= a[i] ^ i;`,
    traps: [
      "`1 << 31` on a signed `int` is negative — use `1u << 31` or a `long` mask",
      "Right-shifting a negative `int` sign-extends; `>>>` (or an unsigned type) is what you usually want for masks",
      "Operator precedence: `x & 1 == 0` parses as `x & (1 == 0)` in C-like languages — parenthesise",
    ],
    trapsru: [
      "`1 << 31` для знакового `int` отрицателен — используйте `1u << 31` или маску типа `long`",
      "Сдвиг вправо у отрицательного `int` расширяет знак; для масок обычно нужен `>>>` или беззнаковый тип",
      "Приоритет операций: `x & 1 == 0` разбирается как `x & (1 == 0)` — ставьте скобки",
    ],
  },
  {
    id: "fast-slow",
    n: "Fast & slow pointers (Floyd)",
    nru: "Быстрый и медленный указатели (Флойд)",
    idea: "Advance one pointer twice as fast as the other: if there is a cycle they must meet, and when the fast one finishes, the slow one is exactly at the middle.",
    idearu:
      "Двигать один указатель вдвое быстрее другого: при наличии цикла они обязаны встретиться, а когда быстрый доходит до конца, медленный стоит ровно в середине.",
    when: [
      "Cycle detection in a list, a functional graph, or a dependency chain",
      '"Find the middle" / "n-th from the end" in one pass',
      "You need O(1) space where a HashSet of visited nodes would be the easy answer",
    ],
    whenru: [
      "Поиск цикла в списке, функциональном графе или цепочке зависимостей",
      "«Найти середину» / «n-й с конца» за один проход",
      "Нужна O(1) память там, где напрашивается HashSet посещённых",
    ],
    cx: "O(n) time / O(1) space",
    code: `var slow = head; var fast = head;
while (fast != null && fast.Next != null)
{
    slow = slow.Next;
    fast = fast.Next.Next;
    if (slow == fast) break;      // cycle
}

// Cycle entry point: restart one pointer at the head, then step both by one.
if (fast != null && fast.Next != null)
{
    slow = head;
    while (slow != fast) { slow = slow.Next; fast = fast.Next; }
    return slow;                  // node where the loop begins
}`,
    traps: [
      "Checking `fast.Next != null` after already dereferencing `fast.Next.Next`",
      "Comparing node values instead of references — two equal values are not the same node",
      "For an even-length list, being unclear about which of the two middles you return",
    ],
    trapsru: [
      "Проверять `fast.Next != null` уже после разыменования `fast.Next.Next`",
      "Сравнивать значения узлов вместо ссылок — равные значения не означают один узел",
      "Для списка чётной длины не определиться, какую из двух середин возвращаете",
    ],
  },
  {
    id: "list-surgery",
    n: "Linked-list pointer surgery",
    nru: "Операции с указателями списка",
    idea: "Rewire `next` pointers with a fixed prev/current/next trio, and use a dummy head node so the first element needs no special case.",
    idearu:
      "Перецеплять указатели `next` тройкой prev/current/next, а фиктивную голову использовать, чтобы первый элемент не требовал особого случая.",
    when: [
      "Reverse, merge, partition, remove-nth on a singly linked list",
      "The result's head may differ from the input's head",
      "In-place required, no rebuilding into an array",
    ],
    whenru: [
      "Разворот, слияние, разбиение, удаление n-го в односвязном списке",
      "Голова результата может отличаться от головы входа",
      "Требуется на месте, без перекладывания в массив",
    ],
    cx: "O(n) time / O(1) space (iterative)",
    code: `// Reverse: save next before you destroy it.
Node prev = null, current = head;
while (current != null)
{
    var next = current.Next;
    current.Next = prev;
    prev = current;
    current = next;
}
return prev;

// Merge with a dummy head — no "is this the first node?" branch anywhere.
var dummy = new Node(); var tail = dummy;
while (a != null && b != null)
{
    if (a.Value <= b.Value) { tail.Next = a; a = a.Next; }
    else                    { tail.Next = b; b = b.Next; }
    tail = tail.Next;
}
tail.Next = a ?? b;
return dummy.Next;`,
    traps: [
      "Overwriting `current.Next` before saving it — the rest of the list is gone",
      "Returning `head` after a reverse instead of `prev`; `head` is now the tail",
      "Leaving a dangling `Next` on the last node, which turns the result into a cycle",
    ],
    trapsru: [
      "Перезаписать `current.Next` до сохранения — остаток списка потерян",
      "Вернуть `head` после разворота вместо `prev`; `head` теперь хвост",
      "Оставить висящий `Next` у последнего узла — результат превращается в цикл",
    ],
  },
  {
    id: "stack",
    n: "Stack (matching & nesting)",
    nru: "Стек (парность и вложенность)",
    idea: "Push the context you will need later, pop it when the matching token arrives — the stack shape mirrors the nesting of the input.",
    idearu:
      "Класть на стек контекст, который понадобится позже, и снимать его при появлении парного элемента — форма стека повторяет вложенность входа.",
    when: [
      "Brackets, tags, expression parsing, undo/redo history",
      '"Most recent unmatched…" phrasing',
      "You are about to write recursion but need to control depth explicitly",
    ],
    whenru: [
      "Скобки, теги, разбор выражений, история undo/redo",
      "Формулировки вида «последний непарный…»",
      "Собираетесь писать рекурсию, но нужен явный контроль глубины",
    ],
    cx: "O(n) time / O(n) space",
    code: `var pairs = new Dictionary<char, char> { [')'] = '(', [']'] = '[', ['}'] = '{' };
var stack = new Stack<char>();

foreach (char ch in s)
{
    if (!pairs.ContainsKey(ch)) { stack.Push(ch); continue; }
    if (stack.Count == 0 || stack.Pop() != pairs[ch]) return false;
}
return stack.Count == 0;      // leftovers mean unclosed brackets

// Auxiliary state trick: push (value, minSoFar) pairs to get O(1) GetMin().`,
    traps: [
      "Popping an empty stack on a leading closing token",
      "Returning `true` while the stack still holds unclosed openers",
      "Recursion where an explicit stack is required — deep inputs blow the call stack (and in Unity that takes the editor with it)",
    ],
    trapsru: [
      "Снимать с пустого стека при ведущей закрывающей скобке",
      "Вернуть `true`, когда в стеке остались незакрытые открывающие",
      "Рекурсия там, где нужен явный стек — на глубоком входе переполнится стек вызовов (в Unity вместе с редактором)",
    ],
  },
];
