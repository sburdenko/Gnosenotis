/**
 * Design-round patterns — building a data structure out of two simpler ones,
 * and getting data in and out of a format.
 */
import type { AlgoPattern } from "@/types/content";

export const designPatterns: AlgoPattern[] = [
  {
    id: "design-composite",
    n: "Composite data structure",
    nru: "Составная структура данных",
    idea: "When one structure cannot give you every operation in O(1), combine two: a hash map for lookup plus a linked list for order, or a stack plus a parallel stack of running minima.",
    idearu:
      "Если одна структура не даёт всех операций за O(1), соедините две: словарь для поиска плюс связный список для порядка либо стек плюс параллельный стек текущих минимумов.",
    when: [
      '"Design a cache / a structure with O(1) get and put"',
      "Two requirements pull in different directions: fast lookup and maintained order",
      "Real systems: asset/texture caches with eviction, object pools, recently-used lists",
    ],
    whenru: [
      "«Спроектируйте кэш / структуру с O(1) get и put»",
      "Два требования тянут в разные стороны: быстрый поиск и поддержание порядка",
      "Реальные системы: кэши ассетов и текстур с вытеснением, пулы объектов, списки недавних",
    ],
    cx: "O(1) per operation, at the cost of O(n) extra bookkeeping memory",
    code: `// LRU = Dictionary (find in O(1)) + doubly linked list (reorder in O(1)).
class LruCache
{
    readonly Dictionary<int, LinkedListNode<(int key, int value)>> map = new();
    readonly LinkedList<(int key, int value)> order = new();   // front = newest
    readonly int capacity;

    public bool TryGet(int key, out int value)
    {
        value = default;
        if (!map.TryGetValue(key, out var node)) return false;
        order.Remove(node);                       // O(1) — we hold the node
        order.AddFirst(node);
        value = node.Value.value;
        return true;
    }

    public void Put(int key, int value)
    {
        if (map.TryGetValue(key, out var existing)) order.Remove(existing);
        else if (map.Count == capacity)
        {
            map.Remove(order.Last.Value.key);     // evict the least recent
            order.RemoveLast();
        }
        map[key] = order.AddFirst((key, value));
    }
}`,
    traps: [
      "Storing values in the map instead of list *nodes* — removal degrades to an O(n) scan",
      "Evicting before checking whether the key already exists, which drops a live entry",
      "Forgetting that a read counts as a use in LRU: `Get` must reorder, not just return",
    ],
    trapsru: [
      "Хранить в словаре значения, а не *узлы* списка — удаление вырождается в O(n) проход",
      "Вытеснять до проверки, есть ли уже такой ключ, — выбрасывается живая запись",
      "Забыть, что чтение в LRU считается использованием: `Get` обязан переставлять, а не только возвращать",
    ],
  },
  {
    id: "serialization",
    n: "Serialization & round-tripping",
    nru: "Сериализация и round-trip",
    idea: "Pick a traversal order, write an explicit marker for absence, and parse with the exact same order — the format is only correct if encode-then-decode returns an identical structure.",
    idearu:
      "Выбрать порядок обхода, писать явный маркер отсутствия и разбирать в том же порядке — формат корректен только если кодирование с последующим декодированием даёт идентичную структуру.",
    when: [
      '"Serialize and deserialize a tree/graph"',
      "Save systems, network replication, prefab and scene formats",
      "Any question where versioning and backwards compatibility can come up",
    ],
    whenru: [
      "«Сериализуйте и десериализуйте дерево/граф»",
      "Системы сохранений, сетевая репликация, форматы префабов и сцен",
      "Любой вопрос, где может всплыть версионирование и обратная совместимость",
    ],
    cx: "O(n) encode / O(n) decode",
    code: `// Pre-order with an explicit null marker is enough to rebuild uniquely.
void Encode(Node node, StringBuilder sb)
{
    if (node == null) { sb.Append("#,"); return; }
    sb.Append(node.Value).Append(',');
    Encode(node.Left, sb);
    Encode(node.Right, sb);
}

Node Decode(Queue<string> tokens)
{
    string token = tokens.Dequeue();
    if (token == "#") return null;
    return new Node(int.Parse(token))
    {
        Left = Decode(tokens),        // same order as Encode — that is the contract
        Right = Decode(tokens),
    };
}

// Graph, not tree? Assign ids and write edges — a shared node must not be
// duplicated on the way back in.`,
    traps: [
      "In-order traversal alone: it does not uniquely determine a tree, even with null markers",
      "No null marker, then trying to infer structure from value ranges",
      "Ignoring versioning when the question is really about save files — mention a version header",
    ],
    trapsru: [
      "Только in-order обход: он не задаёт дерево однозначно, даже с маркерами null",
      "Не писать маркер null, а потом угадывать структуру по диапазонам значений",
      "Игнорировать версионирование, когда вопрос на самом деле про файлы сохранений — упомяните заголовок с версией",
    ],
  },
];
