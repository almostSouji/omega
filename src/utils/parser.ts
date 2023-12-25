/* eslint-disable id-length */
// https://sigmahq.io/sigma-specification/

import {
  createToken,
  EmbeddedActionsParser,
  Lexer,
  type ParserMethod,
} from "chevrotain";

const Term = createToken({
  name: "TERM",
  pattern: /[A-Za-z]\w*/,
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
  pattern: /[([（]/,
});

const RightParens = createToken({
  name: "RP",
  pattern: /[)\]）]/,
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
  And = "and",
  Not = "not",
  Or = "or",
  Term = "term",
}

export type Query = { t: QueryKind } & (
  | { c: [Query, Query]; t: QueryKind.And }
  | { c: [Query, Query]; t: QueryKind.Or }
  | { c: Query; t: QueryKind.Not }
  | { c: string; t: QueryKind.Term }
);

class Parser extends EmbeddedActionsParser {
  public pexpr!: ParserMethod<[], Query>;

  public por!: ParserMethod<[], Query>;

  public pand!: ParserMethod<[], Query>;

  public punit!: ParserMethod<[], Query>;

  public pnot!: ParserMethod<[], Query>;

  public patom!: ParserMethod<[], Query>;

  public pgroup!: ParserMethod<[], Query>;

  public pterm!: ParserMethod<[], Query>;

  public constructor() {
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
  return parser.pexpr();
}
