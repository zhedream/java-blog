// 用法: node seed_articles.js
// Node 18+ (内置 fetch)，后端需运行在 http://localhost:8080

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const BASE_URL = 'http://localhost:8080';
const ADMIN = { username: 'admin', password: '123456' };
const TOKEN_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '.token_cache');

// ── token 缓存 ──────────────────────────────────────────────
function readCachedToken() {
  try {
    const raw = fs.readFileSync(TOKEN_FILE, 'utf-8').trim();
    const payload = JSON.parse(Buffer.from(raw.split('.')[1], 'base64').toString());
    if (payload.exp * 1000 > Date.now() + 5000) return raw; // 5s 余量
  } catch {}
  return null;
}

function saveToken(token) {
  fs.writeFileSync(TOKEN_FILE, token, 'utf-8');
}

// ── HTTP 工具 ───────────────────────────────────────────────
async function request(path, options = {}) {
  const { headers: optHeaders, ...rest } = options;
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...optHeaders },
    ...rest,
  });
  const text = await res.text();
  if (!text) throw new Error(`${path} → empty response (HTTP ${res.status})`);
  const json = JSON.parse(text);
  if (json.code !== 200) throw new Error(`${path} → ${JSON.stringify(json)}`);
  return json.data;
}

async function getToken() {
  const cached = readCachedToken();
  if (cached) { console.log('使用缓存 token'); return cached; }

  console.log('token 不存在或已过期，重新登录...');
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(ADMIN),
  });
  saveToken(data.token);
  console.log('登录成功，token 已缓存');
  return data.token;
}

// ── 分类确保存在 ────────────────────────────────────────────
async function ensureCategories(token) {
  const headers = { Authorization: `Bearer ${token}` };
  const list = await request('/api/categories', { headers });
  const map = new Map(list.map(c => [c.name, c.id]));

  for (const name of ['Java基础', 'Java进阶']) {
    if (!map.has(name)) {
      await request('/api/categories', { method: 'POST', headers, body: JSON.stringify({ name }) });
      console.log(`  创建分类: ${name}`);
    }
  }

  const updated = await request('/api/categories', { headers });
  return new Map(updated.map(c => [c.name, c.id]));
}

