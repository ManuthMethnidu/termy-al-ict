import { McqQuestion } from '../types';

export const SYLLABUS_QUESTIONS: McqQuestion[] = [
  {
    id: 'ict-2022-mcq-14',
    unit: 3,
    unitTitle: 'Digital Logic Gates & Boolean Algebra',
    pastPaperYear: 2022,
    pastPaperNumber: 14,
    question:
      'Which of the following Boolean expressions represents the output $F$ of a 2-input XOR gate with inputs $A$ and $B$?',
    isQuestionLatex: true,
    diagramType: 'xor_gate',
    diagramData: {
      inputs: ['A', 'B'],
      output: 'F',
      truthTable: [
        { a: 0, b: 0, f: 0, isHigh: false },
        { a: 0, b: 1, f: 1, isHigh: true },
        { a: 1, b: 0, f: 1, isHigh: true },
        { a: 1, b: 1, f: 0, isHigh: false },
      ],
    },
    options: [
      { id: 1, text: "A \\cdot B + A' \\cdot B'", isLatex: true },
      { id: 2, text: "A' \\cdot B + A \\cdot B'", isLatex: true },
      { id: 3, text: "(A + B) \\cdot (A' + B')", isLatex: true },
      { id: 4, text: "A' + B'", isLatex: true },
    ],
    correctOption: 2,
    explanation:
      'The XOR (Exclusive-OR) logic gate outputs logic 1 ($HIGH$) if and only if the inputs are different from each other. From the truth table minterms: $m_1 = A\' \\cdot B$ and $m_2 = A \\cdot B\'$. Summing these minterms gives $F = A\' \\cdot B + A \\cdot B\' = A \\oplus B$.',
    latexFormula: 'F = A \\oplus B = \\overline{A}B + A\\overline{B}',
    trapInsight:
      "Watch out: Option 1 ($A \\cdot B + A' \\cdot B'$) is the Boolean expression for an XNOR (equivalence) gate, which outputs 1 when inputs are identical.",
    difficulty: 'medium',
    topic: 'Logic Gates & Minterms',
  },
  {
    id: 'ict-2023-mcq-09',
    unit: 3,
    unitTitle: 'Digital Logic Gates & Boolean Algebra',
    pastPaperYear: 2023,
    pastPaperNumber: 9,
    question:
      'Consider the 3-variable Boolean function $F(A, B, C) = \\sum m(1, 3, 5, 7)$. Which of the following is the most simplified algebraic expression for $F$?',
    isQuestionLatex: true,
    diagramType: 'kmap',
    diagramData: {
      variables: ['A', 'B', 'C'],
      groups: ['m(1,3,5,7) quad group eliminates A and B'],
    },
    options: [
      { id: 1, text: 'A \\cdot B', isLatex: true },
      { id: 2, text: "B' \\cdot C", isLatex: true },
      { id: 3, text: 'C', isLatex: true },
      { id: 4, text: "A' + C", isLatex: true },
    ],
    correctOption: 3,
    explanation:
      'Minterms are: $m_1 = A\'B\'C$, $m_3 = A\'BC$, $m_5 = AB\'C$, $m_7 = ABC$. Factoring out $C$: $F = C \\cdot (A\'B\' + A\'B + AB\' + AB) = C \\cdot [A\'(B\' + B) + A(B\' + B)] = C \\cdot (A\' + A) = C \\cdot 1 = C$. On a Karnaugh map, minterms 1, 3, 5, 7 form an entire 4-cell column/quad where $C=1$ whilst both $A$ and $B$ vary across all states.',
    latexFormula: 'F(A,B,C) = \\sum m(1,3,5,7) = C',
    trapInsight:
      'Students often try multiplying out pairs and get stuck with redundant terms like $(A+A\')C$. Remember a 4-cell group in a 3-variable K-map always eliminates 2 variables!',
    difficulty: 'medium',
    topic: 'Karnaugh Maps & Simplification',
  },
  {
    id: 'ict-2021-mcq-22',
    unit: 3,
    unitTitle: 'Digital Logic Gates & Boolean Algebra',
    pastPaperYear: 2021,
    pastPaperNumber: 22,
    question:
      'In a Half-Adder digital circuit receiving binary inputs $A$ and $B$, which logic gates generate the Sum ($S$) and Carry ($C$) outputs respectively?',
    isQuestionLatex: true,
    diagramType: 'truth_table',
    options: [
      { id: 1, text: 'Sum: AND gate, Carry: OR gate' },
      { id: 2, text: 'Sum: XOR gate, Carry: AND gate' },
      { id: 3, text: 'Sum: OR gate, Carry: XOR gate' },
      { id: 4, text: 'Sum: NAND gate, Carry: NOR gate' },
    ],
    correctOption: 2,
    explanation:
      'Binary addition rules: $0+0=00_2$, $0+1=01_2$, $1+0=01_2$, $1+1=10_2$. The Sum column ($S$) matches the truth table of an XOR gate ($S = A \\oplus B$). The Carry column ($C$) is 1 only when both $A=1$ and $B=1$, which matches an AND gate ($C = A \\cdot B$).',
    latexFormula: 'S = A \\oplus B, \\quad C = A \\cdot B',
    trapInsight:
      'Remember: A Full-Adder requires two Half-Adders and an OR gate to accommodate an input Carry ($C_{in}$).',
    difficulty: 'easy',
    topic: 'Combinational Circuits',
  },
  {
    id: 'ict-2024-mcq-12',
    unit: 3,
    unitTitle: 'Digital Logic Gates & Boolean Algebra',
    pastPaperYear: 2024,
    pastPaperNumber: 12,
    question:
      'NAND is a universal logic gate. What is the minimum number of 2-input NAND gates required to implement a 2-input OR gate?',
    isQuestionLatex: false,
    options: [
      { id: 1, text: '2 NAND gates' },
      { id: 2, text: '3 NAND gates' },
      { id: 3, text: '4 NAND gates' },
      { id: 4, text: '5 NAND gates' },
    ],
    correctOption: 2,
    explanation:
      "By De Morgan's Law: $A + B = \\overline{\\overline{A + B}} = \\overline{\\overline{A} \\cdot \\overline{B}}$. To construct this using NAND gates: gate 1 inverts $A \\rightarrow \\overline{A}$, gate 2 inverts $B \\rightarrow \\overline{B}$, and gate 3 takes inputs $\\overline{A}$ and $\\overline{B}$ to produce $\\overline{\\overline{A} \\cdot \\overline{B}} = A + B$. Hence, exactly 3 NAND gates are needed.",
    latexFormula: 'A + B = \\overline{\\overline{A} \\cdot \\overline{B}}',
    trapInsight:
      'Universal gate conversions: NOT = 1 NAND, AND = 2 NANDs, OR = 3 NANDs, NOR = 4 NANDs, XOR = 4 NANDs, XNOR = 5 NANDs.',
    difficulty: 'medium',
    topic: 'Universal Logic Implementations',
  },
  {
    id: 'ict-2022-mcq-27',
    unit: 5,
    unitTitle: 'Data Communication & Networking',
    pastPaperYear: 2022,
    pastPaperNumber: 27,
    question:
      'An IPv4 host is configured with the address `192.168.10.65/26`. What are the Network ID and Broadcast address for this subnet?',
    isQuestionLatex: false,
    diagramType: 'network',
    options: [
      { id: 1, text: 'Network ID: 192.168.10.0, Broadcast: 192.168.10.63' },
      { id: 2, text: 'Network ID: 192.168.10.64, Broadcast: 192.168.10.127' },
      { id: 3, text: 'Network ID: 192.168.10.64, Broadcast: 192.168.10.255' },
      { id: 4, text: 'Network ID: 192.168.10.32, Broadcast: 192.168.10.95' },
    ],
    correctOption: 2,
    explanation:
      'A /26 prefix means 26 network bits and $32 - 26 = 6$ host bits. Subnet size / block size = $2^6 = 64$. Subnets in the last octet begin at multiples of 64: Subnet 0 (0-63), Subnet 1 (64-127), Subnet 2 (128-191), Subnet 3 (192-255). Since host IP is .65, it resides in Subnet 1: Network ID = 192.168.10.64 and Broadcast = 192.168.10.127. Usable host range is 192.168.10.65 to 192.168.10.126.',
    latexFormula: '\\text{Block Size} = 2^{32-26} = 2^6 = 64',
    trapInsight:
      'Never confuse usable host range with network boundaries! The first address (.64) is Network ID and last address (.127) is Subnet Directed Broadcast.',
    difficulty: 'hard',
    topic: 'IPv4 Subnetting & CIDR',
  },
  {
    id: 'ict-2023-mcq-35',
    unit: 8,
    unitTitle: 'Programming with Python',
    pastPaperYear: 2023,
    pastPaperNumber: 35,
    question:
      'What is the output of the following Python code snippet?\n\n```python\nx = 19\ns = ""\nwhile x > 0:\n    s = str(x % 2) + s\n    x = x // 2\nprint(s)\n```',
    isQuestionLatex: false,
    diagramType: 'code_snippet',
    options: [
      { id: 1, text: '11001' },
      { id: 2, text: '10011' },
      { id: 3, text: '10101' },
      { id: 4, text: '19' },
    ],
    correctOption: 2,
    explanation:
      'This algorithm converts a positive decimal integer into its binary representation. Trace: 19 % 2 = 1, x = 9; 9 % 2 = 1, x = 4; 4 % 2 = 0, x = 2; 2 % 2 = 0, x = 1; 1 % 2 = 1, x = 0. Notice `s = str(x % 2) + s` prepends each remainder to the front of string `s`. Thus reading the remainders from bottom to top yields $10011_2$. Checking: $16 + 2 + 1 = 19$.',
    latexFormula: '19_{10} = 16 + 2 + 1 = 10011_2',
    trapInsight:
      'Beware string concatenation order! `str(...) + s` prepends (reversing order correctly), while `s + str(...)` would have appended resulting in the backwards binary string 11001.',
    difficulty: 'medium',
    topic: 'Python Loops & Decimal-Binary Conversion',
  },
  {
    id: 'ict-2021-mcq-41',
    unit: 6,
    unitTitle: 'Database Management Systems (DBMS)',
    pastPaperYear: 2021,
    pastPaperNumber: 41,
    question:
      'A relation $R(StudentID, CourseCode, CourseName, Grade)$ has composite primary key $(StudentID, CourseCode)$. Given that $CourseCode \\rightarrow CourseName$, what normal form violation exists and how is it resolved into 2NF?',
    isQuestionLatex: true,
    options: [
      { id: 1, text: 'Transitive dependency; decompose into 3 tables' },
      { id: 2, text: 'Partial functional dependency; separate CourseCode and CourseName into a Course table' },
      { id: 3, text: 'Multi-valued dependency; remove Grade into another table' },
      { id: 4, text: 'The relation is already in 3NF and BCNF' },
    ],
    correctOption: 2,
    explanation:
      'Second Normal Form (2NF) mandates that the table is in 1NF and no non-prime attribute is partially dependent on any candidate key. Here $CourseName$ is dependent solely on $CourseCode$, which is a proper subset of the composite primary key $(StudentID, CourseCode)$. This is a partial dependency. To convert to 2NF: split into $Course(CourseCode, CourseName)$ and $Enrollment(StudentID, CourseCode, Grade)$.',
    latexFormula: 'CourseCode \\rightarrow CourseName \\quad \\text{(Partial Dependency)}',
    trapInsight:
      'Transitive dependency ($X \\rightarrow Y \\rightarrow Z$ where $Y$ is not a candidate key) is a 3NF violation, whereas partial dependency on a composite key is a 2NF violation.',
    difficulty: 'hard',
    topic: 'Database Normalization (2NF & 3NF)',
  },
  {
    id: 'ict-2020-mcq-18',
    unit: 3,
    unitTitle: 'Digital Logic Gates & Boolean Algebra',
    pastPaperYear: 2020,
    pastPaperNumber: 18,
    question:
      'According to De Morgan\'s laws, the complement of the product $(A \\cdot B)\'$ is equivalent to which of the following expressions?',
    isQuestionLatex: true,
    options: [
      { id: 1, text: "A' \\cdot B'", isLatex: true },
      { id: 2, text: "A' + B'", isLatex: true },
      { id: 3, text: "A + B", isLatex: true },
      { id: 4, text: "(A + B)'", isLatex: true },
    ],
    correctOption: 2,
    explanation:
      "De Morgan's dual laws are fundamental to G.C.E. A/L ICT: 1) $\\overline{A \\cdot B} = \\overline{A} + \\overline{B}$ (break the line, change the sign: AND becomes OR). 2) $\\overline{A + B} = \\overline{A} \\cdot \\overline{B}$ (NOR becomes AND of inverted inputs).",
    latexFormula: '\\overline{A \\cdot B} = \\overline{A} + \\overline{B}',
    trapInsight:
      'Common mnemonic taught in Sri Lankan schools: "Break the bar, change the operator!" A NAND gate is logically equivalent to an active-low OR (bubbled OR) gate.',
    difficulty: 'easy',
    topic: "De Morgan's Theorems",
  },
];
