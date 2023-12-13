// https://sigmahq.io/sigma-specification/

import {
  createToken,
  EmbeddedActionsParser,
  Lexer,
  type ParserMethod,
} from "chevrotain";

const Term = createToken({
  name: "TERM",
  pattern: /[a-zA-Z]\w*/,
});

const WhiteSpace = createToken({
  name: "WS",
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

const And = createToken({
  name: "AND",
  pattern: /and/,
  longer_alt: Term,
});

const Or = createToken({
  name: "OR",
  pattern: /or/,
  longer_alt: Term,
});

const Not = createToken({
  name: "NOT",
  pattern: /not/,
  longer_alt: Term,
});

const LeftParens = createToken({
  name: "LP",
  pattern: /[(（\[]/,
});

const RightParens = createToken({
  name: "RP",
  pattern: /[)）\]]/,
});

const AllTokens = [
  WhiteSpace,
  And,
  Or,
  Not,
  LeftParens,
  RightParens,
  Term, // https://github.com/chevrotain/chevrotain/blob/master/examples/lexer/keywords_vs_identifiers/keywords_vs_identifiers.js
];

const lexer = new Lexer(AllTokens);

export enum QueryKind {
  Term = "term",
  Not = "not",
  And = "and",
  Or = "or",
}

export type Query = { t: QueryKind } & (
  | { t: QueryKind.Term; c: string }
  | { t: QueryKind.Not; c: Query }
  | { t: QueryKind.Or; c: [Query, Query] }
  | { t: QueryKind.And; c: [Query, Query] }
);

class Parser extends EmbeddedActionsParser {
  pexpr!: ParserMethod<[], Query>;
  por!: ParserMethod<[], Query>;
  pand!: ParserMethod<[], Query>;
  punit!: ParserMethod<[], Query>;
  pnot!: ParserMethod<[], Query>;
  patom!: ParserMethod<[], Query>;
  pgroup!: ParserMethod<[], Query>;
  pterm!: ParserMethod<[], Query>;

  constructor() {
    super(AllTokens);

    this.RULE("pexpr", () => {
      return this.SUBRULE(this.por);
    });

    this.RULE("por", () => {
      let x = this.SUBRULE1(this.pand);
      this.MANY(() => {
        this.CONSUME(Or);
        const y = this.SUBRULE2(this.pand);
        x = { t: QueryKind.Or, c: [x, y] };
      });
      return x;
    });

    this.RULE("pand", () => {
      let x = this.SUBRULE1(this.punit);
      this.MANY(() => {
        this.CONSUME(And);
        const y = this.SUBRULE2(this.punit);
        x = { t: QueryKind.And, c: [x, y] };
      });
      return x;
    });

    this.RULE("punit", () => {
      return this.OR([
        { ALT: () => this.SUBRULE1(this.pnot) },
        { ALT: () => this.SUBRULE1(this.patom) },
      ]);
    });

    this.RULE("pnot", () => {
      this.CONSUME(Not);
      const c = this.SUBRULE2(this.patom);
      return { t: QueryKind.Not, c };
    });

    this.RULE("patom", () => {
      return this.OR([
        { ALT: () => this.SUBRULE1(this.pgroup) },
        { ALT: () => this.SUBRULE1(this.pterm) },
      ]);
    });

    this.RULE("pgroup", () => {
      this.CONSUME(LeftParens);
      const inner = this.SUBRULE3(this.pexpr);
      this.CONSUME(RightParens);
      return inner;
    });

    this.RULE("pterm", () => {
      const term = this.CONSUME2(Term);
      return { t: QueryKind.Term, c: term.image };
    });

    this.performSelfAnalysis();
  }
}

const parser = new Parser();

export function parseOmegaCondition(text: string) {
  const lex = lexer.tokenize(text);
  parser.input = lex.tokens;
  const parserResult = parser.pexpr();
  return parserResult;
}