// ── 文章数据 ────────────────────────────────────────────────
const ARTICLES = [
  {
    category: 'Java基础',
    title: 'Java 基础数据类型详解',
    summary: '全面介绍 Java 的 8 种基本数据类型、取值范围、自动装箱拆箱及常见陷阱。',
    content: `# Java 基础数据类型详解

Java 有 8 种基本数据类型，分为四类：

## 整数类型
| 类型 | 字节 | 范围 |
|------|------|------|
| byte | 1 | -128 ~ 127 |
| short | 2 | -32768 ~ 32767 |
| int | 4 | -2^31 ~ 2^31-1 |
| long | 8 | -2^63 ~ 2^63-1 |

\`\`\`java
int a = 100;
long b = 100L; // long 字面量需加 L
\`\`\`

## 浮点类型
- \`float\`：4 字节，精度约 7 位有效数字
- \`double\`：8 字节，精度约 15 位有效数字

\`\`\`java
double pi = 3.14159;
float f = 3.14f; // float 字面量需加 f
\`\`\`

## 字符与布尔
- \`char\`：2 字节，Unicode 字符
- \`boolean\`：true / false

## 自动装箱与拆箱
\`\`\`java
Integer x = 127; // 自动装箱
int y = x;       // 自动拆箱

// 注意：Integer 缓存范围 -128~127
Integer a1 = 127, a2 = 127;
System.out.println(a1 == a2); // true（缓存）

Integer b1 = 128, b2 = 128;
System.out.println(b1 == b2); // false（新对象）
\`\`\`

## 常见陷阱
1. 整数除法截断：\`5 / 2 == 2\`，需用 \`5.0 / 2\` 或强转
2. float 精度丢失：金融计算应使用 \`BigDecimal\`
3. char 可参与算术运算：\`'A' + 1 == 66\`
`,
  },
  {
    category: 'Java基础',
    title: '面向对象三大特性：封装、继承、多态',
    summary: '通过代码示例深入理解 Java OOP 的封装、继承、多态，以及它们在实际开发中的应用。',
    content: `# 面向对象三大特性

## 封装
将数据和操作数据的方法绑定在一起，对外隐藏实现细节。

\`\`\`java
public class BankAccount {
    private double balance; // 私有字段

    public void deposit(double amount) {
        if (amount > 0) balance += amount;
    }

    public double getBalance() { return balance; }
}
\`\`\`

## 继承
子类复用父类的属性和方法，用 \`extends\` 关键字。

\`\`\`java
public class Animal {
    protected String name;
    public void eat() { System.out.println(name + " eating"); }
}

public class Dog extends Animal {
    public void bark() { System.out.println("Woof!"); }
}
\`\`\`

> Java 只支持单继承，但可以实现多个接口。

## 多态
同一方法调用，不同对象有不同行为。分为编译时多态（重载）和运行时多态（重写）。

\`\`\`java
public class Shape {
    public double area() { return 0; }
}

public class Circle extends Shape {
    private double r;
    public Circle(double r) { this.r = r; }

    @Override
    public double area() { return Math.PI * r * r; }
}

public class Rectangle extends Shape {
    private double w, h;
    public Rectangle(double w, double h) { this.w = w; this.h = h; }

    @Override
    public double area() { return w * h; }
}

// 运行时多态
Shape s = new Circle(5);
System.out.println(s.area()); // 调用 Circle.area()
\`\`\`

## 总结
- 封装 → 安全性、可维护性
- 继承 → 代码复用
- 多态 → 灵活扩展，面向接口编程
`,
  },
  {
    category: 'Java基础',
    title: 'Java 异常处理机制完全指南',
    summary: '讲解 Checked/Unchecked 异常区别、try-catch-finally 用法、自定义异常及最佳实践。',
    content: `# Java 异常处理机制

## 异常体系
\`\`\`
Throwable
├── Error（JVM 级别，不应捕获）
└── Exception
    ├── RuntimeException（Unchecked）
    │   ├── NullPointerException
    │   ├── ArrayIndexOutOfBoundsException
    │   └── IllegalArgumentException
    └── Checked Exception（必须处理）
        ├── IOException
        └── SQLException
\`\`\`

## try-catch-finally
\`\`\`java
try {
    int result = 10 / 0;
} catch (ArithmeticException e) {
    System.out.println("除零错误: " + e.getMessage());
} finally {
    System.out.println("finally 始终执行");
}
\`\`\`

## try-with-resources（推荐）
\`\`\`java
try (BufferedReader br = new BufferedReader(new FileReader("file.txt"))) {
    String line = br.readLine();
} catch (IOException e) {
    e.printStackTrace();
}
// 自动关闭资源，无需 finally
\`\`\`

## 自定义异常
\`\`\`java
public class BusinessException extends RuntimeException {
    private final int code;

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }

    public int getCode() { return code; }
}

// 使用
throw new BusinessException(404, "用户不存在");
\`\`\`

## 最佳实践
1. 优先使用 Unchecked Exception，避免强制调用方处理
2. 不要捕获 \`Exception\` 或 \`Throwable\`（太宽泛）
3. 不要吞掉异常（空 catch 块）
4. 异常信息要有意义，便于排查
5. 使用 try-with-resources 管理资源
`,
  },
  {
    category: 'Java进阶',
    title: 'Java 集合框架深度解析',
    summary: '深入分析 ArrayList、LinkedList、HashMap、TreeMap 的底层实现与性能差异，帮你选对集合。',
    content: `# Java 集合框架深度解析

## 整体结构
\`\`\`
Collection
├── List（有序、可重复）
│   ├── ArrayList
│   └── LinkedList
├── Set（无序、不重复）
│   ├── HashSet
│   └── TreeSet
└── Queue
    └── LinkedList / PriorityQueue

Map（键值对）
├── HashMap
├── LinkedHashMap
└── TreeMap
\`\`\`

## ArrayList vs LinkedList
| 操作 | ArrayList | LinkedList |
|------|-----------|------------|
| 随机访问 | O(1) | O(n) |
| 头部插入 | O(n) | O(1) |
| 尾部插入 | O(1) 均摊 | O(1) |
| 内存 | 连续数组 | 节点+指针 |

> 大多数场景用 ArrayList，频繁头部插入才考虑 LinkedList。

## HashMap 底层原理
- JDK 8+：数组 + 链表 + 红黑树
- 链表长度 ≥ 8 且数组长度 ≥ 64 时转为红黑树
- 默认初始容量 16，负载因子 0.75

\`\`\`java
Map<String, Integer> map = new HashMap<>(32); // 预估容量，减少扩容
map.put("a", 1);
map.getOrDefault("b", 0); // 安全取值
map.computeIfAbsent("list", k -> new ArrayList<>()).add(1);
\`\`\`

## 常用操作技巧
\`\`\`java
// 遍历 Map
map.forEach((k, v) -> System.out.println(k + "=" + v));

// 排序 List
list.sort(Comparator.comparing(User::getAge).reversed());

// 不可变集合（JDK 9+）
List<String> immutable = List.of("a", "b", "c");
\`\`\`

## 线程安全选择
- 读多写少：\`Collections.unmodifiableList()\`
- 并发读写：\`ConcurrentHashMap\`、\`CopyOnWriteArrayList\`
`,
  },
  {
    category: 'Java进阶',
    title: 'Java 多线程编程核心概念',
    summary: '从 Thread 到线程池，讲解 synchronized、volatile、Lock 及 ExecutorService 的正确使用姿势。',
    content: `# Java 多线程编程核心概念

## 创建线程的三种方式
\`\`\`java
// 1. 继承 Thread
new Thread(() -> System.out.println("Hello")).start();

// 2. 实现 Runnable
Runnable task = () -> System.out.println("Task");
new Thread(task).start();

// 3. Callable + Future（可获取返回值）
Callable<Integer> callable = () -> 42;
FutureTask<Integer> future = new FutureTask<>(callable);
new Thread(future).start();
System.out.println(future.get()); // 42
\`\`\`

## synchronized
\`\`\`java
public class Counter {
    private int count = 0;

    public synchronized void increment() { count++; }

    // 同步代码块（粒度更细）
    public void decrement() {
        synchronized (this) { count--; }
    }
}
\`\`\`

## volatile
保证可见性，禁止指令重排，但不保证原子性。

\`\`\`java
private volatile boolean running = true;

public void stop() { running = false; }
public void run() {
    while (running) { /* work */ }
}
\`\`\`

## 线程池（推荐方式）
\`\`\`java
ExecutorService pool = new ThreadPoolExecutor(
    4,              // corePoolSize
    8,              // maximumPoolSize
    60L,            // keepAliveTime
    TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(100),
    new ThreadPoolExecutor.CallerRunsPolicy() // 拒绝策略
);

pool.submit(() -> System.out.println("task"));
pool.shutdown(); // 优雅关闭
\`\`\`

> 避免使用 \`Executors.newFixedThreadPool()\`，队列无界可能 OOM。

## 常见问题
- 死锁：多个线程互相等待对方释放锁
- 竞态条件：多线程操作共享变量未加同步
- 内存可见性：一个线程修改变量，另一个线程看不到
`,
  },
  {
    category: 'Java进阶',
    title: 'Java Stream API 实战指南',
    summary: '掌握 Stream 的 filter、map、reduce、collect 等核心操作，写出简洁高效的函数式代码。',
    content: `# Java Stream API 实战指南

Stream API 是 JDK 8 引入的函数式编程工具，让集合操作更简洁。

## 创建 Stream
\`\`\`java
// 从集合
List<String> list = List.of("a", "b", "c");
Stream<String> s1 = list.stream();

// 从数组
Stream<Integer> s2 = Arrays.stream(new Integer[]{1, 2, 3});

// 直接创建
Stream<String> s3 = Stream.of("x", "y", "z");

// 无限流
Stream<Integer> s4 = Stream.iterate(0, n -> n + 2).limit(10);
\`\`\`

## 中间操作（惰性求值）
\`\`\`java
List<String> names = List.of("Alice", "Bob", "Anna", "Charlie");

List<String> result = names.stream()
    .filter(n -> n.startsWith("A"))   // 过滤
    .map(String::toUpperCase)          // 转换
    .sorted()                          // 排序
    .collect(Collectors.toList());     // 收集

// ["ALICE", "ANNA"]
\`\`\`

## 终止操作
\`\`\`java
// 统计
long count = list.stream().filter(s -> s.length() > 3).count();

// 聚合
int sum = IntStream.rangeClosed(1, 100).sum(); // 5050

// 查找
Optional<String> first = list.stream().filter(s -> s.startsWith("B")).findFirst();
first.ifPresent(System.out::println);

// reduce
int product = Stream.of(1, 2, 3, 4).reduce(1, (a, b) -> a * b); // 24
\`\`\`

## Collectors 常用收集器
\`\`\`java
// 分组
Map<Integer, List<String>> byLength = names.stream()
    .collect(Collectors.groupingBy(String::length));

// 转 Map
Map<String, Integer> nameLen = names.stream()
    .collect(Collectors.toMap(n -> n, String::length));

// 拼接字符串
String joined = names.stream().collect(Collectors.joining(", ", "[", "]"));
// [Alice, Bob, Anna, Charlie]
\`\`\`

## 并行流
\`\`\`java
long count = list.parallelStream()
    .filter(s -> s.length() > 3)
    .count();
\`\`\`

> 并行流适合 CPU 密集型大数据量，小数据量反而更慢（线程开销）。
`,
  },
];

// ── 主流程 ──────────────────────────────────────────────────
async function main() {
  const token = await getToken();
  const headers = { Authorization: `Bearer ${token}` };

  console.log('\n检查/创建分类...');
  const catMap = await ensureCategories(token);

  console.log('\n开始发布文章...');
  for (const art of ARTICLES) {
    const categoryId = catMap.get(art.category);
    await request('/api/articles', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: art.title,
        summary: art.summary,
        content: art.content,
        categoryId,
        status: 'PUBLISHED',
      }),
    });
    console.log(`  ✓ ${art.title}`);
  }

  console.log('\n全部发布完成！');
}

main().catch(err => { console.error('错误:', err.message); process.exit(1); });

