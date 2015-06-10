function $extends(derived, base) {
  derived.prototype = Object.create(base.prototype);
  derived.prototype.constructor = derived;
}

function assert(truth) {
  if (!truth) {
    throw("Assertion failed");
  }
}

function hashCombine(left, right) {
  return left ^ right - 1640531527 + (left << 6) + (left >> 2);
}

var skew = {};

skew.quoteString = function(text, quote) {
  var builder = in_StringBuilder.$new();
  var quoteString = in_string.fromCodeUnit$840(quote);
  var escaped = "";

  // Append long runs of unescaped characters using a single slice for speed
  var start = 0;
  in_StringBuilder.s873$873(builder, quoteString);

  for (var i = 0, n360 = in_string.count$830(text); i < n360; i++) {
    var c = in_string.s831$831(text, i);

    if (c === quote) {
      escaped = "\\" + quoteString;
    } else if (c === 10) {
      escaped = "\\n";
    } else if (c === 13) {
      escaped = "\\r";
    } else if (c === 9) {
      escaped = "\\t";
    } else if (c === 0) {
      escaped = "\\0";
    } else if (c === 92) {
      escaped = "\\\\";
    } else if (c < 32) {
      escaped = "\\x" + in_string.at$833(skew.HEX, c >> 4) + in_string.at$833(skew.HEX, c & 15);
    } else {
      continue;
    }

    in_StringBuilder.s873$873(builder, text.slice(start, i));
    in_StringBuilder.s873$873(builder, escaped);
    start = i + 1;
  }

  in_StringBuilder.s873$873(builder, text.slice(start, in_string.count$830(text)));
  in_StringBuilder.s873$873(builder, quoteString);
  return in_StringBuilder.toString$877(builder);
};

skew.argumentCountForOperator = function(text) {
  if (skew.argumentCounts === null) {
    skew.argumentCounts = in_StringMap.$new();

    for (var i784 = 0, x784 = in_IntMap.values$826(skew.operatorInfo); i784 < x784.length; i784++) {
      var value = x784[i784];
      skew.argumentCounts[value.text] = value.count;
    }

    skew.argumentCounts["[...]"] = skew.ArgumentCount.ONE;
    skew.argumentCounts["[new]"] = skew.ArgumentCount.ZERO_OR_ONE;
    skew.argumentCounts["{...}"] = skew.ArgumentCount.ONE_OR_TWO;
    skew.argumentCounts["{new}"] = skew.ArgumentCount.TWO_OR_FEWER;
  }

  return in_StringMap.get$811(skew.argumentCounts, text, skew.ArgumentCount.ZERO_OR_MORE);
};

// This is the inner loop from "flex", an ancient lexer generator. The output
// of flex is pretty bad (obfuscated variable names and the opposite of modular
// code) but it's fast and somewhat standard for compiler design. The code below
// replaces a simple hand-coded lexer and offers much better performance.
skew.tokenize = function(log, source) {
  var tokens = [];
  var text = source.contents;
  var text_length = in_string.count$830(text);

  // For backing up
  var yy_last_accepting_state = 0;
  var yy_last_accepting_cpos = 0;

  // The current character pointer
  var yy_cp = 0;

  while (yy_cp < text_length) {
    // Reset the NFA
    var yy_current_state = 1;

    // The pointer to the beginning of the token
    var yy_bp = yy_cp;

    // Search for a match
    while (yy_current_state !== 209) {
      if (yy_cp >= text_length) {
        // This prevents syntax errors from causing infinite loops
        break;
      }

      var c = in_string.s831$831(text, yy_cp);
      var index = c < 127 ? c : 127;
      var yy_c = skew.yy_ec[index];

      if (skew.yy_accept[yy_current_state] !== skew.TokenKind.YY_INVALID_ACTION) {
        yy_last_accepting_state = yy_current_state;
        yy_last_accepting_cpos = yy_cp;
      }

      while (skew.yy_chk[skew.yy_base[yy_current_state] + yy_c] !== yy_current_state) {
        yy_current_state = skew.yy_def[yy_current_state];

        if (yy_current_state >= 210) {
          yy_c = skew.yy_meta[yy_c];
        }
      }

      yy_current_state = skew.yy_nxt[skew.yy_base[yy_current_state] + yy_c];
      yy_cp += 1;
    }

    // Find the action
    var yy_act = skew.yy_accept[yy_current_state];

    while (yy_act === skew.TokenKind.YY_INVALID_ACTION) {
      // Have to back up
      yy_cp = yy_last_accepting_cpos;
      yy_current_state = yy_last_accepting_state;
      yy_act = skew.yy_accept[yy_current_state];
    }

    // Ignore whitespace
    if (yy_act === skew.TokenKind.WHITESPACE) {
      continue;
    }

    // This is the default action in flex, which is usually called ECHO
    else if (yy_act === skew.TokenKind.ERROR) {
      var range = new skew.Range(source, yy_bp, yy_bp + 1);
      log.syntaxErrorExtraData(range, range.toString());
      break;
    }

    // Ignore END_OF_FILE since this loop must still perform the last action
    else if (yy_act !== skew.TokenKind.END_OF_FILE) {
      in_List.append$851(tokens, new skew.Token(new skew.Range(source, yy_bp, yy_cp), yy_act));

      // These tokens start with a ">" and may need to be split if we discover
      // that they should really be END_PARAMETER_LIST tokens. Save enough room
      // for these tokens to be split into pieces, that way all of the tokens
      // don't have to be shifted over repeatedly inside prepareTokens(). The
      // ">>" token may become ">" + ">", the ">=" token may become ">" + "=",
      // and the ">>=" token may become ">" + ">=" and so ">" + ">" + "=".
      if (yy_act === skew.TokenKind.ASSIGN_SHIFT_RIGHT || yy_act === skew.TokenKind.SHIFT_RIGHT || yy_act === skew.TokenKind.GREATER_THAN_OR_EQUAL) {
        in_List.append$851(tokens, null);

        if (yy_act === skew.TokenKind.ASSIGN_SHIFT_RIGHT) {
          in_List.append$851(tokens, null);
        }
      }
    }
  }

  // Every token stream ends in END_OF_FILE
  in_List.append$851(tokens, new skew.Token(new skew.Range(source, text_length, text_length), skew.TokenKind.END_OF_FILE));

  // Also return preprocessor token presence so the preprocessor can be avoided
  return tokens;
};

skew.parseDoubleLiteral = function(text) {
  return +text;
};

skew.parseLeadingComments = function(context) {
  var comments = null;

  while (context.peek(skew.TokenKind.COMMENT)) {
    var range = context.next().range;

    if (comments === null) {
      comments = [];
    }

    in_List.append$851(comments, range.source.contents.slice(range.start + 1, range.end));

    // Ignore blocks of comments with extra lines afterward
    if (context.eat(skew.TokenKind.NEWLINE)) {
      comments = null;
    }
  }

  return comments;
};

skew.parseTrailingComment = function(context, comments) {
  if (context.peek(skew.TokenKind.COMMENT)) {
    var range = context.next().range;

    if (comments === null) {
      comments = [];
    }

    var text = range.source.contents.slice(range.start + 1, range.end);

    if (in_string.s831$831(text, in_string.count$830(text) - 1) !== 10) {
      text += "\n";
    }

    in_List.append$851(comments, text);
    return comments;
  }

  return null;
};

skew.parseAnnotations = function(context, annotations) {
  annotations = annotations !== null ? in_List.clone$870(annotations) : [];

  while (context.peek(skew.TokenKind.ANNOTATION)) {
    var range = context.next().range;
    var value = skew.Node.createName(range.toString()).withRange(range);

    // Change "@foo.bar.baz" into "foo.bar.@baz"
    if (context.peek(skew.TokenKind.DOT)) {
      var root = value.asString();
      value.content = new skew.StringContent(root.slice(1, in_string.count$830(root)));

      while (context.eat(skew.TokenKind.DOT)) {
        var name = context.current().range;

        if (!context.expect(skew.TokenKind.IDENTIFIER)) {
          return null;
        }

        value = skew.Node.createDot(value, name.toString()).withRange(context.spanSince(range)).withInternalRange(name);
      }

      value.content = new skew.StringContent("@" + value.asString());
    }

    // Parse parentheses if present
    var token = context.current();

    if (context.eat(skew.TokenKind.LEFT_PARENTHESIS)) {
      var $arguments = skew.parseCommaSeparatedList(context, skew.TokenKind.RIGHT_PARENTHESIS);

      if ($arguments === null) {
        return null;
      }

      value = skew.Node.createCall(value, $arguments).withRange(context.spanSince(range)).withInternalRange(context.spanSince(token.range));
    }

    // Parse a trailing if condition
    var test = null;

    if (context.eat(skew.TokenKind.IF)) {
      test = skew.pratt.parse(context, skew.Precedence.LOWEST);

      if (test === null) {
        return null;
      }
    }

    // All annotations must end in a newline to avoid confusion with the trailing if
    if (!context.peek(skew.TokenKind.LEFT_BRACE) && !context.expect(skew.TokenKind.NEWLINE)) {
      return null;
    }

    in_List.append$851(annotations, skew.Node.createAnnotation(value, test).withRange(context.spanSince(range)));
  }

  return annotations;
};

skew.parseVarOrConst = function(context) {
  var token = context.next();
  var range = context.current().range;

  if (!context.expect(skew.TokenKind.IDENTIFIER)) {
    return null;
  }

  var symbol = new skew.VariableSymbol(skew.SymbolKind.VARIABLE_LOCAL, range.toString());
  symbol.range = range;

  if (token.kind === skew.TokenKind.CONST) {
    symbol.flags |= skew.Symbol.IS_CONST;
  }

  if (skew.peekType(context)) {
    symbol.type = skew.parseType(context);

    if (symbol.type === null) {
      return null;
    }
  }

  if (context.eat(skew.TokenKind.ASSIGN)) {
    symbol.value = skew.pratt.parse(context, skew.Precedence.LOWEST);

    if (symbol.value === null) {
      return null;
    }
  }

  return skew.Node.createVar(symbol).withRange(context.spanSince(token.range));
};

skew.parseJump = function(context) {
  var token = context.next();
  return (token.kind === skew.TokenKind.BREAK ? skew.Node.createBreak() : skew.Node.createContinue()).withRange(token.range);
};

skew.parseReturn = function(context) {
  var token = context.next();
  var value = null;

  if (!context.peek(skew.TokenKind.NEWLINE) && !context.peek(skew.TokenKind.COMMENT) && !context.peek(skew.TokenKind.RIGHT_BRACE)) {
    value = skew.pratt.parse(context, skew.Precedence.LOWEST);

    if (value === null) {
      return null;
    }
  }

  return skew.Node.createReturn(value).withRange(context.spanSince(token.range));
};

skew.parseSwitch = function(context) {
  var token = context.next();
  var value = skew.pratt.parse(context, skew.Precedence.LOWEST);

  if (value === null) {
    return null;
  }

  if (!context.expect(skew.TokenKind.LEFT_BRACE)) {
    return null;
  }

  var cases = [];
  context.eat(skew.TokenKind.NEWLINE);

  while (!context.peek(skew.TokenKind.RIGHT_BRACE)) {
    var comments = skew.parseLeadingComments(context);

    // Ignore trailing comments
    if (context.peek(skew.TokenKind.RIGHT_BRACE) || context.peek(skew.TokenKind.END_OF_FILE)) {
      break;
    }

    // Parse a new case
    var values = [];
    var start = context.current();

    if (context.eat(skew.TokenKind.CASE)) {
      while (true) {
        var constant = skew.pratt.parse(context, skew.Precedence.LOWEST);

        if (constant === null) {
          return null;
        }

        in_List.append$851(values, constant);

        if (!context.eat(skew.TokenKind.COMMA)) {
          break;
        }
      }
    }

    // Default cases have no values
    else if (!context.eat(skew.TokenKind.DEFAULT)) {
      context.expect(skew.TokenKind.CASE);
      return null;
    }

    // Use a block instead of requiring "break" at the end
    var block = skew.parseBlock(context);

    if (block === null) {
      return null;
    }

    // Create the case
    var node = skew.Node.createCase(values, block).withRange(context.spanSince(start.range));
    node.comments = comments;
    in_List.append$851(cases, node);

    // Parse trailing comments and/or newline
    comments = skew.parseTrailingComment(context, comments);

    if (comments !== null) {
      node.comments = comments;
      context.eat(skew.TokenKind.NEWLINE);
    } else if (context.peek(skew.TokenKind.RIGHT_BRACE) || !context.peek(skew.TokenKind.ELSE) && !context.expect(skew.TokenKind.NEWLINE)) {
      break;
    }
  }

  if (!context.expect(skew.TokenKind.RIGHT_BRACE)) {
    return null;
  }

  return skew.Node.createSwitch(value, cases).withRange(context.spanSince(token.range));
};

skew.parseFor = function(context) {
  var token = context.next();
  var range = context.current().range;

  if (!context.expect(skew.TokenKind.IDENTIFIER) || !context.expect(skew.TokenKind.IN)) {
    return null;
  }

  var symbol = new skew.VariableSymbol(skew.SymbolKind.VARIABLE_LOCAL, range.toString());
  symbol.range = range;
  var value = skew.pratt.parse(context, skew.Precedence.LOWEST);

  if (value === null) {
    return null;
  }

  if (context.eat(skew.TokenKind.DOT_DOT)) {
    var second = skew.pratt.parse(context, skew.Precedence.LOWEST);

    if (second === null) {
      return null;
    }

    value = skew.Node.createPair(value, second).withRange(skew.Range.span(value.range, second.range));
  }

  var block = skew.parseBlock(context);

  if (block === null) {
    return null;
  }

  return skew.Node.createFor(symbol, value, block).withRange(context.spanSince(token.range));
};

skew.parseIf = function(context) {
  var token = context.next();
  var test = skew.pratt.parse(context, skew.Precedence.LOWEST);

  if (test === null) {
    return null;
  }

  var trueBlock = skew.parseBlock(context);

  if (trueBlock === null) {
    return null;
  }

  return skew.Node.createIf(test, trueBlock, null).withRange(context.spanSince(token.range));
};

skew.parseWhile = function(context) {
  var token = context.next();
  var test = skew.pratt.parse(context, skew.Precedence.LOWEST);

  if (test === null) {
    return null;
  }

  var block = skew.parseBlock(context);

  if (block === null) {
    return null;
  }

  return skew.Node.createWhile(test, block).withRange(context.spanSince(token.range));
};

skew.parseStatement = function(context) {
  var token = context.current();

  switch (token.kind) {
    case skew.TokenKind.BREAK:
    case skew.TokenKind.CONTINUE: {
      return skew.parseJump(context);
      break;
    }

    case skew.TokenKind.CONST:
    case skew.TokenKind.VAR: {
      return skew.parseVarOrConst(context);
      break;
    }

    case skew.TokenKind.FOR: {
      return skew.parseFor(context);
      break;
    }

    case skew.TokenKind.IF: {
      return skew.parseIf(context);
      break;
    }

    case skew.TokenKind.RETURN: {
      return skew.parseReturn(context);
      break;
    }

    case skew.TokenKind.SWITCH: {
      return skew.parseSwitch(context);
      break;
    }

    case skew.TokenKind.WHILE: {
      return skew.parseWhile(context);
      break;
    }
  }

  var value = skew.pratt.parse(context, skew.Precedence.LOWEST);

  if (value === null) {
    return null;
  }

  return skew.Node.createExpression(value).withRange(value.range);
};

skew.parseStatements = function(context) {
  var statements = [];
  var previous = null;
  context.eat(skew.TokenKind.NEWLINE);

  while (!context.peek(skew.TokenKind.RIGHT_BRACE)) {
    var comments = skew.parseLeadingComments(context);

    // Ignore trailing comments
    if (context.peek(skew.TokenKind.RIGHT_BRACE) || context.peek(skew.TokenKind.END_OF_FILE)) {
      break;
    }

    // Merge "else" statements with the previous "if"
    if (context.peek(skew.TokenKind.ELSE) && previous !== null && previous.kind === skew.NodeKind.IF && previous.ifFalse() === null) {
      context.next();

      // Match "else if"
      if (context.peek(skew.TokenKind.IF)) {
        var statement = skew.parseIf(context);

        if (statement === null) {
          return null;
        }

        var falseBlock = skew.Node.createBlock([statement]).withRange(statement.range);
        falseBlock.comments = comments;
        previous.replaceChild(2, falseBlock);
        previous = statement;
      }

      // Match "else"
      else {
        var falseBlock = skew.parseBlock(context);

        if (falseBlock === null) {
          return null;
        }

        falseBlock.comments = comments;
        previous.replaceChild(2, falseBlock);
        previous = falseBlock;
      }
    }

    // Parse a new statement
    else {
      var statement = skew.parseStatement(context);

      if (statement === null) {
        break;
      }

      previous = statement;
      statement.comments = comments;
      in_List.append$851(statements, statement);
    }

    // Parse trailing comments and/or newline
    comments = skew.parseTrailingComment(context, comments);

    if (comments !== null) {
      if (previous !== null) {
        previous.comments = comments;
      }

      context.eat(skew.TokenKind.NEWLINE);
    } else if (context.peek(skew.TokenKind.RIGHT_BRACE) || !context.peek(skew.TokenKind.ELSE) && !context.expect(skew.TokenKind.NEWLINE)) {
      break;
    }
  }

  return statements;
};

skew.parseBlock = function(context) {
  var token = context.current();

  if (!context.expect(skew.TokenKind.LEFT_BRACE)) {
    return null;
  }

  var statements = skew.parseStatements(context);

  if (!context.expect(skew.TokenKind.RIGHT_BRACE)) {
    return null;
  }

  return skew.Node.createBlock(statements).withRange(context.spanSince(token.range));
};

skew.parseType = function(context) {
  return skew.typePratt.parse(context, skew.Precedence.LOWEST);
};

skew.peekType = function(context) {
  return context.peek(skew.TokenKind.IDENTIFIER) || context.peek(skew.TokenKind.DYNAMIC);
};

skew.parseFunctionBlock = function(context, symbol) {
  // "=> x" is the same as "{ return x }"
  if (symbol.kind === skew.SymbolKind.FUNCTION_LOCAL) {
    if (!context.expect(skew.TokenKind.ARROW)) {
      return false;
    }

    if (context.peek(skew.TokenKind.LEFT_BRACE)) {
      symbol.block = skew.parseBlock(context);

      if (symbol.block === null) {
        return false;
      }
    } else {
      var value = skew.pratt.parse(context, skew.Precedence.LOWEST);

      if (value === null) {
        return false;
      }

      symbol.block = skew.Node.createBlock([skew.Node.createImplicitReturn(value).withRange(value.range)]).withRange(value.range);
    }
  }

  // Parse function body if present
  else if (context.peek(skew.TokenKind.LEFT_BRACE)) {
    symbol.block = skew.parseBlock(context);

    if (symbol.block === null) {
      return false;
    }
  }

  return true;
};

skew.parseFunctionArguments = function(context, symbol) {
  var usingTypes = false;

  while (!context.eat(skew.TokenKind.RIGHT_PARENTHESIS)) {
    if (!in_List.isEmpty$845(symbol.$arguments) && !context.expect(skew.TokenKind.COMMA)) {
      return false;
    }

    var range = context.current().range;
    var name = range.toString();

    if (!context.expect(skew.TokenKind.IDENTIFIER)) {
      return false;
    }

    var arg = new skew.VariableSymbol(skew.SymbolKind.VARIABLE_LOCAL, name);
    arg.range = range;

    // Parse argument type
    if (symbol.kind !== skew.SymbolKind.FUNCTION_LOCAL || (in_List.isEmpty$845(symbol.$arguments) ? skew.peekType(context) : usingTypes)) {
      arg.type = skew.parseType(context);

      if (arg.type === null) {
        return false;
      }

      usingTypes = true;
    }

    // Parse default value
    if (context.eat(skew.TokenKind.ASSIGN)) {
      arg.value = skew.pratt.parse(context, skew.Precedence.LOWEST);

      if (arg.value === null) {
        return false;
      }
    }

    in_List.append$851(symbol.$arguments, arg);
  }

  return true;
};

skew.parseFunctionReturnTypeAndBlock = function(context, symbol) {
  if (skew.peekType(context)) {
    symbol.returnType = skew.parseType(context);
  }

  return skew.parseFunctionBlock(context, symbol);
};

skew.parseTypeParameters = function(context, kind) {
  var parameters = [];

  while (true) {
    var range = context.current().range;
    var name = range.toString();

    if (!context.expect(skew.TokenKind.IDENTIFIER)) {
      return null;
    }

    var symbol = new skew.ParameterSymbol(kind, name);
    symbol.range = range;
    in_List.append$851(parameters, symbol);

    if (!context.eat(skew.TokenKind.COMMA)) {
      break;
    }
  }

  if (!context.expect(skew.TokenKind.END_PARAMETER_LIST)) {
    return null;
  }

  return parameters;
};

skew.parseSymbol = function(context, parent, annotations) {
  // Parse comments before the symbol declaration
  var comments = skew.parseLeadingComments(context);

  // Ignore trailing comments
  if (context.peek(skew.TokenKind.RIGHT_BRACE) || context.peek(skew.TokenKind.END_OF_FILE)) {
    return false;
  }

  // Parse annotations before the symbol declaration
  if (context.peek(skew.TokenKind.ANNOTATION)) {
    annotations = skew.parseAnnotations(context, annotations);

    if (annotations === null) {
      return false;
    }

    // Parse an annotation block
    if (context.eat(skew.TokenKind.LEFT_BRACE)) {
      skew.parseSymbols(context, parent, annotations);
      return context.expect(skew.TokenKind.RIGHT_BRACE) && (context.peek(skew.TokenKind.END_OF_FILE) || context.peek(skew.TokenKind.RIGHT_BRACE) || context.expect(skew.TokenKind.NEWLINE));
    }
  }

  var token = context.current();

  // Special-case enum symbols
  if (parent.kind === skew.SymbolKind.OBJECT_ENUM && token.kind === skew.TokenKind.IDENTIFIER) {
    var variable = new skew.VariableSymbol(skew.SymbolKind.VARIABLE_ENUM, token.range.toString());
    variable.range = token.range;
    variable.flags |= skew.Symbol.IS_CONST;
    in_List.append$851(parent.variables, variable);
    symbol = variable;
    context.next();
  } else {
    // Parse the symbol kind

    switch (token.kind) {
      case skew.TokenKind.CLASS: {
        kind = skew.SymbolKind.OBJECT_CLASS;
        break;
      }

      case skew.TokenKind.CONST:
      case skew.TokenKind.VAR: {
        kind = skew.SymbolKind.hasInstances(parent.kind) ? skew.SymbolKind.VARIABLE_INSTANCE : skew.SymbolKind.VARIABLE_GLOBAL;
        break;
      }

      case skew.TokenKind.DEF:
      case skew.TokenKind.OVER: {
        kind = skew.SymbolKind.hasInstances(parent.kind) ? skew.SymbolKind.FUNCTION_INSTANCE : skew.SymbolKind.FUNCTION_GLOBAL;
        break;
      }

      case skew.TokenKind.ENUM: {
        kind = skew.SymbolKind.OBJECT_ENUM;
        break;
      }

      case skew.TokenKind.INTERFACE: {
        kind = skew.SymbolKind.OBJECT_INTERFACE;
        break;
      }

      case skew.TokenKind.NAMESPACE: {
        kind = skew.SymbolKind.OBJECT_NAMESPACE;
        break;
      }

      default: {
        context.unexpectedToken();
        return false;
        break;
      }
    }

    context.next();

    // Parse the symbol name
    var nameToken = context.current();
    var range = nameToken.range;
    var name = range.toString();
    var isOperator = kind === skew.SymbolKind.FUNCTION_INSTANCE && ((nameToken.kind) | 0) in skew.operatorOverloadTokenKinds;

    if (isOperator) {
      context.next();
    } else if (kind === skew.SymbolKind.FUNCTION_GLOBAL && context.eat(skew.TokenKind.ANNOTATION)) {
      kind = skew.SymbolKind.FUNCTION_ANNOTATION;
    } else if (context.eat(skew.TokenKind.LIST_NEW) || context.eat(skew.TokenKind.SET_NEW)) {
      if (kind === skew.SymbolKind.FUNCTION_INSTANCE) {
        kind = skew.SymbolKind.FUNCTION_CONSTRUCTOR;
      }
    } else {
      if (!context.expect(skew.TokenKind.IDENTIFIER)) {
        return false;
      }

      if (kind === skew.SymbolKind.FUNCTION_INSTANCE && name === "new") {
        kind = skew.SymbolKind.FUNCTION_CONSTRUCTOR;
      }
    }

    // Parse shorthand nested namespace declarations
    if (skew.SymbolKind.isObject(kind)) {
      while (context.eat(skew.TokenKind.DOT)) {
        var nextToken = context.current();

        if (!context.expect(skew.TokenKind.IDENTIFIER)) {
          return false;
        }

        // Wrap this declaration in a namespace
        var nextParent = new skew.ObjectSymbol(skew.SymbolKind.OBJECT_NAMESPACE, name);
        nextParent.range = range;
        in_List.append$851(parent.objects, nextParent);
        parent = nextParent;

        // Update the declaration token
        nameToken = nextToken;
        range = nextToken.range;
        name = range.toString();
      }
    }

    // Parse the symbol body
    switch (kind) {
      case skew.SymbolKind.VARIABLE_GLOBAL:
      case skew.SymbolKind.VARIABLE_INSTANCE: {
        var variable = new skew.VariableSymbol(kind, name);
        variable.range = range;

        if (token.kind === skew.TokenKind.CONST) {
          variable.flags |= skew.Symbol.IS_CONST;
        }

        if (skew.peekType(context)) {
          variable.type = skew.parseType(context);
        }

        if (context.eat(skew.TokenKind.ASSIGN)) {
          variable.value = skew.pratt.parse(context, skew.Precedence.LOWEST);
        }

        in_List.append$851(parent.variables, variable);
        symbol = variable;
        break;
      }

      case skew.SymbolKind.FUNCTION_ANNOTATION:
      case skew.SymbolKind.FUNCTION_CONSTRUCTOR:
      case skew.SymbolKind.FUNCTION_GLOBAL:
      case skew.SymbolKind.FUNCTION_INSTANCE: {
        var $function = new skew.FunctionSymbol(kind, name);
        $function.range = range;

        if (token.kind === skew.TokenKind.OVER) {
          $function.flags |= skew.Symbol.IS_OVER;
        }

        // Check for setters like "def foo=(x int) {}" but don't allow a space
        // between the name and the assignment operator
        if (kind !== skew.SymbolKind.FUNCTION_ANNOTATION && nameToken.kind === skew.TokenKind.IDENTIFIER && context.peek(skew.TokenKind.ASSIGN) && context.current().range.start === nameToken.range.end) {
          $function.range = skew.Range.span($function.range, context.next().range);
          $function.flags |= skew.Symbol.IS_SETTER;
          $function.name += "=";
        }

        // Parse type parameters
        if (context.eat(skew.TokenKind.START_PARAMETER_LIST)) {
          $function.parameters = skew.parseTypeParameters(context, skew.SymbolKind.PARAMETER_FUNCTION);

          if ($function.parameters === null) {
            return false;
          }
        }

        // Parse function arguments
        var before = context.current();

        if (context.eat(skew.TokenKind.LEFT_PARENTHESIS)) {
          if (!skew.parseFunctionArguments(context, $function)) {
            return false;
          }

          // Functions without arguments are "getters" and don't use parentheses
          if (in_List.isEmpty$845($function.$arguments)) {
            context.log.syntaxErrorEmptyFunctionParentheses(context.spanSince(before.range));
          }
        }

        if (kind !== skew.SymbolKind.FUNCTION_ANNOTATION && !skew.parseFunctionReturnTypeAndBlock(context, $function)) {
          return false;
        }

        // Don't mark operators as getters to avoid confusion with unary operators and compiler-generated call expressions
        if (!isOperator && in_List.isEmpty$845($function.$arguments)) {
          $function.flags |= skew.Symbol.IS_GETTER;
        }

        in_List.append$851(parent.functions, $function);
        symbol = $function;
        break;
      }

      case skew.SymbolKind.OBJECT_CLASS:
      case skew.SymbolKind.OBJECT_ENUM:
      case skew.SymbolKind.OBJECT_INTERFACE:
      case skew.SymbolKind.OBJECT_NAMESPACE: {
        var object = new skew.ObjectSymbol(kind, name);
        object.range = range;

        if (kind !== skew.SymbolKind.OBJECT_NAMESPACE && context.eat(skew.TokenKind.START_PARAMETER_LIST)) {
          object.parameters = skew.parseTypeParameters(context, skew.SymbolKind.PARAMETER_OBJECT);

          if (object.parameters === null) {
            return false;
          }
        }

        if (context.eat(skew.TokenKind.COLON)) {
          object.base = skew.parseType(context);

          if (object.base === null) {
            return false;
          }
        }

        if (!context.expect(skew.TokenKind.LEFT_BRACE)) {
          return false;
        }

        skew.parseSymbols(context, object, null);

        if (!context.expect(skew.TokenKind.RIGHT_BRACE)) {
          return false;
        }

        in_List.append$851(parent.objects, object);
        symbol = object;
        break;
      }

      default: {
        assert(false);
        break;
      }
    }

    // Forbid certain kinds of symbols inside enums
    if (parent.kind === skew.SymbolKind.OBJECT_ENUM && (kind === skew.SymbolKind.FUNCTION_CONSTRUCTOR || kind === skew.SymbolKind.VARIABLE_INSTANCE)) {
      context.log.syntaxErrorBadDeclarationInsideEnum(context.spanSince(token.range));
    }
  }

  symbol.annotations = annotations;
  symbol.comments = comments;
  comments = skew.parseTrailingComment(context, comments);

  if (comments !== null) {
    symbol.comments = comments;
    context.eat(skew.TokenKind.NEWLINE);
  } else if (!context.peek(skew.TokenKind.END_OF_FILE) && !context.peek(skew.TokenKind.RIGHT_BRACE) && !context.expect(skew.TokenKind.NEWLINE)) {
    return false;
  }

  return true;
};

skew.parseSymbols = function(context, parent, annotations) {
  context.eat(skew.TokenKind.NEWLINE);

  while (!context.peek(skew.TokenKind.END_OF_FILE) && !context.peek(skew.TokenKind.RIGHT_BRACE)) {
    if (!skew.parseSymbol(context, parent, annotations)) {
      break;
    }
  }
};

skew.parseFile = function(log, tokens, global) {
  var context = new skew.ParserContext(log, tokens);
  skew.parseSymbols(context, global, null);
  context.expect(skew.TokenKind.END_OF_FILE);
};

skew.parseCommaSeparatedList = function(context, stop) {
  var values = [];

  while (!context.peek(stop)) {
    if (!in_List.isEmpty$845(values)) {
      if (!context.expect(skew.TokenKind.COMMA)) {
        return null;
      }

      context.eat(skew.TokenKind.NEWLINE);
    }

    var value = skew.pratt.parse(context, skew.Precedence.LOWEST);
    in_List.append$851(values, value);

    if (value === null) {
      break;
    }
  }

  if (!context.expect(stop)) {
    return null;
  }

  return values;
};

skew.parseHexCharacter = function(c) {
  if (c >= 48 && c <= 57) {
    return c - 48;
  }

  if (c >= 65 && c <= 70) {
    return c - 65 + 10;
  }

  if (c >= 97 && c <= 102) {
    return c - 97 + 10;
  }

  return -1;
};

skew.parseStringLiteral = function(log, range) {
  var text = range.toString();
  assert(in_string.count$830(text) >= 2);
  assert(in_string.s831$831(text, 0) === 34 || in_string.s831$831(text, 0) === 39);
  assert(in_string.s831$831(text, in_string.count$830(text) - 1) === in_string.s831$831(text, 0));
  var isValidString = true;
  var builder = in_StringBuilder.$new();

  // Append long runs of unescaped characters using a single slice for speed
  var start = 1;
  var i = 1;

  while (i + 1 < in_string.count$830(text)) {
    var c = in_string.s831$831(text, i);
    i += 1;

    if (c === 92) {
      var escape = i - 1;
      in_StringBuilder.append$875(builder, text.slice(start, escape));

      if (i + 1 < in_string.count$830(text)) {
        c = in_string.s831$831(text, i);
        i += 1;

        if (c === 110) {
          in_StringBuilder.append$875(builder, "\n");
          start = i;
        } else if (c === 114) {
          in_StringBuilder.append$875(builder, "\r");
          start = i;
        } else if (c === 116) {
          in_StringBuilder.append$875(builder, "\t");
          start = i;
        } else if (c === 101) {
          in_StringBuilder.append$875(builder, "\x1B");
          start = i;
        } else if (c === 48) {
          in_StringBuilder.append$875(builder, "\0");
          start = i;
        } else if (c === 92 || c === 34 || c === 39) {
          in_StringBuilder.append$875(builder, in_string.fromCodeUnit$840(c));
          start = i;
        } else if (c === 120) {
          if (i + 1 < in_string.count$830(text)) {
            var c0 = skew.parseHexCharacter(in_string.s831$831(text, i));
            i += 1;

            if (i + 1 < in_string.count$830(text)) {
              var c1 = skew.parseHexCharacter(in_string.s831$831(text, i));
              i += 1;

              if (c0 !== -1 && c1 !== -1) {
                in_StringBuilder.append$875(builder, in_string.fromCodeUnit$840(c0 << 4 | c1));
                start = i;
              }
            }
          }
        }
      }

      if (start < i) {
        log.syntaxErrorInvalidEscapeSequence(new skew.Range(range.source, range.start + escape, range.start + i));
        isValidString = false;
      }
    }
  }

  in_StringBuilder.append$875(builder, text.slice(start, i));
  return isValidString ? new skew.StringContent(in_StringBuilder.toString$877(builder)) : null;
};

skew.parseInterpolate = function(context, left) {
  var token = context.next();
  var result = skew.parseStringLiteral(context.log, token.range);

  if (result === null) {
    return null;
  }

  // Concatentate the previous value with the string
  var middle = skew.Node.createString(result.value).withRange(token.range);

  if (left !== null) {
    middle = skew.Node.createInterpolate(left, middle).withRange(context.spanSince(left.range));
  }

  // Concatentate further values with the result
  if (context.peek(skew.TokenKind.IDENTIFIER) || context.peek(skew.TokenKind.LEFT_PARENTHESIS)) {
    var right = skew.pratt.parse(context, skew.Precedence.UNARY_PREFIX);

    if (right === null) {
      return null;
    }

    return skew.Node.createInterpolate(middle, right).withRange(context.spanSince(middle.range));
  }

  return middle;
};

skew.unaryPrefix = function(kind) {
  return function(context, token, value) {
    return skew.Node.createUnary(kind, value).withRange(skew.Range.span(token.range, value.range)).withInternalRange(token.range);
  };
};

skew.binaryInfix = function(kind) {
  return function(context, left, token, right) {
    if (kind === skew.NodeKind.ASSIGN && left.kind === skew.NodeKind.INDEX) {
      left.appendChild(right);
      left.kind = skew.NodeKind.ASSIGN_INDEX;
      return left.withRange(skew.Range.span(left.range, right.range)).withInternalRange(skew.Range.span(left.internalRange, right.range));
    }

    return skew.Node.createBinary(kind, left, right).withRange(skew.Range.span(left.range, right.range)).withInternalRange(token.range);
  };
};

skew.createExpressionParser = function() {
  var pratt = new skew.Pratt();
  pratt.literal(skew.TokenKind.DOUBLE, function(context, token) {
    return skew.Node.createDouble(skew.parseDoubleLiteral(token.range.toString())).withRange(token.range);
  });
  pratt.literal(skew.TokenKind.FALSE, skew.boolLiteral(false));
  pratt.literal(skew.TokenKind.INT, skew.intLiteral(10));
  pratt.literal(skew.TokenKind.INT_BINARY, skew.intLiteral(2));
  pratt.literal(skew.TokenKind.INT_HEX, skew.intLiteral(16));
  pratt.literal(skew.TokenKind.INT_OCTAL, skew.intLiteral(8));
  pratt.literal(skew.TokenKind.NULL, skew.tokenLiteral(skew.NodeKind.NULL));
  pratt.literal(skew.TokenKind.SUPER, skew.tokenLiteral(skew.NodeKind.SUPER));
  pratt.literal(skew.TokenKind.TRUE, skew.boolLiteral(true));
  pratt.literal(skew.TokenKind.CHARACTER, function(context, token) {
    var result = skew.parseStringLiteral(context.log, token.range);
    var codePoint = 0;

    // There must be exactly one unicode code point
    if (result !== null) {
      if (in_string.count$830(result.value) !== 1) {
        context.log.syntaxErrorInvalidCharacter(token.range);
      } else {
        codePoint = in_string.s831$831(result.value, 0);
      }
    }

    // Don't return null when there's an error because that
    // error won't affect the rest of the compilation
    return skew.Node.createInt(codePoint).withRange(token.range);
  });
  pratt.prefix(skew.TokenKind.MINUS, skew.Precedence.UNARY_PREFIX, skew.unaryPrefix(skew.NodeKind.NEGATIVE));
  pratt.prefix(skew.TokenKind.NOT, skew.Precedence.UNARY_PREFIX, skew.unaryPrefix(skew.NodeKind.NOT));
  pratt.prefix(skew.TokenKind.PLUS, skew.Precedence.UNARY_PREFIX, skew.unaryPrefix(skew.NodeKind.POSITIVE));
  pratt.prefix(skew.TokenKind.TILDE, skew.Precedence.UNARY_PREFIX, skew.unaryPrefix(skew.NodeKind.COMPLEMENT));
  pratt.infix(skew.TokenKind.BITWISE_AND, skew.Precedence.BITWISE_AND, skew.binaryInfix(skew.NodeKind.BITWISE_AND));
  pratt.infix(skew.TokenKind.BITWISE_OR, skew.Precedence.BITWISE_OR, skew.binaryInfix(skew.NodeKind.BITWISE_OR));
  pratt.infix(skew.TokenKind.BITWISE_XOR, skew.Precedence.BITWISE_XOR, skew.binaryInfix(skew.NodeKind.BITWISE_XOR));
  pratt.infix(skew.TokenKind.COMPARE, skew.Precedence.COMPARE, skew.binaryInfix(skew.NodeKind.COMPARE));
  pratt.infix(skew.TokenKind.DIVIDE, skew.Precedence.MULTIPLY, skew.binaryInfix(skew.NodeKind.DIVIDE));
  pratt.infix(skew.TokenKind.EQUAL, skew.Precedence.EQUAL, skew.binaryInfix(skew.NodeKind.EQUAL));
  pratt.infix(skew.TokenKind.GREATER_THAN, skew.Precedence.COMPARE, skew.binaryInfix(skew.NodeKind.GREATER_THAN));
  pratt.infix(skew.TokenKind.GREATER_THAN_OR_EQUAL, skew.Precedence.COMPARE, skew.binaryInfix(skew.NodeKind.GREATER_THAN_OR_EQUAL));
  pratt.infix(skew.TokenKind.IN, skew.Precedence.COMPARE, skew.binaryInfix(skew.NodeKind.IN));
  pratt.infix(skew.TokenKind.LESS_THAN, skew.Precedence.COMPARE, skew.binaryInfix(skew.NodeKind.LESS_THAN));
  pratt.infix(skew.TokenKind.LESS_THAN_OR_EQUAL, skew.Precedence.COMPARE, skew.binaryInfix(skew.NodeKind.LESS_THAN_OR_EQUAL));
  pratt.infix(skew.TokenKind.LOGICAL_AND, skew.Precedence.LOGICAL_AND, skew.binaryInfix(skew.NodeKind.LOGICAL_AND));
  pratt.infix(skew.TokenKind.LOGICAL_OR, skew.Precedence.LOGICAL_OR, skew.binaryInfix(skew.NodeKind.LOGICAL_OR));
  pratt.infix(skew.TokenKind.MINUS, skew.Precedence.ADD, skew.binaryInfix(skew.NodeKind.SUBTRACT));
  pratt.infix(skew.TokenKind.MULTIPLY, skew.Precedence.MULTIPLY, skew.binaryInfix(skew.NodeKind.MULTIPLY));
  pratt.infix(skew.TokenKind.NOT_EQUAL, skew.Precedence.EQUAL, skew.binaryInfix(skew.NodeKind.NOT_EQUAL));
  pratt.infix(skew.TokenKind.PLUS, skew.Precedence.ADD, skew.binaryInfix(skew.NodeKind.ADD));
  pratt.infix(skew.TokenKind.POWER, skew.Precedence.UNARY_PREFIX, skew.binaryInfix(skew.NodeKind.POWER));
  pratt.infix(skew.TokenKind.REMAINDER, skew.Precedence.MULTIPLY, skew.binaryInfix(skew.NodeKind.REMAINDER));
  pratt.infix(skew.TokenKind.SHIFT_LEFT, skew.Precedence.SHIFT, skew.binaryInfix(skew.NodeKind.SHIFT_LEFT));
  pratt.infix(skew.TokenKind.SHIFT_RIGHT, skew.Precedence.SHIFT, skew.binaryInfix(skew.NodeKind.SHIFT_RIGHT));
  pratt.infixRight(skew.TokenKind.ASSIGN, skew.Precedence.ASSIGN, skew.binaryInfix(skew.NodeKind.ASSIGN));
  pratt.infixRight(skew.TokenKind.ASSIGN_BITWISE_AND, skew.Precedence.ASSIGN, skew.binaryInfix(skew.NodeKind.ASSIGN_BITWISE_AND));
  pratt.infixRight(skew.TokenKind.ASSIGN_BITWISE_OR, skew.Precedence.ASSIGN, skew.binaryInfix(skew.NodeKind.ASSIGN_BITWISE_OR));
  pratt.infixRight(skew.TokenKind.ASSIGN_BITWISE_XOR, skew.Precedence.ASSIGN, skew.binaryInfix(skew.NodeKind.ASSIGN_BITWISE_XOR));
  pratt.infixRight(skew.TokenKind.ASSIGN_DIVIDE, skew.Precedence.ASSIGN, skew.binaryInfix(skew.NodeKind.ASSIGN_DIVIDE));
  pratt.infixRight(skew.TokenKind.ASSIGN_MINUS, skew.Precedence.ASSIGN, skew.binaryInfix(skew.NodeKind.ASSIGN_SUBTRACT));
  pratt.infixRight(skew.TokenKind.ASSIGN_MULTIPLY, skew.Precedence.ASSIGN, skew.binaryInfix(skew.NodeKind.ASSIGN_MULTIPLY));
  pratt.infixRight(skew.TokenKind.ASSIGN_PLUS, skew.Precedence.ASSIGN, skew.binaryInfix(skew.NodeKind.ASSIGN_ADD));
  pratt.infixRight(skew.TokenKind.ASSIGN_POWER, skew.Precedence.ASSIGN, skew.binaryInfix(skew.NodeKind.ASSIGN_POWER));
  pratt.infixRight(skew.TokenKind.ASSIGN_REMAINDER, skew.Precedence.ASSIGN, skew.binaryInfix(skew.NodeKind.ASSIGN_REMAINDER));
  pratt.infixRight(skew.TokenKind.ASSIGN_SHIFT_LEFT, skew.Precedence.ASSIGN, skew.binaryInfix(skew.NodeKind.ASSIGN_SHIFT_LEFT));
  pratt.infixRight(skew.TokenKind.ASSIGN_SHIFT_RIGHT, skew.Precedence.ASSIGN, skew.binaryInfix(skew.NodeKind.ASSIGN_SHIFT_RIGHT));
  pratt.parselet(skew.TokenKind.DOT, skew.Precedence.MEMBER).infix = skew.dotInfixParselet;
  pratt.parselet(skew.TokenKind.INDEX, skew.Precedence.LOWEST).prefix = skew.initializerParselet;
  pratt.parselet(skew.TokenKind.LEFT_BRACE, skew.Precedence.LOWEST).prefix = skew.initializerParselet;
  pratt.parselet(skew.TokenKind.LEFT_BRACKET, skew.Precedence.LOWEST).prefix = skew.initializerParselet;
  pratt.parselet(skew.TokenKind.LIST_NEW, skew.Precedence.LOWEST).prefix = skew.initializerParselet;
  pratt.parselet(skew.TokenKind.SET_NEW, skew.Precedence.LOWEST).prefix = skew.initializerParselet;
  pratt.parselet(skew.TokenKind.START_PARAMETER_LIST, skew.Precedence.MEMBER).infix = skew.parameterizedParselet;
  pratt.parselet(skew.TokenKind.STRING, skew.Precedence.UNARY_PREFIX).infix = function(context, left) {
    return skew.parseInterpolate(context, left);
  };
  pratt.parselet(skew.TokenKind.STRING, skew.Precedence.LOWEST).prefix = function(context) {
    return skew.parseInterpolate(context, null);
  };

  // Lambda expressions like "=> x"
  pratt.parselet(skew.TokenKind.ARROW, skew.Precedence.LOWEST).prefix = function(context) {
    var token = context.current();
    var symbol = new skew.FunctionSymbol(skew.SymbolKind.FUNCTION_LOCAL, "<lambda>");

    if (!skew.parseFunctionBlock(context, symbol)) {
      return null;
    }

    symbol.range = context.spanSince(token.range);
    return skew.Node.createLambda(symbol).withRange(symbol.range);
  };

  // Cast expressions
  pratt.parselet(skew.TokenKind.AS, skew.Precedence.UNARY_PREFIX).infix = function(context, left) {
    var token = context.next();
    var type = skew.parseType(context);

    if (type === null) {
      return null;
    }

    return skew.Node.createCast(left, type).withRange(context.spanSince(left.range)).withInternalRange(token.range);
  };

  // Using "." as a unary prefix operator accesses members off the inferred type
  pratt.parselet(skew.TokenKind.DOT, skew.Precedence.MEMBER).prefix = function(context) {
    var token = context.next();
    var range = context.current().range;

    if (!context.expect(skew.TokenKind.IDENTIFIER)) {
      return null;
    }

    return skew.Node.createDot(null, range.toString()).withRange(context.spanSince(token.range)).withInternalRange(range);
  };

  // Access members off of "dynamic" for untyped globals
  pratt.parselet(skew.TokenKind.DYNAMIC, skew.Precedence.LOWEST).prefix = function(context) {
    var token = context.next();

    if (!context.expect(skew.TokenKind.DOT)) {
      return null;
    }

    var range = context.current().range;

    if (!context.expect(skew.TokenKind.IDENTIFIER)) {
      return null;
    }

    return skew.Node.createDot(skew.Node.createDynamic(), range.toString()).withRange(context.spanSince(token.range)).withInternalRange(range);
  };

  // Name expressions and lambda| expressions like "x => x * x"
  pratt.parselet(skew.TokenKind.IDENTIFIER, skew.Precedence.LOWEST).prefix = function(context) {
    var range = context.next().range;
    var name = range.toString();

    if (context.peek(skew.TokenKind.ARROW)) {
      var symbol = new skew.FunctionSymbol(skew.SymbolKind.FUNCTION_LOCAL, "<lambda>");
      var argument = new skew.VariableSymbol(skew.SymbolKind.VARIABLE_LOCAL, name);
      argument.range = range;
      in_List.append$851(symbol.$arguments, argument);

      if (!skew.parseFunctionBlock(context, symbol)) {
        return null;
      }

      symbol.range = context.spanSince(range);
      return skew.Node.createLambda(symbol).withRange(symbol.range);
    }

    return skew.Node.createName(name).withRange(range);
  };

  // Index expressions
  pratt.parselet(skew.TokenKind.LEFT_BRACKET, skew.Precedence.MEMBER).infix = function(context, left) {
    var token = context.next();
    var $arguments = skew.parseCommaSeparatedList(context, skew.TokenKind.RIGHT_BRACKET);

    if ($arguments === null) {
      return null;
    }

    return skew.Node.createIndex(left, $arguments).withRange(context.spanSince(left.range)).withInternalRange(context.spanSince(token.range));
  };

  // Parenthetic groups and lambda expressions like "() => x"
  pratt.parselet(skew.TokenKind.LEFT_PARENTHESIS, skew.Precedence.LOWEST).prefix = function(context) {
    var token = context.next();

    // Try to parse a group
    if (!context.peek(skew.TokenKind.RIGHT_PARENTHESIS)) {
      var value = pratt.parse(context, skew.Precedence.LOWEST);

      if (value === null) {
        return null;
      }

      if ((value.kind !== skew.NodeKind.NAME || !skew.peekType(context)) && context.eat(skew.TokenKind.RIGHT_PARENTHESIS)) {
        if (value.kind !== skew.NodeKind.NAME || !context.peek(skew.TokenKind.ARROW)) {
          return value.withRange(context.spanSince(token.range));
        }

        context.undo();
      }

      context.undo();
    }

    // Parse a lambda instead
    var symbol = new skew.FunctionSymbol(skew.SymbolKind.FUNCTION_LOCAL, "<lambda>");

    if (!skew.parseFunctionArguments(context, symbol) || !skew.parseFunctionReturnTypeAndBlock(context, symbol)) {
      return null;
    }

    symbol.range = context.spanSince(token.range);
    return skew.Node.createLambda(symbol).withRange(symbol.range);
  };

  // Call expressions
  pratt.parselet(skew.TokenKind.LEFT_PARENTHESIS, skew.Precedence.UNARY_POSTFIX).infix = function(context, left) {
    var token = context.next();
    var $arguments = skew.parseCommaSeparatedList(context, skew.TokenKind.RIGHT_PARENTHESIS);

    if ($arguments === null) {
      return null;
    }

    return skew.Node.createCall(left, $arguments).withRange(context.spanSince(left.range)).withInternalRange(context.spanSince(token.range));
  };

  // Hook expressions
  pratt.parselet(skew.TokenKind.QUESTION_MARK, skew.Precedence.ASSIGN).infix = function(context, left) {
    context.next();
    var middle = pratt.parse(context, ((skew.Precedence.ASSIGN) | 0) - 1);

    if (middle === null || !context.expect(skew.TokenKind.COLON)) {
      return null;
    }

    var right = pratt.parse(context, ((skew.Precedence.ASSIGN) | 0) - 1);

    if (right === null) {
      return null;
    }

    return skew.Node.createHook(left, middle, right).withRange(context.spanSince(left.range));
  };
  return pratt;
};

skew.createTypeParser = function() {
  var pratt = new skew.Pratt();
  pratt.literal(skew.TokenKind.DYNAMIC, skew.tokenLiteral(skew.NodeKind.DYNAMIC));
  pratt.parselet(skew.TokenKind.DOT, skew.Precedence.MEMBER).infix = skew.dotInfixParselet;
  pratt.parselet(skew.TokenKind.START_PARAMETER_LIST, skew.Precedence.MEMBER).infix = skew.parameterizedParselet;

  // Name expressions or lambda type expressions like "fn(int) int"
  pratt.parselet(skew.TokenKind.IDENTIFIER, skew.Precedence.LOWEST).prefix = function(context) {
    var token = context.next();
    var name = token.range.toString();

    if (name !== "fn" || !context.eat(skew.TokenKind.LEFT_PARENTHESIS)) {
      return skew.Node.createName(name).withRange(token.range);
    }

    // Parse argument types
    var argTypes = [];

    while (!context.eat(skew.TokenKind.RIGHT_PARENTHESIS)) {
      if (!in_List.isEmpty$845(argTypes) && !context.expect(skew.TokenKind.COMMA)) {
        return null;
      }

      var type = skew.parseType(context);

      if (type === null) {
        return null;
      }

      in_List.append$851(argTypes, type);
    }

    var returnType = null;

    // Parse return type if present
    if (skew.peekType(context)) {
      returnType = skew.parseType(context);

      if (returnType === null) {
        return null;
      }
    }

    return skew.Node.createLambdaType(argTypes, returnType).withRange(context.spanSince(token.range));
  };
  return pratt;
};

skew.prepareTokens = function(tokens) {
  var previousKind = skew.TokenKind.NULL;
  var stack = [];
  var count = 0;

  for (var i = 0, n1850 = in_List.count$846(tokens); i < n1850; i++) {
    var token = tokens[i];

    // Skip null placeholders after tokens that start with a greater than. Each
    // token that may need to split has enough nulls after it for all the pieces.
    // It's a lot faster to remove null gaps during token preparation than to
    // insert pieces in the middle of the token stream (O(n) vs O(n^2)).
    if (token === null) {
      continue;
    }

    // Compress tokens to eliminate unused null gaps
    tokens[count] = token;
    count += 1;

    // Tokens that start with a greater than may need to be split
    var tokenKind = token.kind;
    var tokenStartsWithGreaterThan = token.firstCodeUnit() === 62;

    // Remove tokens from the stack if they aren't working out
    while (!in_List.isEmpty$845(stack)) {
      var top = in_List.last$848(stack);
      var topKind = top.kind;

      // Stop parsing a type if we find a token that no type expression uses
      if (topKind === skew.TokenKind.LESS_THAN && tokenKind !== skew.TokenKind.LESS_THAN && tokenKind !== skew.TokenKind.IDENTIFIER && tokenKind !== skew.TokenKind.COMMA && tokenKind !== skew.TokenKind.DOT && tokenKind !== skew.TokenKind.LEFT_PARENTHESIS && tokenKind !== skew.TokenKind.RIGHT_PARENTHESIS && !tokenStartsWithGreaterThan) {
        in_List.removeLast$856(stack);
      } else {
        break;
      }
    }

    // Group open
    if (tokenKind === skew.TokenKind.LEFT_PARENTHESIS || tokenKind === skew.TokenKind.LEFT_BRACE || tokenKind === skew.TokenKind.LEFT_BRACKET || tokenKind === skew.TokenKind.LESS_THAN) {
      in_List.append$851(stack, token);
    }

    // Group close
    else if (tokenKind === skew.TokenKind.RIGHT_PARENTHESIS || tokenKind === skew.TokenKind.RIGHT_BRACE || tokenKind === skew.TokenKind.RIGHT_BRACKET || tokenStartsWithGreaterThan) {
      // Search for a matching opposite token
      while (!in_List.isEmpty$845(stack)) {
        var top = in_List.last$848(stack);
        var topKind = top.kind;

        // Don't match closing angle brackets that don't work since they are just operators
        if (tokenStartsWithGreaterThan && topKind !== skew.TokenKind.LESS_THAN) {
          break;
        }

        // Consume the current token
        in_List.removeLast$856(stack);

        // Special-case angle brackets matches
        if (topKind === skew.TokenKind.LESS_THAN) {
          // Remove tentative matches that didn't work out
          if (!tokenStartsWithGreaterThan) {
            continue;
          }

          // Break apart operators that start with a closing angle bracket
          if (tokenKind !== skew.TokenKind.GREATER_THAN) {
            var range = token.range;
            var start = range.start;
            assert(i + 1 < in_List.count$846(tokens));
            assert(tokens[i + 1] === null);
            assert(tokenKind === skew.TokenKind.SHIFT_RIGHT || tokenKind === skew.TokenKind.GREATER_THAN_OR_EQUAL || tokenKind === skew.TokenKind.ASSIGN_SHIFT_RIGHT);
            tokens[i + 1] = new skew.Token(new skew.Range(range.source, start + 1, range.end), tokenKind === skew.TokenKind.SHIFT_RIGHT ? skew.TokenKind.GREATER_THAN : tokenKind === skew.TokenKind.GREATER_THAN_OR_EQUAL ? skew.TokenKind.ASSIGN : skew.TokenKind.GREATER_THAN_OR_EQUAL);
            token.range = new skew.Range(range.source, start, start + 1);
          }

          // Convert < and > into bounds for type parameter lists
          top.kind = skew.TokenKind.START_PARAMETER_LIST;
          token.kind = skew.TokenKind.END_PARAMETER_LIST;
          tokenKind = skew.TokenKind.END_PARAMETER_LIST;
        }

        // Stop the search since we found a match
        break;
      }
    }

    // Remove newlines based on the previous token or the next token to enable
    // line continuations. Make sure to be conservative. We want to be like
    // Python, not like JavaScript ASI! Anything that is at all ambiguous
    // should be disallowed.
    if (tokenKind === skew.TokenKind.NEWLINE && ((previousKind) | 0) in skew.REMOVE_NEWLINE_AFTER && !(((tokens[i + 1].kind) | 0) in skew.KEEP_NEWLINE_BEFORE)) {
      count -= 1;
      continue;
    } else if (previousKind === skew.TokenKind.NEWLINE && ((tokenKind) | 0) in skew.REMOVE_NEWLINE_BEFORE) {
      tokens[count - 2] = token;
      count -= 1;
    }

    previousKind = tokenKind;
  }

  // Trim off the remaining tokens due to null gap removal
  while (in_List.count$846(tokens) > count) {
    in_List.removeLast$856(tokens);
  }
};

skew.compile = function(log, sources, cache) {
  var global = new skew.ObjectSymbol(skew.SymbolKind.OBJECT_GLOBAL, "<global>");
  in_List.prepend$849(sources, new skew.Source("<native>", NATIVE_LIBRARY));

  for (var i1890 = 0, x1890 = sources; i1890 < x1890.length; i1890++) {
    var source = x1890[i1890];
    var tokens = skew.tokenize(log, source);
    skew.prepareTokens(tokens);
    skew.parseFile(log, tokens, global);
  }

  if (!log.hasErrors()) {
    skew.mergingPass(log, global);

    if (!log.hasErrors()) {
      skew.resolvingPass(log, global, cache);

      if (!log.hasErrors()) {
        var graph = new skew.CallGraph(global);
        skew.globalizingPass(global, graph);
        skew.motionPass(global, graph);
        skew.renamingPass(global);
      }
    }
  }

  return global;
};

skew.globalizingPass = function(global, graph) {
  for (var i1897 = 0, x1897 = graph.callInfo; i1897 < x1897.length; i1897++) {
    var info = x1897[i1897];
    var symbol = info.symbol;

    // Turn certain instance functions into global functions
    if (symbol.kind === skew.SymbolKind.FUNCTION_INSTANCE && (symbol.parent.kind === skew.SymbolKind.OBJECT_ENUM || symbol.parent.isImported() && !symbol.isImported())) {
      var $function = symbol.asFunctionSymbol();
      $function.kind = skew.SymbolKind.FUNCTION_GLOBAL;
      in_List.prepend$849($function.$arguments, $function.self);
      $function.self = null;

      // Update all call sites
      for (var i1900 = 0, x1900 = info.callSites; i1900 < x1900.length; i1900++) {
        var callSite = x1900[i1900];
        var value = callSite.callValue();
        value.dotTarget().swapWith(value);
        in_List.prepend$849(callSite.children, skew.Node.createName($function.name).withSymbol($function));
      }
    }
  }
};

skew.mergingPass = function(log, global) {
  skew.merging.mergeObject(log, null, global, global);
};

skew.motionPass = function(global, graph) {
  var parents = in_IntMap.$new();

  for (var i1956 = 0, x1956 = graph.callInfo; i1956 < x1956.length; i1956++) {
    var info = x1956[i1956];
    var symbol = info.symbol;

    // Move global functions with implementations off imported objects
    if (symbol.kind === skew.SymbolKind.FUNCTION_GLOBAL && symbol.parent.isImported() && !symbol.isImported()) {
      var $function = symbol.asFunctionSymbol();
      var parent = in_IntMap.get$823(parents, $function.parent.id, null);

      // Create a parallel namespace next to the parent
      if (parent === null) {
        var common = $function.parent.parent.asObjectSymbol();
        parent = new skew.ObjectSymbol(skew.SymbolKind.OBJECT_NAMESPACE, "in_" + $function.parent.name);
        parent.parent = common;
        in_List.append$851(common.objects, parent);
        parents[$function.parent.id] = parent;
      }

      // Move this function into that parallel namespace
      in_List.removeOne$867($function.parent.asObjectSymbol().functions, $function);
      in_List.append$851(parent.functions, $function);
      $function.parent = parent;
    }
  }
};

skew.renamingPass = function(global) {
  skew.renaming.renameObject(global);
};

skew.resolvingPass = function(log, global, cache) {
  cache.loadGlobals(log, global);

  if (!log.hasErrors()) {
    new skew.resolving.Resolver(cache, log).resolveObject(global);
  }
};

skew.Emitter = function(cache) {
  var self = this;
  self.cache = cache;
  self.indent = "";
  self._sources = [];
  self._code = "";
};

skew.Emitter.prototype.sources = function() {
  var self = this;
  return self._sources;
};

skew.Emitter.prototype.increaseIndent = function() {
  var self = this;
  self.indent += "  ";
};

skew.Emitter.prototype.decreaseIndent = function() {
  var self = this;
  self.indent = self.indent.slice(2, in_string.count$830(self.indent));
};

skew.Emitter.prototype.emit = function(text) {
  var self = this;
  self._code += text;
};

skew.Emitter.prototype.createSource = function(name) {
  var self = this;
  in_List.append$851(self._sources, new skew.Source(name, self._code));
  self._code = "";
};

skew.Emitter.prototype.sortedObjects = function(global) {
  var self = this;
  var objects = [];
  self.findObjects(objects, global);

  // Sort by inheritance and containment
  for (var i = 0, n335 = in_List.count$846(objects); i < n335; i++) {
    var j = i;

    // Select an object that comes before all other types
    while (j < in_List.count$846(objects)) {
      var object = objects[j];
      var k = i;

      // Check to see if this comes before all other types
      while (k < in_List.count$846(objects)) {
        if (j !== k && skew.Emitter.objectComesBefore(objects[k], object)) {
          break;
        }

        k += 1;
      }

      if (k === in_List.count$846(objects)) {
        break;
      }

      j += 1;
    }

    // Swap the object into the correct order
    if (j < in_List.count$846(objects)) {
      in_List.swap$858(objects, i, j);
    }
  }

  return objects;
};

skew.Emitter.prototype.findObjects = function(objects, object) {
  var self = this;
  in_List.append$851(objects, object);

  for (var i342 = 0, x342 = object.objects; i342 < x342.length; i342++) {
    var o = x342[i342];
    self.findObjects(objects, o);
  }
};

skew.Emitter.isContainedBy = function(inner, outer) {
  if (inner.parent === null) {
    return false;
  }

  if (inner.parent === outer) {
    return true;
  }

  return skew.Emitter.isContainedBy(inner.parent.asObjectSymbol(), outer);
};

skew.Emitter.objectComesBefore = function(before, after) {
  if (after.hasBaseClass(before)) {
    return true;
  }

  if (skew.Emitter.isContainedBy(after, before)) {
    return true;
  }

  return false;
};

skew.Associativity = {
  NONE: 0, 0: "NONE",
  LEFT: 1, 1: "LEFT",
  RIGHT: 2, 2: "RIGHT"
};

skew.Precedence = {
  LOWEST: 0, 0: "LOWEST",
  ASSIGN: 1, 1: "ASSIGN",
  LOGICAL_OR: 2, 2: "LOGICAL_OR",
  LOGICAL_AND: 3, 3: "LOGICAL_AND",
  BITWISE_OR: 4, 4: "BITWISE_OR",
  BITWISE_XOR: 5, 5: "BITWISE_XOR",
  BITWISE_AND: 6, 6: "BITWISE_AND",
  EQUAL: 7, 7: "EQUAL",
  COMPARE: 8, 8: "COMPARE",
  SHIFT: 9, 9: "SHIFT",
  ADD: 10, 10: "ADD",
  MULTIPLY: 11, 11: "MULTIPLY",
  UNARY_PREFIX: 12, 12: "UNARY_PREFIX",
  UNARY_POSTFIX: 13, 13: "UNARY_POSTFIX",
  MEMBER: 14, 14: "MEMBER"
};

skew.Precedence.incrementIfLeftAssociative = function(self, associativity) {
  return ((self) | 0) + (((associativity === skew.Associativity.LEFT)) | 0);
};

skew.Precedence.incrementIfRightAssociative = function(self, associativity) {
  return ((self) | 0) + (((associativity === skew.Associativity.RIGHT)) | 0);
};

skew.JsEmitter = function(cache) {
  var self = this;
  skew.Emitter.call(self, cache);
  self.previousSymbol = null;
  self.previousNode = null;
  self.prefix = "";
};

$extends(skew.JsEmitter, skew.Emitter);

skew.JsEmitter.prototype.visit$323 = function(global) {
  var self = this;
  var objects = self.sortedObjects(global);

  if (skew.JsEmitter.needsExtends(objects)) {
    self.emit(self.indent + "function $extends(derived, base) {\n");
    self.emit(self.indent + "  derived.prototype = Object.create(base.prototype);\n");
    self.emit(self.indent + "  derived.prototype.constructor = derived;\n");
    self.emit(self.indent + "}\n\n");
  }

  // Emit objects and functions
  for (var i376 = 0, x376 = objects; i376 < x376.length; i376++) {
    var object = x376[i376];
    self.emitObject(object);
  }

  // Emit variables
  for (var i377 = 0, x377 = objects; i377 < x377.length; i377++) {
    var object = x377[i377];
    var o = object;
    self.prefix = "";

    while (o.kind !== skew.SymbolKind.OBJECT_GLOBAL) {
      self.prefix = skew.JsEmitter.mangleName(o) + "." + self.prefix;
      o = o.parent.asObjectSymbol();
    }

    for (var i379 = 0, x379 = object.variables; i379 < x379.length; i379++) {
      var variable = x379[i379];
      self.emitVariable(variable);
    }
  }

  self.createSource("out.js");
};

skew.JsEmitter.prototype.emitNewlineBeforeSymbol = function(symbol) {
  var self = this;
  if (self.previousSymbol !== null && (!skew.SymbolKind.isObject(self.previousSymbol.kind) || !skew.SymbolKind.isObject(symbol.kind) || symbol.comments !== null || self.previousSymbol.kind === skew.SymbolKind.OBJECT_ENUM || symbol.kind === skew.SymbolKind.OBJECT_ENUM) && (!skew.SymbolKind.isVariable(self.previousSymbol.kind) || !skew.SymbolKind.isVariable(symbol.kind) || symbol.comments !== null)) {
    self.emit("\n");
  }

  self.previousSymbol = null;
};

skew.JsEmitter.prototype.emitNewlineAfterSymbol = function(symbol) {
  var self = this;
  self.previousSymbol = symbol;
};

skew.JsEmitter.prototype.isCompactNodeKind = function(kind) {
  var self = this;
  return kind === skew.NodeKind.EXPRESSION || kind === skew.NodeKind.VAR || skew.NodeKind.isJump(kind);
};

skew.JsEmitter.prototype.emitNewlineBeforeStatement = function(node) {
  var self = this;
  if (self.previousNode !== null && (node.comments !== null || !self.isCompactNodeKind(self.previousNode.kind) || !self.isCompactNodeKind(node.kind))) {
    self.emit("\n");
  }

  self.previousNode = null;
};

skew.JsEmitter.prototype.emitNewlineAfterStatement = function(node) {
  var self = this;
  self.previousNode = node;
};

skew.JsEmitter.prototype.emitComments = function(comments) {
  var self = this;
  if (comments !== null) {
    for (var i395 = 0, x395 = comments; i395 < x395.length; i395++) {
      var comment = x395[i395];
      self.emit(self.indent + "//" + comment);
    }
  }
};

skew.JsEmitter.prototype.emitObject = function(symbol) {
  var self = this;
  if (symbol.isImported()) {
    return;
  }

  self.prefix = symbol.parent !== null ? skew.JsEmitter.computePrefix(symbol.parent.asObjectSymbol()) : "";

  switch (symbol.kind) {
    case skew.SymbolKind.OBJECT_NAMESPACE:
    case skew.SymbolKind.OBJECT_INTERFACE: {
      self.emitNewlineBeforeSymbol(symbol);
      self.emitComments(symbol.comments);
      self.emit(self.indent + (self.prefix === "" ? "var " : self.prefix) + skew.JsEmitter.mangleName(symbol) + " = {};\n");
      self.emitNewlineAfterSymbol(symbol);
      break;
    }

    case skew.SymbolKind.OBJECT_ENUM: {
      self.emitNewlineBeforeSymbol(symbol);
      self.emitComments(symbol.comments);
      self.emit(self.indent + (self.prefix === "" ? "var " : self.prefix) + skew.JsEmitter.mangleName(symbol) + " = {");
      self.increaseIndent();
      var isFirst = true;

      for (var i399 = 0, x399 = symbol.variables; i399 < x399.length; i399++) {
        var variable = x399[i399];
        if (variable.kind === skew.SymbolKind.VARIABLE_ENUM) {
          if (isFirst) {
            isFirst = false;
          } else {
            self.emit(",");
          }

          self.emit("\n");
          self.emitNewlineBeforeSymbol(variable);
          self.emitComments(variable.comments);
          self.emit(self.indent + (skew.JsEmitter.mangleName(variable) + ": " + variable.enumValue.toString() + ", " + variable.enumValue.toString() + ": " + skew.quoteString(variable.name, 34)));
          self.emitNewlineAfterSymbol(variable);
        }
      }

      self.decreaseIndent();

      if (!isFirst) {
        self.emit("\n");
      }

      self.emit("};\n");
      self.emitNewlineAfterSymbol(symbol);
      break;
    }

    case skew.SymbolKind.OBJECT_CLASS: {
      for (var i400 = 0, x400 = symbol.functions; i400 < x400.length; i400++) {
        var $function = x400[i400];
        if ($function.kind === skew.SymbolKind.FUNCTION_CONSTRUCTOR) {
          if ($function.comments === null && symbol.comments !== null) {
            $function.comments = symbol.comments;
          }

          self.emitFunction($function);

          if (symbol.baseClass !== null) {
            self.emit("\n" + self.indent + "$extends(" + skew.JsEmitter.fullName(symbol) + ", " + skew.JsEmitter.fullName(symbol.baseClass) + ");\n");
          }
        }
      }
      break;
    }
  }

  if (symbol.kind !== skew.SymbolKind.OBJECT_GLOBAL) {
    self.prefix += skew.JsEmitter.mangleName(symbol) + ".";
  }

  for (var i401 = 0, x401 = symbol.functions; i401 < x401.length; i401++) {
    var $function = x401[i401];
    if ($function.kind !== skew.SymbolKind.FUNCTION_CONSTRUCTOR) {
      self.emitFunction($function);
    }
  }
};

skew.JsEmitter.prototype.emitArgumentList = function($arguments) {
  var self = this;
  for (var i = 0, n404 = in_List.count$846($arguments); i < n404; i++) {
    if (i > 0) {
      self.emit(", ");
    }

    self.emit(skew.JsEmitter.mangleName($arguments[i]));
  }
};

skew.JsEmitter.prototype.emitFunction = function(symbol) {
  var self = this;
  if (symbol.block === null) {
    return;
  }

  self.emitNewlineBeforeSymbol(symbol);
  self.emitComments(symbol.comments);
  var isExpression = self.prefix !== "";
  var name = skew.JsEmitter.mangleName(symbol.kind === skew.SymbolKind.FUNCTION_CONSTRUCTOR ? symbol.parent : symbol);

  if (isExpression) {
    self.emit(self.prefix + (symbol.kind === skew.SymbolKind.FUNCTION_INSTANCE ? "prototype." : "") + name + " = function(");
  } else {
    self.emit("function " + name + "(");
  }

  self.emitArgumentList(symbol.$arguments);
  self.emit(") {\n");
  self.increaseIndent();

  if (symbol.self !== null) {
    self.emit(self.indent + "var " + skew.JsEmitter.mangleName(symbol.self) + " = this;\n");
  }

  self.emitStatements(symbol.block.children);
  self.decreaseIndent();
  self.emit(self.indent + "}" + (isExpression ? ";\n" : "\n"));
  self.emitNewlineAfterSymbol(symbol);
};

skew.JsEmitter.prototype.emitVariable = function(symbol) {
  var self = this;
  if (symbol.isImported()) {
    return;
  }

  if (symbol.kind !== skew.SymbolKind.VARIABLE_INSTANCE && (symbol.value !== null || self.prefix === "")) {
    self.emitNewlineBeforeSymbol(symbol);
    self.emitComments(symbol.comments);
    self.emit(self.indent + (self.prefix === "" || symbol.kind === skew.SymbolKind.VARIABLE_LOCAL ? "var " : self.prefix) + skew.JsEmitter.mangleName(symbol));

    if (symbol.value !== null) {
      self.emit(" = ");
      self.emitExpression(symbol.value, skew.Precedence.LOWEST);
    }

    self.emit(";\n");
    self.emitNewlineAfterSymbol(symbol);
  }
};

skew.JsEmitter.prototype.emitStatements = function(statements) {
  var self = this;
  self.previousNode = null;

  for (var i413 = 0, x413 = statements; i413 < x413.length; i413++) {
    var statement = x413[i413];
    self.emitNewlineBeforeStatement(statement);
    self.emitComments(statement.comments);
    self.emitStatement(statement);
    self.emitNewlineAfterStatement(statement);
  }

  self.previousNode = null;
};

skew.JsEmitter.prototype.emitBlock = function(node) {
  var self = this;
  self.emit(" {\n");
  self.increaseIndent();
  self.emitStatements(node.children);
  self.decreaseIndent();
  self.emit(self.indent + "}");
};

skew.JsEmitter.prototype.emitStatement = function(node) {
  var self = this;
  switch (node.kind) {
    case skew.NodeKind.VAR: {
      self.emitVariable(node.symbol.asVariableSymbol());
      break;
    }

    case skew.NodeKind.EXPRESSION: {
      self.emit(self.indent);
      self.emitExpression(node.expressionValue(), skew.Precedence.LOWEST);
      self.emit(";\n");
      break;
    }

    case skew.NodeKind.BREAK: {
      self.emit(self.indent + "break;\n");
      break;
    }

    case skew.NodeKind.CONTINUE: {
      self.emit(self.indent + "continue;\n");
      break;
    }

    case skew.NodeKind.IMPLICIT_RETURN:
    case skew.NodeKind.RETURN: {
      self.emit(self.indent + "return");
      var value = node.returnValue();

      if (value !== null) {
        self.emit(" ");
        self.emitExpression(value, skew.Precedence.LOWEST);
      }

      self.emit(";\n");
      break;
    }

    case skew.NodeKind.FOR: {
      var value = node.forValue();
      var name = skew.JsEmitter.mangleName(node.symbol);

      if (value.kind === skew.NodeKind.PAIR) {
        var limit = "n" + node.symbol.id.toString();
        self.emit(self.indent + "for (var " + name + " = ");
        self.emitExpression(value.firstValue(), skew.Precedence.LOWEST);
        self.emit(", " + limit + " = ");
        self.emitExpression(value.secondValue(), skew.Precedence.LOWEST);
        self.emit("; " + name + " < " + limit + "; " + name + "++");
        self.emit(")");
        self.emitBlock(node.forBlock());
        self.emit("\n");
      } else if (self.cache.isList(value.resolvedType)) {
        var id = node.symbol.id;
        var index = "i" + id.toString();
        var list = "x" + id.toString();
        self.emit(self.indent + "for (var " + index + " = 0, " + list + " = ");
        self.emitExpression(value, skew.Precedence.LOWEST);
        self.emit("; " + index + " < " + list + ".length; " + index + "++) {\n");
        self.increaseIndent();
        self.emit(self.indent + "var " + name + " = " + list + "[" + index + "];\n");
        self.emitStatements(node.forBlock().children);
        self.decreaseIndent();
        self.emit(self.indent + "}\n");
      } else {
        self.emit(self.indent + "for (var " + name + " in ");
        self.emitExpression(value, skew.Precedence.LOWEST);
        self.emit(")");
        self.emitBlock(node.forBlock());
        self.emit("\n");
      }
      break;
    }

    case skew.NodeKind.IF: {
      self.emit(self.indent);
      self.emitIf(node);
      self.emit("\n");
      break;
    }

    case skew.NodeKind.SWITCH: {
      var cases = node.children;
      self.emit(self.indent + "switch (");
      self.emitExpression(node.switchValue(), skew.Precedence.LOWEST);
      self.emit(") {\n");
      self.increaseIndent();

      for (var i = 1, n426 = in_List.count$846(cases); i < n426; i++) {
        var child = cases[i];
        var values = child.children;

        if (i !== 1) {
          self.emit("\n");
        }

        if (in_List.count$846(values) === 1) {
          self.emit(self.indent + "default:");
        } else {
          for (var j = 1, n429 = in_List.count$846(values); j < n429; j++) {
            if (j !== 1) {
              self.emit("\n");
            }

            self.emit(self.indent + "case ");
            self.emitExpression(values[j], skew.Precedence.LOWEST);
            self.emit(":");
          }
        }

        self.emit(" {\n");
        self.increaseIndent();
        self.emitStatements(child.caseBlock().children);
        self.emit(self.indent + "break;\n");
        self.decreaseIndent();
        self.emit(self.indent + "}\n");
      }

      self.decreaseIndent();
      self.emit(self.indent + "}\n");
      break;
    }

    case skew.NodeKind.WHILE: {
      self.emit(self.indent + "while (");
      self.emitExpression(node.whileTest(), skew.Precedence.LOWEST);
      self.emit(")");
      self.emitBlock(node.whileBlock());
      self.emit("\n");
      break;
    }

    default: {
      assert(false);
      break;
    }
  }
};

skew.JsEmitter.prototype.emitIf = function(node) {
  var self = this;
  self.emit("if (");
  self.emitExpression(node.ifTest(), skew.Precedence.LOWEST);
  self.emit(")");
  self.emitBlock(node.ifTrue());
  var block = node.ifFalse();

  if (block !== null) {
    var singleIf = in_List.count$846(block.children) === 1 && block.children[0].kind === skew.NodeKind.IF ? block.children[0] : null;

    if (block.comments !== null || singleIf !== null && singleIf.comments !== null) {
      self.emit("\n\n");
      self.emitComments(block.comments);

      if (singleIf !== null) {
        self.emitComments(singleIf.comments);
      }

      self.emit(self.indent + "else");
    } else {
      self.emit(" else");
    }

    if (singleIf !== null) {
      self.emit(" ");
      self.emitIf(singleIf);
    } else {
      self.emitBlock(block);
    }
  }
};

skew.JsEmitter.prototype.emitExpression = function(node, precedence) {
  var self = this;
  switch (node.kind) {
    case skew.NodeKind.TYPE: {
      self.emit(skew.JsEmitter.fullName(node.resolvedType.symbol));
      break;
    }

    case skew.NodeKind.NULL: {
      self.emit("null");
      break;
    }

    case skew.NodeKind.NAME: {
      self.emit(node.symbol !== null ? skew.JsEmitter.fullName(node.symbol) : node.asString());
      break;
    }

    case skew.NodeKind.DOT: {
      self.emitExpression(node.dotTarget(), skew.Precedence.MEMBER);
      self.emit("." + (node.symbol !== null ? skew.JsEmitter.mangleName(node.symbol) : node.asString()));
      break;
    }

    case skew.NodeKind.CONSTANT: {
      var value = node.content;

      switch (value.kind$474()) {
        case skew.ContentKind.BOOL: {
          self.emit(value.asBool().toString());
          break;
        }

        case skew.ContentKind.INT: {
          self.emit(value.asInt().toString());
          break;
        }

        case skew.ContentKind.DOUBLE: {
          self.emit(value.asDouble().toString());
          break;
        }

        case skew.ContentKind.STRING: {
          self.emit(skew.quoteString(value.asString(), 34));
          break;
        }
      }
      break;
    }

    case skew.NodeKind.CALL: {
      var value = node.callValue();
      var $call = value.kind === skew.NodeKind.SUPER;
      var wrap = value.kind === skew.NodeKind.LAMBDA && node.parent !== null && node.parent.kind === skew.NodeKind.EXPRESSION;

      if (wrap) {
        self.emit("(");
      }

      if (!$call && node.symbol !== null && node.symbol.kind === skew.SymbolKind.FUNCTION_CONSTRUCTOR) {
        self.emit("new " + skew.JsEmitter.fullName(node.symbol));
      } else {
        self.emitExpression(value, skew.Precedence.UNARY_POSTFIX);

        if ($call) {
          self.emit(".call");
        }
      }

      if (wrap) {
        self.emit(")");
      }

      self.emit("(");

      if ($call) {
        self.emit(skew.JsEmitter.mangleName(node.symbol.asFunctionSymbol().self));
      }

      for (var i = 1, n441 = in_List.count$846(node.children); i < n441; i++) {
        if ($call || i > 1) {
          self.emit(", ");
        }

        self.emitExpression(node.children[i], skew.Precedence.LOWEST);
      }

      self.emit(")");
      break;
    }

    case skew.NodeKind.INITIALIZER_LIST:
    case skew.NodeKind.INITIALIZER_MAP:
    case skew.NodeKind.INITIALIZER_SET: {
      var useBraces = node.kind === skew.NodeKind.INITIALIZER_MAP || node.kind === skew.NodeKind.INITIALIZER_SET && in_List.isEmpty$845(node.children);
      self.emit(useBraces ? "{" : "[");

      for (var i = 0, n443 = in_List.count$846(node.children); i < n443; i++) {
        if (i !== 0) {
          self.emit(", ");
        }

        self.emitExpression(node.children[i], skew.Precedence.LOWEST);
      }

      self.emit(useBraces ? "}" : "]");
      break;
    }

    case skew.NodeKind.PAIR: {
      self.emitExpression(node.firstValue(), skew.Precedence.LOWEST);
      self.emit(": ");
      self.emitExpression(node.secondValue(), skew.Precedence.LOWEST);
      break;
    }

    case skew.NodeKind.INDEX: {
      self.emitExpression(node.children[0], skew.Precedence.UNARY_POSTFIX);
      self.emit("[");

      for (var i = 1, n444 = in_List.count$846(node.children); i < n444; i++) {
        if (i > 1) {
          self.emit(", ");
        }

        self.emitExpression(node.children[i], skew.Precedence.LOWEST);
      }

      self.emit("]");
      break;
    }

    case skew.NodeKind.ASSIGN_INDEX: {
      if (((skew.Precedence.ASSIGN) | 0) < ((precedence) | 0)) {
        self.emit("(");
      }

      self.emitExpression(in_List.first$847(node.children), skew.Precedence.UNARY_POSTFIX);
      self.emit("[");

      for (var i = 1, n445 = in_List.count$846(node.children) - 1; i < n445; i++) {
        if (i > 1) {
          self.emit(", ");
        }

        self.emitExpression(node.children[i], skew.Precedence.LOWEST);
      }

      self.emit("] = ");
      self.emitExpression(in_List.last$848(node.children), skew.Precedence.LOWEST);

      if (((skew.Precedence.ASSIGN) | 0) < ((precedence) | 0)) {
        self.emit(")");
      }
      break;
    }

    case skew.NodeKind.CAST: {
      var value = node.castValue();
      var from = value.resolvedType;
      var to = node.resolvedType;

      if (from.isEnum() && to === self.cache.stringType) {
        self.emit(skew.JsEmitter.fullName(from.symbol) + "[");
        self.emitExpression(value, precedence);
        self.emit("]");
      } else if (from === self.cache.stringType && to.isEnum()) {
        self.emit(skew.JsEmitter.fullName(to.symbol) + "[");
        self.emitExpression(value, precedence);
        self.emit("]");
      }

      // TODO: Do this better
      else if (to === self.cache.intType) {
        self.emit("((");
        self.emitExpression(value, precedence);
        self.emit(") | 0)");
      } else {
        self.emitExpression(value, precedence);
      }
      break;
    }

    case skew.NodeKind.PARAMETERIZE: {
      self.emitExpression(node.parameterizeValue(), precedence);
      break;
    }

    case skew.NodeKind.SUPER: {
      self.emit(skew.JsEmitter.fullName(node.symbol));
      break;
    }

    case skew.NodeKind.HOOK: {
      if (((skew.Precedence.ASSIGN) | 0) < ((precedence) | 0)) {
        self.emit("(");
      }

      self.emitExpression(node.hookTest(), skew.Precedence.LOGICAL_OR);
      self.emit(" ? ");
      self.emitExpression(node.hookTrue(), skew.Precedence.ASSIGN);
      self.emit(" : ");
      self.emitExpression(node.hookFalse(), skew.Precedence.ASSIGN);

      if (((skew.Precedence.ASSIGN) | 0) < ((precedence) | 0)) {
        self.emit(")");
      }
      break;
    }

    case skew.NodeKind.LAMBDA: {
      var symbol = node.symbol.asFunctionSymbol();
      self.emit("function(");
      self.emitArgumentList(symbol.$arguments);
      self.emit(")");
      self.emitBlock(symbol.block);
      break;
    }

    default: {
      if (skew.NodeKind.isUnary(node.kind)) {
        var value = node.unaryValue();
        var info = skew.operatorInfo[((node.kind) | 0)];

        if (((info.precedence) | 0) < ((precedence) | 0)) {
          self.emit("(");
        }

        self.emit(info.text);
        self.emitExpression(value, info.precedence);

        if (((info.precedence) | 0) < ((precedence) | 0)) {
          self.emit(")");
        }
      }

      // TODO: Remove hack
      else if (node.kind === skew.NodeKind.DIVIDE && node.resolvedType === self.cache.intType) {
        self.emit("((");
        self.emitExpression(node.binaryLeft(), skew.Precedence.LOWEST);
        self.emit(") / (");
        self.emitExpression(node.binaryRight(), skew.Precedence.LOWEST);
        self.emit(") | 0)");
      } else if (skew.NodeKind.isBinary(node.kind)) {
        var info = skew.operatorInfo[((node.kind) | 0)];

        if (((info.precedence) | 0) < ((precedence) | 0)) {
          self.emit("(");
        }

        self.emitExpression(node.binaryLeft(), skew.Precedence.incrementIfRightAssociative(info.precedence, info.associativity));
        self.emit(node.kind === skew.NodeKind.EQUAL ? " === " : node.kind === skew.NodeKind.NOT_EQUAL ? " !== " : " " + info.text + " ");
        self.emitExpression(node.binaryRight(), skew.Precedence.incrementIfLeftAssociative(info.precedence, info.associativity));

        if (((info.precedence) | 0) < ((precedence) | 0)) {
          self.emit(")");
        }
      } else {
        assert(false);
      }
      break;
    }
  }
};

skew.JsEmitter.fullName = function(symbol) {
  var parent = symbol.parent;

  if (parent !== null && parent.kind !== skew.SymbolKind.OBJECT_GLOBAL) {
    var enclosingName = skew.JsEmitter.fullName(parent);

    if (symbol.kind === skew.SymbolKind.FUNCTION_CONSTRUCTOR) {
      return enclosingName;
    }

    if (symbol.kind === skew.SymbolKind.FUNCTION_INSTANCE) {
      enclosingName += ".prototype";
    }

    return enclosingName + "." + skew.JsEmitter.mangleName(symbol);
  }

  return skew.JsEmitter.mangleName(symbol);
};

skew.JsEmitter.mangleName = function(symbol) {
  if (symbol.kind === skew.SymbolKind.FUNCTION_CONSTRUCTOR) {
    return skew.JsEmitter.mangleName(symbol.parent);
  }

  if (symbol.isImportedOrExported()) {
    return symbol.name;
  }

  if (symbol.name in skew.JsEmitter.isKeyword) {
    return "$" + symbol.name;
  }

  if (skew.SymbolKind.isFunction(symbol.kind)) {
    var $function = symbol.asFunctionSymbol();

    if ($function.overridden !== null) {
      return skew.JsEmitter.mangleName($function.overridden);
    }

    if ($function.overloaded !== null) {
      return symbol.name + "$" + symbol.id.toString();
    }
  }

  return symbol.name;
};

skew.JsEmitter.needsExtends = function(objects) {
  for (var i464 = 0, x464 = objects; i464 < x464.length; i464++) {
    var object = x464[i464];
    if (!object.isImported() && object.baseClass !== null) {
      return true;
    }
  }

  return false;
};

skew.JsEmitter.computePrefix = function(symbol) {
  assert(skew.SymbolKind.isObject(symbol.kind));
  return symbol.kind === skew.SymbolKind.OBJECT_GLOBAL ? "" : skew.JsEmitter.computePrefix(symbol.parent.asObjectSymbol()) + skew.JsEmitter.mangleName(symbol) + ".";
};

skew.ContentKind = {
  BOOL: 0, 0: "BOOL",
  INT: 1, 1: "INT",
  DOUBLE: 2, 2: "DOUBLE",
  STRING: 3, 3: "STRING"
};

skew.Content = function() {
  var self = this;
};

skew.Content.prototype.asBool = function() {
  var self = this;
  assert(self.kind$474() === skew.ContentKind.BOOL);
  return self.value;
};

skew.Content.prototype.asInt = function() {
  var self = this;
  assert(self.kind$474() === skew.ContentKind.INT);
  return self.value;
};

skew.Content.prototype.asDouble = function() {
  var self = this;
  assert(self.kind$474() === skew.ContentKind.DOUBLE);
  return self.value;
};

skew.Content.prototype.asString = function() {
  var self = this;
  assert(self.kind$474() === skew.ContentKind.STRING);
  return self.value;
};

skew.BoolContent = function(value) {
  var self = this;
  skew.Content.call(self);
  self.value = value;
};

$extends(skew.BoolContent, skew.Content);

skew.BoolContent.prototype.kind$474 = function() {
  var self = this;
  return skew.ContentKind.BOOL;
};

skew.IntContent = function(value) {
  var self = this;
  skew.Content.call(self);
  self.value = value;
};

$extends(skew.IntContent, skew.Content);

skew.IntContent.prototype.kind$474 = function() {
  var self = this;
  return skew.ContentKind.INT;
};

skew.DoubleContent = function(value) {
  var self = this;
  skew.Content.call(self);
  self.value = value;
};

$extends(skew.DoubleContent, skew.Content);

skew.DoubleContent.prototype.kind$474 = function() {
  var self = this;
  return skew.ContentKind.DOUBLE;
};

skew.StringContent = function(value) {
  var self = this;
  skew.Content.call(self);
  self.value = value;
};

$extends(skew.StringContent, skew.Content);

skew.StringContent.prototype.kind$474 = function() {
  var self = this;
  return skew.ContentKind.STRING;
};

skew.NodeKind = {
  // Other
  ANNOTATION: 0, 0: "ANNOTATION",
  BLOCK: 1, 1: "BLOCK",
  CASE: 2, 2: "CASE",

  // Statements
  BREAK: 3, 3: "BREAK",
  CONTINUE: 4, 4: "CONTINUE",
  EXPRESSION: 5, 5: "EXPRESSION",
  FOR: 6, 6: "FOR",
  IF: 7, 7: "IF",
  IMPLICIT_RETURN: 8, 8: "IMPLICIT_RETURN",
  RETURN: 9, 9: "RETURN",
  SWITCH: 10, 10: "SWITCH",
  VAR: 11, 11: "VAR",
  WHILE: 12, 12: "WHILE",

  // Expressions
  ASSIGN_INDEX: 13, 13: "ASSIGN_INDEX",
  CALL: 14, 14: "CALL",
  CAST: 15, 15: "CAST",
  CONSTANT: 16, 16: "CONSTANT",
  DOT: 17, 17: "DOT",
  DYNAMIC: 18, 18: "DYNAMIC",
  HOOK: 19, 19: "HOOK",
  INDEX: 20, 20: "INDEX",
  INITIALIZER_LIST: 21, 21: "INITIALIZER_LIST",
  INITIALIZER_MAP: 22, 22: "INITIALIZER_MAP",
  INITIALIZER_SET: 23, 23: "INITIALIZER_SET",
  INTERPOLATE: 24, 24: "INTERPOLATE",
  LAMBDA: 25, 25: "LAMBDA",
  LAMBDA_TYPE: 26, 26: "LAMBDA_TYPE",
  NAME: 27, 27: "NAME",
  NULL: 28, 28: "NULL",
  PAIR: 29, 29: "PAIR",
  PARAMETERIZE: 30, 30: "PARAMETERIZE",
  SUPER: 31, 31: "SUPER",
  TYPE: 32, 32: "TYPE",

  // Unary operators
  COMPLEMENT: 33, 33: "COMPLEMENT",
  POSITIVE: 34, 34: "POSITIVE",
  NEGATIVE: 35, 35: "NEGATIVE",
  NOT: 36, 36: "NOT",

  // Binary operators
  ADD: 37, 37: "ADD",
  BITWISE_AND: 38, 38: "BITWISE_AND",
  BITWISE_OR: 39, 39: "BITWISE_OR",
  BITWISE_XOR: 40, 40: "BITWISE_XOR",
  COMPARE: 41, 41: "COMPARE",
  DIVIDE: 42, 42: "DIVIDE",
  EQUAL: 43, 43: "EQUAL",
  IN: 44, 44: "IN",
  LOGICAL_AND: 45, 45: "LOGICAL_AND",
  LOGICAL_OR: 46, 46: "LOGICAL_OR",
  MULTIPLY: 47, 47: "MULTIPLY",
  NOT_EQUAL: 48, 48: "NOT_EQUAL",
  POWER: 49, 49: "POWER",
  REMAINDER: 50, 50: "REMAINDER",
  SHIFT_LEFT: 51, 51: "SHIFT_LEFT",
  SHIFT_RIGHT: 52, 52: "SHIFT_RIGHT",
  SUBTRACT: 53, 53: "SUBTRACT",

  // Binary comparison operators
  GREATER_THAN: 54, 54: "GREATER_THAN",
  GREATER_THAN_OR_EQUAL: 55, 55: "GREATER_THAN_OR_EQUAL",
  LESS_THAN: 56, 56: "LESS_THAN",
  LESS_THAN_OR_EQUAL: 57, 57: "LESS_THAN_OR_EQUAL",

  // Binary assigment operators
  ASSIGN: 58, 58: "ASSIGN",
  ASSIGN_ADD: 59, 59: "ASSIGN_ADD",
  ASSIGN_BITWISE_AND: 60, 60: "ASSIGN_BITWISE_AND",
  ASSIGN_BITWISE_OR: 61, 61: "ASSIGN_BITWISE_OR",
  ASSIGN_BITWISE_XOR: 62, 62: "ASSIGN_BITWISE_XOR",
  ASSIGN_DIVIDE: 63, 63: "ASSIGN_DIVIDE",
  ASSIGN_MULTIPLY: 64, 64: "ASSIGN_MULTIPLY",
  ASSIGN_POWER: 65, 65: "ASSIGN_POWER",
  ASSIGN_REMAINDER: 66, 66: "ASSIGN_REMAINDER",
  ASSIGN_SHIFT_LEFT: 67, 67: "ASSIGN_SHIFT_LEFT",
  ASSIGN_SHIFT_RIGHT: 68, 68: "ASSIGN_SHIFT_RIGHT",
  ASSIGN_SUBTRACT: 69, 69: "ASSIGN_SUBTRACT"
};

skew.NodeKind.isStatement = function(self) {
  return ((self) | 0) >= ((skew.NodeKind.ASSIGN) | 0) && ((self) | 0) <= ((skew.NodeKind.WHILE) | 0);
};

skew.NodeKind.isExpression = function(self) {
  return ((self) | 0) >= ((skew.NodeKind.ASSIGN_INDEX) | 0) && ((self) | 0) <= ((skew.NodeKind.ASSIGN_SUBTRACT) | 0);
};

skew.NodeKind.isInitializer = function(self) {
  return ((self) | 0) >= ((skew.NodeKind.INITIALIZER_LIST) | 0) && ((self) | 0) <= ((skew.NodeKind.INITIALIZER_SET) | 0);
};

skew.NodeKind.isUnary = function(self) {
  return ((self) | 0) >= ((skew.NodeKind.COMPLEMENT) | 0) && ((self) | 0) <= ((skew.NodeKind.NOT) | 0);
};

skew.NodeKind.isBinary = function(self) {
  return ((self) | 0) >= ((skew.NodeKind.ADD) | 0) && ((self) | 0) <= ((skew.NodeKind.ASSIGN_SUBTRACT) | 0);
};

skew.NodeKind.isBinaryAssign = function(self) {
  return ((self) | 0) >= ((skew.NodeKind.ASSIGN) | 0) && ((self) | 0) <= ((skew.NodeKind.ASSIGN_SUBTRACT) | 0);
};

skew.NodeKind.isBinaryComparison = function(self) {
  return ((self) | 0) >= ((skew.NodeKind.GREATER_THAN) | 0) && ((self) | 0) <= ((skew.NodeKind.LESS_THAN_OR_EQUAL) | 0);
};

skew.NodeKind.isJump = function(self) {
  return self === skew.NodeKind.BREAK || self === skew.NodeKind.CONTINUE || self === skew.NodeKind.IMPLICIT_RETURN || self === skew.NodeKind.RETURN;
};

// Nodes represent executable code (variable initializers and function bodies)
skew.Node = function(kind) {
  var self = this;
  self.kind = kind;
  self.range = null;
  self.internalRange = null;
  self.symbol = null;
  self.parent = null;
  self.content = null;
  self.resolvedType = null;
  self.comments = null;
  self.children = [];
};

// Change self node in place to become the provided node. The parent node is
// not changed, so become() can be called within a nested method and does not
// need to report the updated node reference to the caller since the reference
// does not change.
skew.Node.prototype.become = function(node) {
  var self = this;
  self.kind = node.kind;
  self.range = node.range;
  self.internalRange = node.internalRange;
  self.symbol = node.symbol;
  self.content = node.content;
  self.resolvedType = node.resolvedType;
  self.comments = node.comments;
  self.removeChildren();
  self.withChildren(node.removeChildren());
};

skew.Node.prototype.withType = function(value) {
  var self = this;
  self.resolvedType = value;
  return self;
};

skew.Node.prototype.withSymbol = function(value) {
  var self = this;
  self.symbol = value;
  return self;
};

skew.Node.prototype.withContent = function(value) {
  var self = this;
  self.content = value;
  return self;
};

skew.Node.prototype.withRange = function(value) {
  var self = this;
  self.range = value;
  return self;
};

skew.Node.prototype.withInternalRange = function(value) {
  var self = this;
  self.internalRange = value;
  return self;
};

skew.Node.prototype.withChildren = function(nodes) {
  var self = this;
  assert(in_List.isEmpty$845(self.children));

  for (var i595 = 0, x595 = nodes; i595 < x595.length; i595++) {
    var node = x595[i595];
    skew.Node.updateParent(node, self);
  }

  self.children = nodes;
  return self;
};

skew.Node.prototype.internalRangeOrRange = function() {
  var self = this;
  return self.internalRange !== null ? self.internalRange : self.range;
};

skew.Node.prototype.indexInParent = function() {
  var self = this;
  assert(self.parent !== null);
  return self.parent.children.indexOf(self);
};

skew.Node.prototype.insertChild = function(index, node) {
  var self = this;
  assert(index >= 0 && index <= in_List.count$846(self.children));
  skew.Node.updateParent(node, self);
  in_List.insert$862(self.children, index, node);
};

skew.Node.prototype.appendChild = function(node) {
  var self = this;
  self.insertChild(in_List.count$846(self.children), node);
};

skew.Node.prototype.removeChildAtIndex = function(index) {
  var self = this;
  assert(index >= 0 && index < in_List.count$846(self.children));
  var child = self.children[index];
  skew.Node.updateParent(child, null);
  in_List.removeAt$865(self.children, index);
  return child;
};

skew.Node.prototype.remove = function() {
  var self = this;
  self.parent.removeChildAtIndex(self.indexInParent());
  return self;
};

skew.Node.prototype.removeChildren = function() {
  var self = this;
  var result = self.children;

  for (var i609 = 0, x609 = self.children; i609 < x609.length; i609++) {
    var child = x609[i609];
    skew.Node.updateParent(child, null);
  }

  self.children = [];
  return result;
};

skew.Node.prototype.replaceChild = function(index, node) {
  var self = this;
  assert(index >= 0 && index < in_List.count$846(self.children));
  skew.Node.updateParent(node, self);
  var child = self.children[index];
  skew.Node.updateParent(child, null);
  self.children[index] = node;
  return child;
};

skew.Node.prototype.replaceWithNull = function() {
  var self = this;
  self.parent.replaceChild(self.indexInParent(), null);
  return self;
};

skew.Node.prototype.swapWith = function(node) {
  var self = this;
  var parentA = self.parent;
  var parentB = node.parent;
  var indexA = self.indexInParent();
  var indexB = node.indexInParent();
  parentA.children[indexA] = node;
  parentB.children[indexB] = self;
  self.parent = parentB;
  node.parent = parentA;
};

skew.Node.updateParent = function(node, parent) {
  if (node !== null) {
    assert(node.parent === null !== (parent === null));
    node.parent = parent;
  }
};

skew.Node.prototype.isTrue = function() {
  var self = this;
  return self.kind === skew.NodeKind.CONSTANT && self.content.kind$474() === skew.ContentKind.BOOL && self.content.asBool();
};

skew.Node.prototype.isFalse = function() {
  var self = this;
  return self.kind === skew.NodeKind.CONSTANT && self.content.kind$474() === skew.ContentKind.BOOL && !self.content.asBool();
};

skew.Node.prototype.isType = function() {
  var self = this;
  return self.kind === skew.NodeKind.TYPE || self.kind === skew.NodeKind.LAMBDA_TYPE || (self.kind === skew.NodeKind.NAME || self.kind === skew.NodeKind.DOT || self.kind === skew.NodeKind.PARAMETERIZE) && self.symbol !== null && skew.SymbolKind.isType(self.symbol.kind);
};

skew.Node.prototype.blockAlwaysEndsWithReturn = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.BLOCK);

  if (in_List.isEmpty$845(self.children)) {
    return false;
  }

  for (var i = 0, n630 = in_List.count$846(self.children); i < n630; i++) {
    var child = self.children[in_List.count$846(self.children) - i - 1];

    switch (child.kind) {
      case skew.NodeKind.RETURN:
      case skew.NodeKind.IMPLICIT_RETURN: {
        return true;
        break;
      }

      case skew.NodeKind.IF: {
        var trueBlock = child.ifTrue();
        var falseBlock = child.ifFalse();

        if (falseBlock !== null && trueBlock.blockAlwaysEndsWithReturn() && falseBlock.blockAlwaysEndsWithReturn()) {
          return true;
        }
        break;
      }
    }
  }

  return false;
};

skew.Node.createAnnotation = function(value, test) {
  assert(skew.NodeKind.isExpression(value.kind));
  assert(test === null || skew.NodeKind.isExpression(test.kind));
  return new skew.Node(skew.NodeKind.ANNOTATION).withChildren([value, test]);
};

skew.Node.createBlock = function(statements) {
  return new skew.Node(skew.NodeKind.BLOCK).withChildren(statements);
};

skew.Node.createCase = function(values, block) {
  assert(block.kind === skew.NodeKind.BLOCK);
  in_List.prepend$849(values, block);
  return new skew.Node(skew.NodeKind.CASE).withChildren(values);
};

skew.Node.createBreak = function() {
  return new skew.Node(skew.NodeKind.BREAK);
};

skew.Node.createContinue = function() {
  return new skew.Node(skew.NodeKind.CONTINUE);
};

skew.Node.createExpression = function(value) {
  assert(skew.NodeKind.isExpression(value.kind));
  return new skew.Node(skew.NodeKind.EXPRESSION).withChildren([value]);
};

skew.Node.createFor = function(symbol, value, block) {
  assert(skew.NodeKind.isExpression(value.kind));
  assert(block.kind === skew.NodeKind.BLOCK);
  return new skew.Node(skew.NodeKind.FOR).withSymbol(symbol).withChildren([value, block]);
};

skew.Node.createIf = function(test, trueBlock, falseBlock) {
  assert(skew.NodeKind.isExpression(test.kind));
  assert(trueBlock.kind === skew.NodeKind.BLOCK);
  assert(falseBlock === null || falseBlock.kind === skew.NodeKind.BLOCK);
  return new skew.Node(skew.NodeKind.IF).withChildren([test, trueBlock, falseBlock]);
};

skew.Node.createReturn = function(value) {
  assert(value === null || skew.NodeKind.isExpression(value.kind));
  return new skew.Node(skew.NodeKind.RETURN).withChildren([value]);
};

skew.Node.createSwitch = function(value, cases) {
  assert(skew.NodeKind.isExpression(value.kind));
  in_List.prepend$849(cases, value);
  return new skew.Node(skew.NodeKind.SWITCH).withChildren(cases);
};

skew.Node.createImplicitReturn = function(value) {
  assert(skew.NodeKind.isExpression(value.kind));
  return new skew.Node(skew.NodeKind.IMPLICIT_RETURN).withChildren([value]);
};

skew.Node.createVar = function(symbol) {
  return new skew.Node(skew.NodeKind.VAR).withSymbol(symbol);
};

skew.Node.createWhile = function(test, block) {
  return new skew.Node(skew.NodeKind.WHILE).withChildren([test, block]);
};

skew.Node.createAssignIndex = function(target, $arguments, value) {
  assert(skew.NodeKind.isExpression(target.kind));
  assert(skew.NodeKind.isExpression(value.kind));
  in_List.prepend$849($arguments, target);
  in_List.append$851($arguments, value);
  return new skew.Node(skew.NodeKind.ASSIGN_INDEX).withChildren($arguments);
};

skew.Node.createIndex = function(target, $arguments) {
  assert(skew.NodeKind.isExpression(target.kind));
  in_List.prepend$849($arguments, target);
  return new skew.Node(skew.NodeKind.INDEX).withChildren($arguments);
};

skew.Node.createCall = function(target, $arguments) {
  assert(skew.NodeKind.isExpression(target.kind));
  in_List.prepend$849($arguments, target);
  return new skew.Node(skew.NodeKind.CALL).withChildren($arguments);
};

skew.Node.createCast = function(value, type) {
  assert(skew.NodeKind.isExpression(value.kind));
  assert(skew.NodeKind.isExpression(type.kind));
  return new skew.Node(skew.NodeKind.CAST).withChildren([value, type]);
};

skew.Node.createBool = function(value) {
  return skew.Node.createConstant(new skew.BoolContent(value));
};

skew.Node.createInt = function(value) {
  return skew.Node.createConstant(new skew.IntContent(value));
};

skew.Node.createDouble = function(value) {
  return skew.Node.createConstant(new skew.DoubleContent(value));
};

skew.Node.createString = function(value) {
  return skew.Node.createConstant(new skew.StringContent(value));
};

skew.Node.createConstant = function(value) {
  return new skew.Node(skew.NodeKind.CONSTANT).withContent(value);
};

skew.Node.createDot = function(target, name) {
  return new skew.Node(skew.NodeKind.DOT).withContent(new skew.StringContent(name)).withChildren([target]);
};

skew.Node.createHook = function(test, trueValue, falseValue) {
  assert(skew.NodeKind.isExpression(test.kind));
  assert(skew.NodeKind.isExpression(trueValue.kind));
  assert(skew.NodeKind.isExpression(falseValue.kind));
  return new skew.Node(skew.NodeKind.HOOK).withChildren([test, trueValue, falseValue]);
};

skew.Node.createList = function(values) {
  return new skew.Node(skew.NodeKind.INITIALIZER_LIST).withChildren(values);
};

skew.Node.createInitializer = function(kind, values) {
  assert(skew.NodeKind.isInitializer(kind));
  return new skew.Node(kind).withChildren(values);
};

skew.Node.createInterpolate = function(left, right) {
  return new skew.Node(skew.NodeKind.INTERPOLATE).withChildren([left, right]);
};

skew.Node.createLambda = function(symbol) {
  return new skew.Node(skew.NodeKind.LAMBDA).withSymbol(symbol);
};

skew.Node.createName = function(text) {
  return new skew.Node(skew.NodeKind.NAME).withContent(new skew.StringContent(text));
};

skew.Node.createDynamic = function() {
  return new skew.Node(skew.NodeKind.DYNAMIC);
};

skew.Node.createNull = function() {
  return new skew.Node(skew.NodeKind.NULL);
};

skew.Node.createPair = function(first, second) {
  assert(skew.NodeKind.isExpression(first.kind));
  assert(skew.NodeKind.isExpression(second.kind));
  return new skew.Node(skew.NodeKind.PAIR).withChildren([first, second]);
};

skew.Node.createParameterize = function(type, parameters) {
  assert(skew.NodeKind.isExpression(type.kind));
  in_List.prepend$849(parameters, type);
  return new skew.Node(skew.NodeKind.PARAMETERIZE).withChildren(parameters);
};

skew.Node.createSuper = function() {
  return new skew.Node(skew.NodeKind.SUPER);
};

skew.Node.createType = function(type) {
  return new skew.Node(skew.NodeKind.TYPE).withType(type);
};

skew.Node.createUnary = function(kind, value) {
  assert(skew.NodeKind.isUnary(kind));
  assert(skew.NodeKind.isExpression(value.kind));
  return new skew.Node(kind).withChildren([value]);
};

skew.Node.createBinary = function(kind, left, right) {
  assert(skew.NodeKind.isBinary(kind));
  assert(skew.NodeKind.isExpression(left.kind));
  assert(skew.NodeKind.isExpression(right.kind));
  return new skew.Node(kind).withChildren([left, right]);
};

skew.Node.createLambdaType = function(argTypes, returnType) {
  in_List.append$851(argTypes, returnType);
  return new skew.Node(skew.NodeKind.LAMBDA_TYPE).withChildren(argTypes);
};

skew.Node.prototype.asString = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.NAME || self.kind === skew.NodeKind.DOT);
  return self.content.asString();
};

skew.Node.prototype.firstValue = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.PAIR);
  assert(in_List.count$846(self.children) === 2);
  assert(skew.NodeKind.isExpression(self.children[0].kind));
  return self.children[0];
};

skew.Node.prototype.secondValue = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.PAIR);
  assert(in_List.count$846(self.children) === 2);
  assert(skew.NodeKind.isExpression(self.children[1].kind));
  return self.children[1];
};

skew.Node.prototype.dotTarget = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.DOT);
  assert(in_List.count$846(self.children) === 1);
  assert(self.children[0] === null || skew.NodeKind.isExpression(self.children[0].kind));
  return self.children[0];
};

skew.Node.prototype.annotationValue = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.ANNOTATION);
  assert(in_List.count$846(self.children) === 2);
  assert(skew.NodeKind.isExpression(self.children[0].kind));
  return self.children[0];
};

skew.Node.prototype.annotationTest = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.ANNOTATION);
  assert(in_List.count$846(self.children) === 2);
  assert(self.children[1] === null || skew.NodeKind.isExpression(self.children[1].kind));
  return self.children[1];
};

skew.Node.prototype.caseBlock = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.CASE);
  assert(in_List.count$846(self.children) >= 1);
  assert(self.children[0].kind === skew.NodeKind.BLOCK);
  return self.children[0];
};

skew.Node.prototype.expressionValue = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.EXPRESSION);
  assert(in_List.count$846(self.children) === 1);
  assert(skew.NodeKind.isExpression(self.children[0].kind));
  return self.children[0];
};

skew.Node.prototype.returnValue = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.RETURN || self.kind === skew.NodeKind.IMPLICIT_RETURN);
  assert(in_List.count$846(self.children) === 1);
  assert(self.children[0] === null || skew.NodeKind.isExpression(self.children[0].kind));
  return self.children[0];
};

skew.Node.prototype.switchValue = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.SWITCH);
  assert(in_List.count$846(self.children) >= 1);
  assert(skew.NodeKind.isExpression(self.children[0].kind));
  return self.children[0];
};

skew.Node.prototype.parameterizeValue = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.PARAMETERIZE);
  assert(in_List.count$846(self.children) >= 1);
  assert(skew.NodeKind.isExpression(self.children[0].kind));
  return self.children[0];
};

skew.Node.prototype.callValue = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.CALL);
  assert(in_List.count$846(self.children) >= 1);
  assert(skew.NodeKind.isExpression(self.children[0].kind));
  return self.children[0];
};

skew.Node.prototype.indexValue = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.INDEX);
  assert(in_List.count$846(self.children) >= 1);
  assert(skew.NodeKind.isExpression(self.children[0].kind));
  return self.children[0];
};

skew.Node.prototype.castValue = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.CAST);
  assert(in_List.count$846(self.children) === 2);
  assert(skew.NodeKind.isExpression(self.children[0].kind));
  return self.children[0];
};

skew.Node.prototype.castType = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.CAST);
  assert(in_List.count$846(self.children) === 2);
  assert(skew.NodeKind.isExpression(self.children[1].kind));
  return self.children[1];
};

skew.Node.prototype.unaryValue = function() {
  var self = this;
  assert(skew.NodeKind.isUnary(self.kind));
  assert(in_List.count$846(self.children) === 1);
  assert(skew.NodeKind.isExpression(self.children[0].kind));
  return self.children[0];
};

skew.Node.prototype.binaryLeft = function() {
  var self = this;
  assert(skew.NodeKind.isBinary(self.kind));
  assert(in_List.count$846(self.children) === 2);
  assert(skew.NodeKind.isExpression(self.children[0].kind));
  return self.children[0];
};

skew.Node.prototype.binaryRight = function() {
  var self = this;
  assert(skew.NodeKind.isBinary(self.kind));
  assert(in_List.count$846(self.children) === 2);
  assert(skew.NodeKind.isExpression(self.children[1].kind));
  return self.children[1];
};

skew.Node.prototype.interpolateLeft = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.INTERPOLATE);
  assert(in_List.count$846(self.children) === 2);
  assert(skew.NodeKind.isExpression(self.children[0].kind));
  return self.children[0];
};

skew.Node.prototype.interpolateRight = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.INTERPOLATE);
  assert(in_List.count$846(self.children) === 2);
  assert(skew.NodeKind.isExpression(self.children[1].kind));
  return self.children[1];
};

skew.Node.prototype.whileTest = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.WHILE);
  assert(in_List.count$846(self.children) === 2);
  assert(skew.NodeKind.isExpression(self.children[0].kind));
  return self.children[0];
};

skew.Node.prototype.whileBlock = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.WHILE);
  assert(in_List.count$846(self.children) === 2);
  assert(self.children[1].kind === skew.NodeKind.BLOCK);
  return self.children[1];
};

skew.Node.prototype.forValue = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.FOR);
  assert(in_List.count$846(self.children) === 2);
  assert(skew.NodeKind.isExpression(self.children[0].kind));
  return self.children[0];
};

skew.Node.prototype.forBlock = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.FOR);
  assert(in_List.count$846(self.children) === 2);
  assert(self.children[1].kind === skew.NodeKind.BLOCK);
  return self.children[1];
};

skew.Node.prototype.ifTest = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.IF);
  assert(in_List.count$846(self.children) === 3);
  assert(skew.NodeKind.isExpression(self.children[0].kind));
  return self.children[0];
};

skew.Node.prototype.ifTrue = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.IF);
  assert(in_List.count$846(self.children) === 3);
  assert(self.children[1].kind === skew.NodeKind.BLOCK);
  return self.children[1];
};

skew.Node.prototype.ifFalse = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.IF);
  assert(in_List.count$846(self.children) === 3);
  assert(self.children[2] === null || self.children[2].kind === skew.NodeKind.BLOCK);
  return self.children[2];
};

skew.Node.prototype.hookTest = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.HOOK);
  assert(in_List.count$846(self.children) === 3);
  assert(skew.NodeKind.isExpression(self.children[0].kind));
  return self.children[0];
};

skew.Node.prototype.hookTrue = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.HOOK);
  assert(in_List.count$846(self.children) === 3);
  assert(skew.NodeKind.isExpression(self.children[1].kind));
  return self.children[1];
};

skew.Node.prototype.hookFalse = function() {
  var self = this;
  assert(self.kind === skew.NodeKind.HOOK);
  assert(in_List.count$846(self.children) === 3);
  assert(skew.NodeKind.isExpression(self.children[2].kind));
  return self.children[2];
};

skew.OperatorInfo = function(text, precedence, associativity, kind, count) {
  var self = this;
  self.text = text;
  self.precedence = precedence;
  self.associativity = associativity;
  self.kind = kind;
  self.count = count;
};

skew.ArgumentCount = {
  ONE: 0, 0: "ONE",
  ONE_OR_MORE: 1, 1: "ONE_OR_MORE",
  ONE_OR_TWO: 2, 2: "ONE_OR_TWO",
  TWO_OR_FEWER: 3, 3: "TWO_OR_FEWER",
  TWO_OR_MORE: 4, 4: "TWO_OR_MORE",
  ZERO: 5, 5: "ZERO",
  ZERO_OR_MORE: 6, 6: "ZERO_OR_MORE",
  ZERO_OR_ONE: 7, 7: "ZERO_OR_ONE"
};

skew.OperatorKind = {
  FIXED: 0, 0: "FIXED",
  OVERRIDABLE: 1, 1: "OVERRIDABLE"
};

skew.SymbolKind = {
  NONE: 0, 0: "NONE",
  PARAMETER_FUNCTION: 1, 1: "PARAMETER_FUNCTION",
  PARAMETER_OBJECT: 2, 2: "PARAMETER_OBJECT",
  OBJECT_CLASS: 3, 3: "OBJECT_CLASS",
  OBJECT_ENUM: 4, 4: "OBJECT_ENUM",
  OBJECT_GLOBAL: 5, 5: "OBJECT_GLOBAL",
  OBJECT_INTERFACE: 6, 6: "OBJECT_INTERFACE",
  OBJECT_NAMESPACE: 7, 7: "OBJECT_NAMESPACE",
  FUNCTION_ANNOTATION: 8, 8: "FUNCTION_ANNOTATION",
  FUNCTION_CONSTRUCTOR: 9, 9: "FUNCTION_CONSTRUCTOR",
  FUNCTION_GLOBAL: 10, 10: "FUNCTION_GLOBAL",
  FUNCTION_INSTANCE: 11, 11: "FUNCTION_INSTANCE",
  FUNCTION_LOCAL: 12, 12: "FUNCTION_LOCAL",
  OVERLOADED_GLOBAL: 13, 13: "OVERLOADED_GLOBAL",
  OVERLOADED_INSTANCE: 14, 14: "OVERLOADED_INSTANCE",
  VARIABLE_ENUM: 15, 15: "VARIABLE_ENUM",
  VARIABLE_GLOBAL: 16, 16: "VARIABLE_GLOBAL",
  VARIABLE_INSTANCE: 17, 17: "VARIABLE_INSTANCE",
  VARIABLE_LOCAL: 18, 18: "VARIABLE_LOCAL"
};

skew.SymbolKind.isType = function(self) {
  return ((self) | 0) >= ((skew.SymbolKind.PARAMETER_FUNCTION) | 0) && ((self) | 0) <= ((skew.SymbolKind.OBJECT_NAMESPACE) | 0);
};

skew.SymbolKind.isParameter = function(self) {
  return ((self) | 0) >= ((skew.SymbolKind.PARAMETER_FUNCTION) | 0) && ((self) | 0) <= ((skew.SymbolKind.PARAMETER_OBJECT) | 0);
};

skew.SymbolKind.isObject = function(self) {
  return ((self) | 0) >= ((skew.SymbolKind.OBJECT_CLASS) | 0) && ((self) | 0) <= ((skew.SymbolKind.OBJECT_NAMESPACE) | 0);
};

skew.SymbolKind.isFunction = function(self) {
  return ((self) | 0) >= ((skew.SymbolKind.FUNCTION_ANNOTATION) | 0) && ((self) | 0) <= ((skew.SymbolKind.FUNCTION_LOCAL) | 0);
};

skew.SymbolKind.isOverloadedFunction = function(self) {
  return ((self) | 0) >= ((skew.SymbolKind.OVERLOADED_GLOBAL) | 0) && ((self) | 0) <= ((skew.SymbolKind.OVERLOADED_INSTANCE) | 0);
};

skew.SymbolKind.isFunctionOrOverloadedFunction = function(self) {
  return ((self) | 0) >= ((skew.SymbolKind.FUNCTION_ANNOTATION) | 0) && ((self) | 0) <= ((skew.SymbolKind.OVERLOADED_INSTANCE) | 0);
};

skew.SymbolKind.isVariable = function(self) {
  return ((self) | 0) >= ((skew.SymbolKind.VARIABLE_ENUM) | 0) && ((self) | 0) <= ((skew.SymbolKind.VARIABLE_LOCAL) | 0);
};

skew.SymbolKind.isOverloadableFunction = function(self) {
  return ((self) | 0) >= ((skew.SymbolKind.FUNCTION_CONSTRUCTOR) | 0) && ((self) | 0) <= ((skew.SymbolKind.FUNCTION_INSTANCE) | 0);
};

skew.SymbolKind.isGlobalReference = function(self) {
  return self === skew.SymbolKind.VARIABLE_ENUM || self === skew.SymbolKind.VARIABLE_GLOBAL || self === skew.SymbolKind.FUNCTION_GLOBAL || self === skew.SymbolKind.FUNCTION_CONSTRUCTOR || self === skew.SymbolKind.OVERLOADED_GLOBAL || skew.SymbolKind.isType(self);
};

skew.SymbolKind.hasInstances = function(self) {
  return self === skew.SymbolKind.OBJECT_CLASS || self === skew.SymbolKind.OBJECT_ENUM || self === skew.SymbolKind.OBJECT_INTERFACE;
};

skew.SymbolKind.isOnInstances = function(self) {
  return self === skew.SymbolKind.FUNCTION_INSTANCE || self === skew.SymbolKind.VARIABLE_INSTANCE || self === skew.SymbolKind.OVERLOADED_INSTANCE;
};

skew.SymbolState = {
  UNINITIALIZED: 0, 0: "UNINITIALIZED",
  INITIALIZING: 1, 1: "INITIALIZING",
  INITIALIZED: 2, 2: "INITIALIZED"
};

skew.Symbol = function(kind, name) {
  var self = this;
  self.id = skew.Symbol.createID();
  self.kind = kind;
  self.name = name;
  self.range = null;
  self.parent = null;
  self.resolvedType = null;
  self.scope = null;
  self.state = skew.SymbolState.UNINITIALIZED;
  self.annotations = null;
  self.comments = null;
  self.flags = 0;
};

// Flags
skew.Symbol.prototype.isAutomaticallyGenerated = function() {
  var self = this;
  return (self.flags & skew.Symbol.IS_AUTOMATICALLY_GENERATED) !== 0;
};

skew.Symbol.prototype.isConst = function() {
  var self = this;
  return (self.flags & skew.Symbol.IS_CONST) !== 0;
};

skew.Symbol.prototype.isGetter = function() {
  var self = this;
  return (self.flags & skew.Symbol.IS_GETTER) !== 0;
};

skew.Symbol.prototype.shouldInferReturnType = function() {
  var self = this;
  return (self.flags & skew.Symbol.SHOULD_INFER_RETURN_TYPE) !== 0;
};

skew.Symbol.prototype.isOver = function() {
  var self = this;
  return (self.flags & skew.Symbol.IS_OVER) !== 0;
};

skew.Symbol.prototype.isSetter = function() {
  var self = this;
  return (self.flags & skew.Symbol.IS_SETTER) !== 0;
};

skew.Symbol.prototype.isValueType = function() {
  var self = this;
  return (self.flags & skew.Symbol.IS_VALUE_TYPE) !== 0;
};

// Modifiers
skew.Symbol.prototype.isExported = function() {
  var self = this;
  return (self.flags & skew.Symbol.IS_EXPORTED) !== 0;
};

skew.Symbol.prototype.isImported = function() {
  var self = this;
  return (self.flags & skew.Symbol.IS_IMPORTED) !== 0;
};

skew.Symbol.prototype.isPreferred = function() {
  var self = this;
  return (self.flags & skew.Symbol.IS_PREFERRED) !== 0;
};

skew.Symbol.prototype.isPrivate = function() {
  var self = this;
  return (self.flags & skew.Symbol.IS_PRIVATE) !== 0;
};

skew.Symbol.prototype.isProtected = function() {
  var self = this;
  return (self.flags & skew.Symbol.IS_PROTECTED) !== 0;
};

skew.Symbol.prototype.isRenamed = function() {
  var self = this;
  return (self.flags & skew.Symbol.IS_RENAMED) !== 0;
};

skew.Symbol.prototype.isSkipped = function() {
  var self = this;
  return (self.flags & skew.Symbol.IS_SKIPPED) !== 0;
};

// Combinations
skew.Symbol.prototype.isPrivateOrProtected = function() {
  var self = this;
  return (self.flags & (skew.Symbol.IS_PRIVATE | skew.Symbol.IS_PROTECTED)) !== 0;
};

skew.Symbol.prototype.isImportedOrExported = function() {
  var self = this;
  return (self.flags & (skew.Symbol.IS_IMPORTED | skew.Symbol.IS_EXPORTED)) !== 0;
};

skew.Symbol.prototype.asParameterSymbol = function() {
  var self = this;
  assert(skew.SymbolKind.isParameter(self.kind));
  return self;
};

skew.Symbol.prototype.asObjectSymbol = function() {
  var self = this;
  assert(skew.SymbolKind.isObject(self.kind));
  return self;
};

skew.Symbol.prototype.asFunctionSymbol = function() {
  var self = this;
  assert(skew.SymbolKind.isFunction(self.kind));
  return self;
};

skew.Symbol.prototype.asOverloadedFunctionSymbol = function() {
  var self = this;
  assert(skew.SymbolKind.isOverloadedFunction(self.kind));
  return self;
};

skew.Symbol.prototype.asVariableSymbol = function() {
  var self = this;
  assert(skew.SymbolKind.isVariable(self.kind));
  return self;
};

skew.Symbol.prototype.fullName = function() {
  var self = this;
  if (self.parent !== null && self.parent.kind !== skew.SymbolKind.OBJECT_GLOBAL && !skew.SymbolKind.isParameter(self.kind)) {
    return self.parent.fullName() + "." + self.name;
  }

  return self.name;
};

skew.Symbol.createID = function() {
  skew.Symbol.nextID += 1;
  return skew.Symbol.nextID;
};

skew.ParameterSymbol = function(kind, name) {
  var self = this;
  skew.Symbol.call(self, kind, name);
};

$extends(skew.ParameterSymbol, skew.Symbol);

skew.ObjectSymbol = function(kind, name) {
  var self = this;
  skew.Symbol.call(self, kind, name);
  self.base = null;
  self.baseClass = null;
  self.members = in_StringMap.$new();
  self.objects = [];
  self.functions = [];
  self.variables = [];
  self.parameters = null;
};

$extends(skew.ObjectSymbol, skew.Symbol);

skew.ObjectSymbol.prototype.hasBaseClass = function(symbol) {
  var self = this;
  return self.baseClass !== null && (self.baseClass === symbol || self.baseClass.hasBaseClass(symbol));
};

skew.FunctionSymbol = function(kind, name) {
  var self = this;
  skew.Symbol.call(self, kind, name);
  self.overridden = null;
  self.overloaded = null;
  self.parameters = null;
  self.$arguments = [];
  self.self = null;
  self.argumentOnlyType = null;
  self.returnType = null;
  self.block = null;
};

$extends(skew.FunctionSymbol, skew.Symbol);

skew.VariableSymbol = function(kind, name) {
  var self = this;
  skew.Symbol.call(self, kind, name);
  self.type = null;
  self.value = null;
  self.enumValue = 0;
};

$extends(skew.VariableSymbol, skew.Symbol);

skew.OverloadedFunctionSymbol = function(kind, name, symbols) {
  var self = this;
  skew.Symbol.call(self, kind, name);
  self.overridden = null;
  self.symbols = symbols;
};

$extends(skew.OverloadedFunctionSymbol, skew.Symbol);

skew.TokenKind = {
  ANNOTATION: 0, 0: "ANNOTATION",
  ARROW: 1, 1: "ARROW",
  AS: 2, 2: "AS",
  ASSIGN: 3, 3: "ASSIGN",
  ASSIGN_BITWISE_AND: 4, 4: "ASSIGN_BITWISE_AND",
  ASSIGN_BITWISE_OR: 5, 5: "ASSIGN_BITWISE_OR",
  ASSIGN_BITWISE_XOR: 6, 6: "ASSIGN_BITWISE_XOR",
  ASSIGN_DIVIDE: 7, 7: "ASSIGN_DIVIDE",
  ASSIGN_INDEX: 8, 8: "ASSIGN_INDEX",
  ASSIGN_MINUS: 9, 9: "ASSIGN_MINUS",
  ASSIGN_MULTIPLY: 10, 10: "ASSIGN_MULTIPLY",
  ASSIGN_PLUS: 11, 11: "ASSIGN_PLUS",
  ASSIGN_POWER: 12, 12: "ASSIGN_POWER",
  ASSIGN_REMAINDER: 13, 13: "ASSIGN_REMAINDER",
  ASSIGN_SHIFT_LEFT: 14, 14: "ASSIGN_SHIFT_LEFT",
  ASSIGN_SHIFT_RIGHT: 15, 15: "ASSIGN_SHIFT_RIGHT",
  BITWISE_AND: 16, 16: "BITWISE_AND",
  BITWISE_OR: 17, 17: "BITWISE_OR",
  BITWISE_XOR: 18, 18: "BITWISE_XOR",
  BREAK: 19, 19: "BREAK",
  CASE: 20, 20: "CASE",
  CHARACTER: 21, 21: "CHARACTER",
  CLASS: 22, 22: "CLASS",
  COLON: 23, 23: "COLON",
  COMMA: 24, 24: "COMMA",
  COMMENT: 25, 25: "COMMENT",
  COMPARE: 26, 26: "COMPARE",
  CONST: 27, 27: "CONST",
  CONTINUE: 28, 28: "CONTINUE",
  DEF: 29, 29: "DEF",
  DEFAULT: 30, 30: "DEFAULT",
  DIVIDE: 31, 31: "DIVIDE",
  DOT: 32, 32: "DOT",
  DOT_DOT: 33, 33: "DOT_DOT",
  DOUBLE: 34, 34: "DOUBLE",
  DYNAMIC: 35, 35: "DYNAMIC",
  ELSE: 36, 36: "ELSE",
  END_OF_FILE: 37, 37: "END_OF_FILE",
  ENUM: 38, 38: "ENUM",
  EQUAL: 39, 39: "EQUAL",
  ERROR: 40, 40: "ERROR",
  FALSE: 41, 41: "FALSE",
  FOR: 42, 42: "FOR",
  GREATER_THAN: 43, 43: "GREATER_THAN",
  GREATER_THAN_OR_EQUAL: 44, 44: "GREATER_THAN_OR_EQUAL",
  IDENTIFIER: 45, 45: "IDENTIFIER",
  IF: 46, 46: "IF",
  IN: 47, 47: "IN",
  INDEX: 48, 48: "INDEX",
  INT: 49, 49: "INT",
  INTERFACE: 50, 50: "INTERFACE",
  INT_BINARY: 51, 51: "INT_BINARY",
  INT_HEX: 52, 52: "INT_HEX",
  INT_OCTAL: 53, 53: "INT_OCTAL",
  IS: 54, 54: "IS",
  LEFT_BRACE: 55, 55: "LEFT_BRACE",
  LEFT_BRACKET: 56, 56: "LEFT_BRACKET",
  LEFT_PARENTHESIS: 57, 57: "LEFT_PARENTHESIS",
  LESS_THAN: 58, 58: "LESS_THAN",
  LESS_THAN_OR_EQUAL: 59, 59: "LESS_THAN_OR_EQUAL",
  LIST: 60, 60: "LIST",
  LIST_NEW: 61, 61: "LIST_NEW",
  LOGICAL_AND: 62, 62: "LOGICAL_AND",
  LOGICAL_OR: 63, 63: "LOGICAL_OR",
  MINUS: 64, 64: "MINUS",
  MULTIPLY: 65, 65: "MULTIPLY",
  NAMESPACE: 66, 66: "NAMESPACE",
  NEWLINE: 67, 67: "NEWLINE",
  NOT: 68, 68: "NOT",
  NOT_EQUAL: 69, 69: "NOT_EQUAL",
  NULL: 70, 70: "NULL",
  OVER: 71, 71: "OVER",
  PLUS: 72, 72: "PLUS",
  POWER: 73, 73: "POWER",
  QUESTION_MARK: 74, 74: "QUESTION_MARK",
  REMAINDER: 75, 75: "REMAINDER",
  RETURN: 76, 76: "RETURN",
  RIGHT_BRACE: 77, 77: "RIGHT_BRACE",
  RIGHT_BRACKET: 78, 78: "RIGHT_BRACKET",
  RIGHT_PARENTHESIS: 79, 79: "RIGHT_PARENTHESIS",
  SET: 80, 80: "SET",
  SET_NEW: 81, 81: "SET_NEW",
  SHIFT_LEFT: 82, 82: "SHIFT_LEFT",
  SHIFT_RIGHT: 83, 83: "SHIFT_RIGHT",
  STRING: 84, 84: "STRING",
  SUPER: 85, 85: "SUPER",
  SWITCH: 86, 86: "SWITCH",
  TILDE: 87, 87: "TILDE",
  TRUE: 88, 88: "TRUE",
  VAR: 89, 89: "VAR",
  WHILE: 90, 90: "WHILE",
  WHITESPACE: 91, 91: "WHITESPACE",
  YY_INVALID_ACTION: 92, 92: "YY_INVALID_ACTION",

  // Token kinds not used by flex
  START_PARAMETER_LIST: 93, 93: "START_PARAMETER_LIST",
  END_PARAMETER_LIST: 94, 94: "END_PARAMETER_LIST"
};

skew.DiagnosticKind = {
  ERROR: 0, 0: "ERROR",
  WARNING: 1, 1: "WARNING"
};

skew.Diagnostic = function(kind, range, text) {
  var self = this;
  self.kind = kind;
  self.range = range;
  self.text = text;
  self.noteRange = null;
  self.noteText = "";
};

skew.Diagnostic.format = function(kind, range, text) {
  if (range === null) {
    return kind + ": " + text + "\n";
  }

  var formatted = range.format(0);
  return range.locationString() + ": " + kind + ": " + text + "\n" + formatted.line + "\n" + formatted.range + "\n";
};

skew.Log = function() {
  var self = this;
  self.diagnostics = [];
  self.warningCount = 0;
  self.errorCount = 0;
};

skew.Log.prototype.toString = function() {
  var self = this;
  var builder = in_StringBuilder.$new();

  // Emit the log assuming an infinite terminal width
  for (var i1137 = 0, x1137 = self.diagnostics; i1137 < x1137.length; i1137++) {
    var diagnostic = x1137[i1137];
    in_StringBuilder.append$875(builder, skew.Diagnostic.format(diagnostic.kind === skew.DiagnosticKind.ERROR ? "error" : "warning", diagnostic.range, diagnostic.text));

    // Append notes after the diagnostic they apply to
    if (diagnostic.noteRange !== null) {
      in_StringBuilder.append$875(builder, skew.Diagnostic.format("note", diagnostic.noteRange, diagnostic.noteText));
    }
  }

  return in_StringBuilder.toString$877(builder);
};

skew.Log.prototype.isEmpty = function() {
  var self = this;
  return in_List.isEmpty$845(self.diagnostics);
};

skew.Log.prototype.hasErrors = function() {
  var self = this;
  return self.errorCount !== 0;
};

skew.Log.prototype.hasWarnings = function() {
  var self = this;
  return self.warningCount !== 0;
};

skew.Log.prototype.error = function(range, text) {
  var self = this;
  in_List.append$851(self.diagnostics, new skew.Diagnostic(skew.DiagnosticKind.ERROR, range, text));
  self.errorCount += 1;
};

skew.Log.prototype.warning = function(range, text) {
  var self = this;
  in_List.append$851(self.diagnostics, new skew.Diagnostic(skew.DiagnosticKind.WARNING, range, text));
  self.warningCount += 1;
};

skew.Log.prototype.note = function(range, text) {
  var self = this;
  var last = in_List.last$848(self.diagnostics);
  last.noteRange = range;
  last.noteText = text;
};

skew.Log.prototype.syntaxErrorInvalidEscapeSequence = function(range) {
  var self = this;
  self.error(range, "Invalid escape sequence");
};

skew.Log.prototype.syntaxErrorInvalidCharacter = function(range) {
  var self = this;
  self.error(range, "Invalid character literal");
};

skew.Log.prototype.syntaxErrorExtraData = function(range, text) {
  var self = this;
  self.error(range, "Syntax error \"" + text + "\"");
};

skew.Log.prototype.syntaxErrorUnexpectedToken = function(token) {
  var self = this;
  self.error(token.range, "Unexpected " + skew.TokenKind[token.kind]);
};

skew.Log.prototype.syntaxErrorExpectedToken = function(range, found, expected) {
  var self = this;
  self.error(range, "Expected " + skew.TokenKind[expected] + " but found " + skew.TokenKind[found]);
};

skew.Log.prototype.syntaxErrorEmptyFunctionParentheses = function(range) {
  var self = this;
  self.error(range, "Functions without arguments do not use parentheses");
};

skew.Log.prototype.semanticErrorComparisonOperatorNotNumeric = function(range) {
  var self = this;
  self.error(range, "The comparison operator must have a numeric return type");
};

skew.Log.prototype.syntaxErrorBadDeclarationInsideEnum = function(range) {
  var self = this;
  self.error(range, "Cannot use this declaration inside an enum");
};

skew.Log.expectedCountText = function(singular, expected, found) {
  return "Expected " + expected.toString() + " " + singular + (prettyPrint.plural(expected) + " but found " + found.toString() + " " + singular) + prettyPrint.plural(found);
};

skew.Log.formatArgumentTypes = function(types) {
  if (types === null) {
    return "";
  }

  var names = [];

  for (var i1179 = 0, x1179 = types; i1179 < x1179.length; i1179++) {
    var type = x1179[i1179];
    in_List.append$851(names, type.toString());
  }

  return " of type" + prettyPrint.plural(in_List.count$846(types)) + " " + prettyPrint.join(names, "and");
};

skew.Log.prototype.semanticWarningUnusedExpression = function(range) {
  var self = this;
  self.warning(range, "Unused expression");
};

skew.Log.prototype.semanticErrorDuplicateSymbol = function(range, name, previous) {
  var self = this;
  self.error(range, "\"" + name + "\" is already declared");

  if (previous !== null) {
    self.note(previous, "The previous declaration is here");
  }
};

skew.Log.prototype.semanticErrorShadowedSymbol = function(range, name, previous) {
  var self = this;
  self.error(range, "\"" + name + "\" shadows a previous declaration");

  if (previous !== null) {
    self.note(previous, "The previous declaration is here");
  }
};

skew.Log.prototype.semanticErrorDuplicateTypeParameters = function(range, name, previous) {
  var self = this;
  self.error(range, "\"" + name + "\" already has type parameters");

  if (previous !== null) {
    self.note(previous, "Type parameters were previously declared here");
  }
};

skew.Log.prototype.semanticErrorDuplicateBaseType = function(range, name, previous) {
  var self = this;
  self.error(range, "\"" + name + "\" already has a base type");

  if (previous !== null) {
    self.note(previous, "The previous base type is here");
  }
};

skew.Log.prototype.semanticErrorCyclicDeclaration = function(range, name) {
  var self = this;
  self.error(range, "Cyclic declaration of \"" + name + "\"");
};

skew.Log.prototype.semanticErrorUndeclaredSymbol = function(range, name) {
  var self = this;
  self.error(range, "\"" + name + "\" is not declared");
};

skew.Log.prototype.semanticErrorUnknownMemberSymbol = function(range, name, type) {
  var self = this;
  self.error(range, "\"" + name + "\" is not declared on type \"" + type.toString() + "\"");
};

skew.Log.prototype.semanticErrorVarMissingType = function(range, name) {
  var self = this;
  self.error(range, "Unable to determine the type of \"" + name + "\"");
};

skew.Log.prototype.semanticErrorVarMissingValue = function(range, name) {
  var self = this;
  self.error(range, "The implicitly typed variable \"" + name + "\" must be initialized");
};

skew.Log.prototype.semanticErrorConstMissingValue = function(range, name) {
  var self = this;
  self.error(range, "The constant \"" + name + "\" must be initialized");
};

skew.Log.prototype.semanticErrorInvalidCall = function(range, type) {
  var self = this;
  self.error(range, "Cannot call value of type \"" + type.toString() + "\"");
};

skew.Log.prototype.semanticErrorCannotParameterize = function(range, type) {
  var self = this;
  self.error(range, "Cannot parameterize \"" + type.toString() + (type.isParameterized() ? "\" because it is already parameterized" : "\" because it has no type parameters"));
};

skew.Log.prototype.semanticErrorParameterCount = function(range, expected, found) {
  var self = this;
  self.error(range, skew.Log.expectedCountText("type parameter", expected, found));
};

skew.Log.prototype.semanticErrorArgumentCount = function(range, expected, found, name) {
  var self = this;
  self.error(range, skew.Log.expectedCountText("argument", expected, found) + (name !== "" ? " when calling \"" + name + "\"" : ""));
};

skew.Log.prototype.semanticErrorGetterCalledTwice = function(range, name) {
  var self = this;
  self.error(range, "The function \"" + name + "\" takes no arguments and is already called implicitly");
};

skew.Log.prototype.semanticErrorUseOfVoidFunction = function(range, name) {
  var self = this;
  self.error(range, "The function \"" + name + "\" does not return a value");
};

skew.Log.prototype.semanticErrorUseOfVoidLambda = function(range) {
  var self = this;
  self.error(range, "This call does not return a value");
};

skew.Log.prototype.semanticErrorBadVariableType = function(range, type) {
  var self = this;
  self.error(range, "Implicitly typed variables cannot be of type \"" + type.toString() + "\"");
};

skew.Log.prototype.semanticErrorMemberUnexpectedGlobal = function(range, name) {
  var self = this;
  self.error(range, "Cannot access global member \"" + name + "\" from an instance context");
};

skew.Log.prototype.semanticErrorMemberUnexpectedInstance = function(range, name) {
  var self = this;
  self.error(range, "Cannot access instance member \"" + name + "\" from a global context");
};

skew.Log.prototype.semanticErrorMemberUnexpectedTypeParameter = function(range, name) {
  var self = this;
  self.error(range, "Cannot access type parameter \"" + name + "\" here");
};

skew.Log.prototype.semanticErrorConstructorReturnType = function(range) {
  var self = this;
  self.error(range, "Constructors cannot have a return type");
};

skew.Log.prototype.semanticErrorNoMatchingOverload = function(range, name, count, types) {
  var self = this;
  self.error(range, "No overload of \"" + name + "\" was found that takes " + count.toString() + " argument" + prettyPrint.plural(count) + skew.Log.formatArgumentTypes(types));
};

skew.Log.prototype.semanticErrorAmbiguousOverload = function(range, name, count, types) {
  var self = this;
  self.error(range, "Multiple matching overloads of \"" + name + "\" were found that can take " + count.toString() + " argument" + prettyPrint.plural(count) + skew.Log.formatArgumentTypes(types));
};

skew.Log.prototype.semanticErrorUnexpectedExpression = function(range, type) {
  var self = this;
  self.error(range, "Unexpected expression of type \"" + type.toString() + "\"");
};

skew.Log.prototype.semanticErrorUnexpectedType = function(range, type) {
  var self = this;
  self.error(range, "Unexpected type \"" + type.toString() + "\"");
};

skew.Log.prototype.semanticErrorIncompatibleTypes = function(range, from, to, isCastAllowed) {
  var self = this;
  self.error(range, "Cannot convert from type \"" + from.toString() + "\" to type \"" + to.toString() + "\"" + (isCastAllowed ? " without a cast" : ""));
};

skew.Log.prototype.semanticWarningExtraCast = function(range, from, to) {
  var self = this;
  self.warning(range, "Unnecessary cast from type \"" + from.toString() + "\" to type \"" + to.toString() + "\"");
};

skew.Log.prototype.semanticErrorWrongArgumentCount = function(range, name, count) {
  var self = this;
  self.error(range, "Expected \"" + name + "\" to take " + count.toString() + " argument" + prettyPrint.plural(count));
};

skew.Log.prototype.semanticErrorWrongArgumentCountRange = function(range, name, lower, upper) {
  var self = this;
  if (lower === 0) {
    self.error(range, "Expected \"" + name + "\" to take at most " + upper.toString() + " argument" + prettyPrint.plural(upper));
  } else if (upper === -1) {
    self.error(range, "Expected \"" + name + "\" to take at least " + lower.toString() + " argument" + prettyPrint.plural(lower));
  } else {
    self.error(range, "Expected \"" + name + "\" to take between " + lower.toString() + " and " + upper.toString() + " arguments");
  }
};

skew.Log.prototype.semanticErrorExpectedList = function(range, name, type) {
  var self = this;
  self.error(range, "Expected argument \"" + name + "\" to be of type \"List<T>\" instead of type \"" + type.toString() + "\"");
};

skew.Log.prototype.semanticErrorUnexpectedReturnValue = function(range) {
  var self = this;
  self.error(range, "Cannot return a value inside a function without a return type");
};

skew.Log.prototype.semanticErrorBadReturnType = function(range, type) {
  var self = this;
  self.error(range, "Cannot create a function with a return type of \"" + type.toString() + "\"");
};

skew.Log.prototype.semanticErrorExpectedReturnValue = function(range, type) {
  var self = this;
  self.error(range, "Must return a value of type \"" + type.toString() + "\"");
};

skew.Log.prototype.semanticErrorMissingReturn = function(range, name, type) {
  var self = this;
  self.error(range, "All control paths for \"" + name + "\" must return a value of type \"" + type.toString() + "\"");
};

skew.Log.prototype.semanticErrorBadStorage = function(range) {
  var self = this;
  self.error(range, "Cannot store to this location");
};

skew.Log.prototype.semanticErrorStorageToConstSymbol = function(range, name) {
  var self = this;
  self.error(range, "Cannot store to constant symbol \"" + name + "\"");
};

skew.Log.prototype.semanticErrorAccessViolation = function(range, level, name) {
  var self = this;
  self.error(range, "Cannot access \"" + level + "\" symbol \"" + name + "\" here");
};

skew.Log.prototype.semanticErrorUnparameterizedType = function(range, type) {
  var self = this;
  self.error(range, "Cannot use unparameterized type \"" + type.toString() + "\" here");
};

skew.Log.prototype.semanticErrorParameterizedType = function(range, type) {
  var self = this;
  self.error(range, "Cannot use parameterized type \"" + type.toString() + "\" here");
};

skew.Log.prototype.semanticErrorNoCommonType = function(range, left, right) {
  var self = this;
  self.error(range, "No common type for \"" + left.toString() + "\" and \"" + right.toString() + "\"");
};

skew.Log.prototype.semanticErrorInvalidAnnotation = function(range, annotation, name) {
  var self = this;
  self.error(range, "Cannot use the annotation \"" + annotation + "\" on \"" + name + "\"");
};

skew.Log.prototype.semanticErrorDuplicateAnnotation = function(range, annotation, name) {
  var self = this;
  self.error(range, "Duplicate annotation \"" + annotation + "\" on \"" + name + "\"");
};

skew.Log.prototype.semanticErrorBadForValue = function(range, type) {
  var self = this;
  self.error(range, "Cannot iterate over type \"" + type.toString() + "\"");
};

skew.Log.prototype.semanticWarningEmptyRange = function(range) {
  var self = this;
  self.warning(range, "This range is empty");
};

skew.Log.prototype.semanticErrorMissingDotContext = function(range, name) {
  var self = this;
  self.error(range, "Cannot access \"" + name + "\" without type context");
};

skew.Log.prototype.semanticErrorInitializerTypeInferenceFailed = function(range) {
  var self = this;
  self.error(range, "Cannot infer a type for this literal");
};

skew.Log.prototype.semanticErrorDuplicateOverload = function(range, name, previous) {
  var self = this;
  self.error(range, "Duplicate overloaded function \"" + name + "\"");

  if (previous !== null) {
    self.note(previous, "The previous declaration is here");
  }
};

skew.Log.prototype.semanticErrorInvalidBaseType = function(range, type) {
  var self = this;
  self.error(range, "Cannot derive from type \"" + type.toString() + "\"");
};

skew.Log.prototype.semanticErrorBadOverride = function(range, name, base, overridden) {
  var self = this;
  self.error(range, "\"" + name + "\" overrides another declaration with the same name in base type \"" + base.toString() + "\"");

  if (overridden !== null) {
    self.note(overridden, "The overridden declaration is here");
  }
};

skew.Log.prototype.semanticErrorBadOverrideReturnType = function(range, name, base, overridden) {
  var self = this;
  self.error(range, "\"" + name + "\" overrides another function with the same name and argument types but a different return type in base type \"" + base.toString() + "\"");

  if (overridden !== null) {
    self.note(overridden, "The overridden function is here");
  }
};

skew.Log.prototype.semanticErrorModifierMissingOverride = function(range, name, overridden) {
  var self = this;
  self.error(range, "\"" + name + "\" overrides another symbol with the same name but is declared using \"def\" instead of \"over\"");

  if (overridden !== null) {
    self.note(overridden, "The overridden declaration is here");
  }
};

skew.Log.prototype.semanticErrorModifierUnusedOverride = function(range, name) {
  var self = this;
  self.error(range, "\"" + name + "\" is declared using \"over\" instead of \"def\" but does not override anything");
};

skew.Log.prototype.semanticErrorBadSuper = function(range) {
  var self = this;
  self.error(range, "Cannot use \"super\" here");
};

skew.Log.prototype.semanticErrorBadJump = function(range, name) {
  var self = this;
  self.error(range, "Cannot use \"" + name + "\" outside a loop");
};

skew.Log.prototype.semanticErrorMustCallFunction = function(range, name) {
  var self = this;
  self.error(range, "The function \"" + name + "\" must be called");
};

skew.ParserContext = function(log, tokens) {
  var self = this;
  self.log = log;
  self.inNonVoidFunction = false;
  self.needsPreprocessor = false;
  self.tokens = tokens;
  self.index = 0;
  self.previousSyntaxError = null;
};

skew.ParserContext.prototype.current = function() {
  var self = this;
  return self.tokens[self.index];
};

skew.ParserContext.prototype.next = function() {
  var self = this;
  var token = self.current();

  if (self.index + 1 < in_List.count$846(self.tokens)) {
    self.index += 1;
  }

  return token;
};

skew.ParserContext.prototype.spanSince = function(range) {
  var self = this;
  var previous = self.tokens[self.index > 0 ? self.index - 1 : 0];
  return previous.range.end < range.start ? range : skew.Range.span(range, previous.range);
};

skew.ParserContext.prototype.peek = function(kind) {
  var self = this;
  return self.current().kind === kind;
};

skew.ParserContext.prototype.eat = function(kind) {
  var self = this;
  if (self.peek(kind)) {
    self.next();
    return true;
  }

  return false;
};

skew.ParserContext.prototype.undo = function() {
  var self = this;
  assert(self.index > 0);
  self.index -= 1;
};

skew.ParserContext.prototype.expect = function(kind) {
  var self = this;
  if (!self.eat(kind)) {
    var token = self.current();

    if (self.previousSyntaxError !== token) {
      var range = token.range;
      self.log.syntaxErrorExpectedToken(range, token.kind, kind);
      self.previousSyntaxError = token;
    }

    return false;
  }

  return true;
};

skew.ParserContext.prototype.unexpectedToken = function() {
  var self = this;
  var token = self.current();

  if (self.previousSyntaxError !== token) {
    self.log.syntaxErrorUnexpectedToken(token);
    self.previousSyntaxError = token;
  }
};

skew.Parselet = function(precedence) {
  var self = this;
  self.precedence = precedence;
  self.prefix = null;
  self.infix = null;
};

// A Pratt parser is a parser that associates up to two operations per token,
// each with its own precedence. Pratt parsers excel at parsing expression
// trees with deeply nested precedence levels. For an excellent writeup, see:
//
//   http:#journal.stuffwithstuff.com/2011/03/19/pratt-parsers-expression-parsing-made-easy/
//
skew.Pratt = function() {
  var self = this;
  self.table = in_IntMap.$new();
};

skew.Pratt.prototype.parselet = function(kind, precedence) {
  var self = this;
  var parselet = in_IntMap.get$823(self.table, ((kind) | 0), null);

  if (parselet === null) {
    var created = new skew.Parselet(precedence);
    parselet = created;
    self.table[((kind) | 0)] = created;
  } else if (((precedence) | 0) > ((parselet.precedence) | 0)) {
    parselet.precedence = precedence;
  }

  return parselet;
};

skew.Pratt.prototype.parse = function(context, precedence) {
  var self = this;
  var token = context.current();
  var parselet = in_IntMap.get$823(self.table, ((token.kind) | 0), null);

  if (parselet === null || parselet.prefix === null) {
    context.unexpectedToken();
    return null;
  }

  var node = self.resume(context, precedence, parselet.prefix(context));

  // Parselets must set the range of every node
  assert(node === null || node.range !== null);
  return node;
};

skew.Pratt.prototype.resume = function(context, precedence, left) {
  var self = this;
  while (left !== null) {
    var kind = context.current().kind;
    var parselet = in_IntMap.get$823(self.table, ((kind) | 0), null);

    if (parselet === null || parselet.infix === null || ((parselet.precedence) | 0) <= ((precedence) | 0)) {
      break;
    }

    left = parselet.infix(context, left);

    // Parselets must set the range of every node
    assert(left === null || left.range !== null);
  }

  return left;
};

skew.Pratt.prototype.hasPrefixParselet = function(context) {
  var self = this;
  var parselet = in_IntMap.get$823(self.table, ((context.current().kind) | 0), null);
  return parselet !== null && parselet.prefix !== null;
};

skew.Pratt.prototype.literal = function(kind, callback) {
  var self = this;
  self.parselet(kind, skew.Precedence.LOWEST).prefix = function(context) {
    return callback(context, context.next());
  };
};

skew.Pratt.prototype.prefix = function(kind, precedence, callback) {
  var self = this;
  self.parselet(kind, skew.Precedence.LOWEST).prefix = function(context) {
    var token = context.next();
    var value = self.parse(context, precedence);
    return value !== null ? callback(context, token, value) : null;
  };
};

skew.Pratt.prototype.postfix = function(kind, precedence, callback) {
  var self = this;
  self.parselet(kind, precedence).infix = function(context, left) {
    return callback(context, left, context.next());
  };
};

skew.Pratt.prototype.infix = function(kind, precedence, callback) {
  var self = this;
  self.parselet(kind, precedence).infix = function(context, left) {
    var token = context.next();
    var right = self.parse(context, precedence);
    return right !== null ? callback(context, left, token, right) : null;
  };
};

skew.Pratt.prototype.infixRight = function(kind, precedence, callback) {
  var self = this;
  self.parselet(kind, precedence).infix = function(context, left) {
    var token = context.next();

    // Subtract 1 for right-associativity
    var right = self.parse(context, ((precedence) | 0) - 1);
    return right !== null ? callback(context, left, token, right) : null;
  };
};

skew.FormattedRange = function(line, range) {
  var self = this;
  self.line = line;
  self.range = range;
};

skew.Range = function(source, start, end) {
  var self = this;
  self.source = source;
  self.start = start;
  self.end = end;
};

skew.Range.prototype.toString = function() {
  var self = this;
  return self.source.contents.slice(self.start, self.end);
};

skew.Range.prototype.locationString = function() {
  var self = this;
  var location = self.source.indexToLineColumn(self.start);
  return self.source.name + ":" + (location.line + 1).toString() + ":" + (location.column + 1).toString();
};

skew.Range.prototype.format = function(maxLength) {
  var self = this;
  assert(self.source !== null);
  var start = self.source.indexToLineColumn(self.start);
  var end = self.source.indexToLineColumn(self.end);
  var line = self.source.contentsOfLine(start.line);
  var length = in_string.count$830(line);
  var a = start.column;
  var b = end.line === start.line ? end.column : length;
  var count = b + length;

  // Ensure the line length doesn't exceed maxLength
  if (maxLength > 0 && count > maxLength) {
    var centeredWidth = Math.min(b - a, ((maxLength) / (2) | 0));
    var centeredStart = Math.max(((maxLength - centeredWidth) / (2) | 0), 3);
    var codePoints = line.codePoints();

    // Left aligned
    if (a < centeredStart) {
      line = string.fromCodePoints(codePoints.slice(0, maxLength - 3)) + "...";

      if (b > maxLength - 3) {
        b = maxLength - 3;
      }
    }

    // Right aligned
    else if (count - a < maxLength - centeredStart) {
      var offset = count - maxLength;
      line = "..." + string.fromCodePoints(codePoints.slice(offset + 3, count));
      a -= offset;
      b -= offset;
    }

    // Center aligned
    else {
      var offset = a - centeredStart;
      line = "..." + string.fromCodePoints(codePoints.slice(offset + 3, offset + maxLength - 3)) + "...";
      a -= offset;
      b -= offset;

      if (b > maxLength - 3) {
        b = maxLength - 3;
      }
    }
  }

  return new skew.FormattedRange(line, in_string.repeat$835(" ", a) + (b - a < 2 ? "^" : in_string.repeat$835("~", b - a)));
};

skew.Range.span = function(start, end) {
  assert(start.source === end.source);
  assert(start.start <= end.end);
  return new skew.Range(start.source, start.start, end.end);
};

skew.Range.inner = function(start, end) {
  assert(start.source === end.source);
  assert(start.end <= end.start);
  return new skew.Range(start.source, start.end, end.start);
};

skew.Range.before = function(outer, inner) {
  assert(outer.source === inner.source);
  assert(outer.start <= inner.start);
  assert(outer.end >= inner.end);
  return new skew.Range(outer.source, outer.start, inner.start);
};

skew.Range.after = function(outer, inner) {
  assert(outer.source === inner.source);
  assert(outer.start <= inner.start);
  assert(outer.end >= inner.end);
  return new skew.Range(outer.source, inner.end, outer.end);
};

skew.Range.equal = function(left, right) {
  return left.source === right.source && left.start === right.start && left.end === right.end;
};

skew.LineColumn = function(line, column) {
  var self = this;
  self.line = line;
  self.column = column;
};

skew.Source = function(name, contents) {
  var self = this;
  self.name = name;
  self.contents = contents;
  self.lineOffsets = null;
};

skew.Source.prototype.lineCount = function() {
  var self = this;
  self.computeLineOffsets();

  // Ignore the line offset at 0
  return in_List.count$846(self.lineOffsets) - 1;
};

skew.Source.prototype.contentsOfLine = function(line) {
  var self = this;
  self.computeLineOffsets();

  if (line < 0 || line >= in_List.count$846(self.lineOffsets)) {
    return "";
  }

  var start = self.lineOffsets[line];
  var end = line + 1 < in_List.count$846(self.lineOffsets) ? self.lineOffsets[line + 1] - 1 : in_string.count$830(self.contents);
  return self.contents.slice(start, end);
};

skew.Source.prototype.indexToLineColumn = function(index) {
  var self = this;
  self.computeLineOffsets();

  // Binary search to find the line
  var count = in_List.count$846(self.lineOffsets);
  var line = 0;

  while (count > 0) {
    var step = ((count) / (2) | 0);
    var i = line + step;

    if (self.lineOffsets[i] <= index) {
      line = i + 1;
      count = count - step - 1;
    } else {
      count = step;
    }
  }

  // Use the line to compute the column
  var column = line > 0 ? index - self.lineOffsets[line - 1] : index;
  return new skew.LineColumn(line - 1, column);
};

skew.Source.prototype.computeLineOffsets = function() {
  var self = this;
  if (self.lineOffsets === null) {
    self.lineOffsets = [0];

    for (var i = 0, n1836 = in_string.count$830(self.contents); i < n1836; i++) {
      if (in_string.s831$831(self.contents, i) === 10) {
        in_List.append$851(self.lineOffsets, i + 1);
      }
    }
  }
};

skew.Token = function(range, kind) {
  var self = this;
  self.range = range;
  self.kind = kind;
};

skew.Token.prototype.firstCodeUnit = function() {
  var self = this;
  if (self.kind === skew.TokenKind.END_OF_FILE) {
    return 0;
  }

  assert(self.range.start < in_string.count$830(self.range.source.contents));
  return in_string.s831$831(self.range.source.contents, self.range.start);
};

skew.CallInfo = function(symbol) {
  var self = this;
  self.symbol = symbol;
  self.callSites = [];
};

skew.CallGraph = function(global) {
  var self = this;
  // TODO: These should be inserted automatically
  self.callInfo = [];
  self.symbolToInfoIndex = in_IntMap.$new();
  self.visitObject(global);
};

skew.CallGraph.prototype.visitObject = function(symbol) {
  var self = this;
  for (var i1871 = 0, x1871 = symbol.objects; i1871 < x1871.length; i1871++) {
    var object = x1871[i1871];
    self.visitObject(object);
  }

  for (var i1872 = 0, x1872 = symbol.functions; i1872 < x1872.length; i1872++) {
    var $function = x1872[i1872];
    self.recordCallSite($function, null);

    if ($function.block !== null) {
      self.visitNode($function.block);
    }
  }

  for (var i1873 = 0, x1873 = symbol.variables; i1873 < x1873.length; i1873++) {
    var variable = x1873[i1873];
    if (variable.value !== null) {
      self.visitNode(variable.value);
    }
  }
};

skew.CallGraph.prototype.visitNode = function(node) {
  var self = this;
  if (node.children !== null) {
    for (var i1876 = 0, x1876 = node.children; i1876 < x1876.length; i1876++) {
      var child = x1876[i1876];
      if (child !== null) {
        self.visitNode(child);
      }
    }
  }

  if (node.kind === skew.NodeKind.CALL && node.symbol !== null) {
    assert(skew.SymbolKind.isFunction(node.symbol.kind));
    self.recordCallSite(node.symbol, node);
  } else if (node.kind === skew.NodeKind.VAR) {
    var variable = node.symbol.asVariableSymbol();

    if (variable.value !== null) {
      self.visitNode(variable.value);
    }
  } else if (node.kind === skew.NodeKind.LAMBDA) {
    var $function = node.symbol.asFunctionSymbol();

    if ($function.block !== null) {
      self.visitNode($function.block);
    }
  }
};

skew.CallGraph.prototype.recordCallSite = function(symbol, node) {
  var self = this;
  var index = in_IntMap.get$823(self.symbolToInfoIndex, symbol.id, -1);
  var info = index < 0 ? new skew.CallInfo(symbol) : self.callInfo[index];

  if (index < 0) {
    self.symbolToInfoIndex[symbol.id] = in_List.count$846(self.callInfo);
    in_List.append$851(self.callInfo, info);
  }

  if (node !== null) {
    in_List.append$851(info.callSites, node);
  }
};

skew.merging = {};

skew.merging.mergeObject = function(log, parent, target, symbol) {
  target.scope = new skew.ObjectScope(parent !== null ? parent.scope : null, target);
  symbol.parent = parent;

  if (symbol.parameters !== null) {
    for (var i1914 = 0, x1914 = symbol.parameters; i1914 < x1914.length; i1914++) {
      var parameter = x1914[i1914];
      parameter.scope = parent.scope;
      parameter.parent = target;

      // Type parameters cannot merge with any members
      var other = in_StringMap.get$811(target.members, parameter.name, null);

      if (other !== null) {
        log.semanticErrorDuplicateSymbol(parameter.range, parameter.name, other.range);
        continue;
      }

      target.members[parameter.name] = parameter;
    }
  }

  skew.merging.mergeObjects(log, target, symbol.objects);
  skew.merging.mergeFunctions(log, target, symbol.functions);
  skew.merging.mergeVariables(log, target, symbol.variables);
};

skew.merging.mergeObjects = function(log, parent, children) {
  var members = parent.members;
  var n = in_List.count$846(children);
  var count = 0;

  for (var i = 0, n1923 = n; i < n1923; i++) {
    var child = children[i];
    var other = in_StringMap.get$811(members, child.name, null);

    // Simple case: no merging
    if (other === null) {
      members[child.name] = child;
      children[count] = child;
      count += 1;
      skew.merging.mergeObject(log, parent, child, child);
      continue;
    }

    // Can only merge with another of the same kind or with a namespace
    if (other.kind === skew.SymbolKind.OBJECT_NAMESPACE) {
      other.kind = child.kind;
    } else if (child.kind !== skew.SymbolKind.OBJECT_NAMESPACE && child.kind !== other.kind) {
      log.semanticErrorDuplicateSymbol(child.range, child.name, other.range);
      continue;
    }

    // Classes can only have one base type
    var object = other.asObjectSymbol();

    if (child.base !== null && object.base !== null) {
      log.semanticErrorDuplicateBaseType(child.base.range, child.name, object.base.range);
      continue;
    }

    if (child.base !== null) {
      object.base = child.base;
    }

    // Cannot merge two objects that both have type parameters
    if (child.parameters !== null && object.parameters !== null) {
      log.semanticErrorDuplicateTypeParameters(skew.merging.rangeOfParameters(child.parameters), child.name, skew.merging.rangeOfParameters(object.parameters));
      continue;
    }

    // Merge "child" into "other"
    skew.merging.mergeObject(log, parent, object, child);
    in_List.append$853(object.objects, child.objects);
    in_List.append$853(object.functions, child.functions);
    in_List.append$853(object.variables, child.variables);

    if (child.parameters !== null) {
      object.parameters = child.parameters;
    }
  }

  // Remove merged declarations using O(n), would be O(n^2) if removeAt was used
  while (n > count) {
    in_List.removeLast$856(children);
    n -= 1;
  }
};

skew.merging.mergeFunctions = function(log, parent, children) {
  var members = parent.members;

  for (var i1932 = 0, x1932 = children; i1932 < x1932.length; i1932++) {
    var child = x1932[i1932];
    var other = in_StringMap.get$811(members, child.name, null);
    var scope = new skew.FunctionScope(parent.scope, child);
    child.scope = scope;
    child.parent = parent;

    if (child.parameters !== null) {
      for (var i1935 = 0, x1935 = child.parameters; i1935 < x1935.length; i1935++) {
        var parameter = x1935[i1935];
        parameter.scope = scope;
        parameter.parent = child;

        // Type parameters cannot merge with other parameters on this function
        var previous = in_StringMap.get$811(scope.parameters, parameter.name, null);

        if (previous !== null) {
          log.semanticErrorDuplicateSymbol(parameter.range, parameter.name, previous.range);
          continue;
        }

        scope.parameters[parameter.name] = parameter;
      }
    }

    // Simple case: no merging
    if (other === null) {
      members[child.name] = child;
      continue;
    }

    var childKind = skew.merging.overloadedKind(child.kind);
    var otherKind = skew.merging.overloadedKind(other.kind);

    // Merge with another symbol of the same overloaded group type
    if (childKind !== otherKind || !skew.SymbolKind.isOverloadedFunction(childKind)) {
      log.semanticErrorDuplicateSymbol(child.range, child.name, other.range);
      continue;
    }

    // Merge with a group of overloaded functions
    if (skew.SymbolKind.isOverloadedFunction(other.kind)) {
      in_List.append$851(other.asOverloadedFunctionSymbol().symbols, child);
      child.overloaded = other.asOverloadedFunctionSymbol();
      continue;
    }

    // Create an overload group
    var overloaded = new skew.OverloadedFunctionSymbol(childKind, child.name, [other.asFunctionSymbol(), child]);
    members[child.name] = overloaded;
    other.asFunctionSymbol().overloaded = overloaded;
    child.overloaded = overloaded;
    overloaded.scope = parent.scope;
    overloaded.parent = parent;
  }
};

skew.merging.overloadedKind = function(kind) {
  return kind === skew.SymbolKind.FUNCTION_CONSTRUCTOR || kind === skew.SymbolKind.FUNCTION_GLOBAL ? skew.SymbolKind.OVERLOADED_GLOBAL : kind === skew.SymbolKind.FUNCTION_INSTANCE ? skew.SymbolKind.OVERLOADED_INSTANCE : kind;
};

skew.merging.mergeVariables = function(log, parent, children) {
  var members = parent.members;

  for (var i1947 = 0, x1947 = children; i1947 < x1947.length; i1947++) {
    var child = x1947[i1947];
    var other = in_StringMap.get$811(members, child.name, null);
    child.scope = new skew.VariableScope(parent.scope, child);
    child.parent = parent;

    // Variables never merge
    if (other !== null) {
      log.semanticErrorDuplicateSymbol(child.range, child.name, other.range);
      continue;
    }

    members[child.name] = child;
  }
};

skew.merging.rangeOfParameters = function(parameters) {
  return skew.Range.span(in_List.first$847(parameters).range, in_List.last$848(parameters).range);
};

skew.renaming = {};

skew.renaming.renameObject = function(symbol) {
  skew.renaming.renameSymbol(symbol);

  for (var i1968 = 0, x1968 = symbol.objects; i1968 < x1968.length; i1968++) {
    var object = x1968[i1968];
    skew.renaming.renameObject(object);
  }

  for (var i1969 = 0, x1969 = symbol.functions; i1969 < x1969.length; i1969++) {
    var $function = x1969[i1969];
    skew.renaming.renameSymbol($function);
  }

  for (var i1970 = 0, x1970 = symbol.variables; i1970 < x1970.length; i1970++) {
    var variable = x1970[i1970];
    skew.renaming.renameSymbol(variable);
  }
};

skew.renaming.renameSymbol = function(symbol) {
  if (!symbol.isImported() && !symbol.isExported() && skew.renaming.shouldRenameSymbol(symbol)) {
    symbol.name = "s" + symbol.id.toString();
  }
};

skew.renaming.isAlpha = function(c) {
  return c >= 97 && c <= 122 || c >= 65 && c <= 90 || c === 95;
};

skew.renaming.isNumber = function(c) {
  return c >= 48 && c <= 57;
};

skew.renaming.shouldRenameSymbol = function(symbol) {
  for (var i = 0, n1979 = in_string.count$830(symbol.name); i < n1979; i++) {
    var c = in_string.s831$831(symbol.name, i);

    if (!skew.renaming.isAlpha(c) && (i === 0 || !skew.renaming.isNumber(c))) {
      return true;
    }
  }

  return false;
};

skew.resolving = {};

skew.resolving.ConversionKind = {
  IMPLICIT: 0, 0: "IMPLICIT",
  EXPLICIT: 1, 1: "EXPLICIT"
};

skew.resolving.Resolver = function(cache, log) {
  var self = this;
  self.cache = cache;
  self.log = log;
};

skew.resolving.Resolver.prototype.initializeSymbol = function(symbol) {
  var self = this;
  // The scope should have been set by the merging pass (or by this pass for local variables)
  assert(symbol.scope !== null);

  // Only initialize the symbol once
  if (symbol.state === skew.SymbolState.UNINITIALIZED) {
    symbol.state = skew.SymbolState.INITIALIZING;

    switch (symbol.kind) {
      case skew.SymbolKind.OBJECT_CLASS:
      case skew.SymbolKind.OBJECT_ENUM:
      case skew.SymbolKind.OBJECT_GLOBAL:
      case skew.SymbolKind.OBJECT_INTERFACE:
      case skew.SymbolKind.OBJECT_NAMESPACE: {
        self.initializeObject(symbol.asObjectSymbol());
        break;
      }

      case skew.SymbolKind.FUNCTION_ANNOTATION:
      case skew.SymbolKind.FUNCTION_CONSTRUCTOR:
      case skew.SymbolKind.FUNCTION_GLOBAL:
      case skew.SymbolKind.FUNCTION_INSTANCE:
      case skew.SymbolKind.FUNCTION_LOCAL: {
        self.initializeFunction(symbol.asFunctionSymbol());
        break;
      }

      case skew.SymbolKind.VARIABLE_ENUM:
      case skew.SymbolKind.VARIABLE_GLOBAL:
      case skew.SymbolKind.VARIABLE_INSTANCE:
      case skew.SymbolKind.VARIABLE_LOCAL: {
        self.initializeVariable(symbol.asVariableSymbol());
        break;
      }

      case skew.SymbolKind.PARAMETER_FUNCTION:
      case skew.SymbolKind.PARAMETER_OBJECT: {
        self.initializeParameter(symbol.asParameterSymbol());
        break;
      }

      case skew.SymbolKind.OVERLOADED_GLOBAL:
      case skew.SymbolKind.OVERLOADED_INSTANCE: {
        self.initializeOverloadedFunction(symbol.asOverloadedFunctionSymbol());
        break;
      }

      default: {
        assert(false);
        break;
      }
    }

    assert(symbol.resolvedType !== null);
    symbol.state = skew.SymbolState.INITIALIZED;

    if (skew.SymbolKind.isFunction(symbol.kind)) {
      var overloaded = symbol.asFunctionSymbol().overloaded;

      // After initializing a function symbol, ensure the entire overload set is initialized
      if (overloaded !== null && overloaded.state === skew.SymbolState.UNINITIALIZED) {
        self.initializeSymbol(overloaded);
      }
    }
  }

  // Detect cyclic symbol references such as "foo foo;"
  else if (symbol.state === skew.SymbolState.INITIALIZING) {
    self.log.semanticErrorCyclicDeclaration(symbol.range, symbol.name);
    symbol.resolvedType = skew.Type.DYNAMIC;
  }
};

skew.resolving.Resolver.prototype.resolveAnnotations = function(symbol) {
  var self = this;
  var parent = symbol.parent;
  var annotations = symbol.annotations;

  // The import/export annotations are inherited
  if (parent !== null && (skew.SymbolKind.isVariable(symbol.kind) || skew.SymbolKind.isFunction(symbol.kind) && symbol.asFunctionSymbol().block === null)) {
    symbol.flags |= parent.flags & (skew.Symbol.IS_IMPORTED | skew.Symbol.IS_EXPORTED);
  }

  // Resolve annotations on this symbol after annotation inheritance
  if (annotations !== null) {
    for (var i2001 = 0, x2001 = annotations; i2001 < x2001.length; i2001++) {
      var annotation = x2001[i2001];
      self.resolveAnnotation(annotation, symbol);
    }
  }
};

skew.resolving.Resolver.prototype.resolveParameters = function(parameters) {
  var self = this;
  if (parameters !== null) {
    for (var i2004 = 0, x2004 = parameters; i2004 < x2004.length; i2004++) {
      var parameter = x2004[i2004];
      self.resolveParameter(parameter);
    }
  }
};

skew.resolving.Resolver.prototype.initializeParameter = function(symbol) {
  var self = this;
  if (symbol.resolvedType === null) {
    symbol.resolvedType = new skew.Type(skew.TypeKind.SYMBOL, symbol);
  }

  self.resolveAnnotations(symbol);
};

skew.resolving.Resolver.prototype.resolveParameter = function(symbol) {
  var self = this;
  self.initializeSymbol(symbol);
};

skew.resolving.Resolver.prototype.initializeObject = function(symbol) {
  var self = this;
  if (symbol.resolvedType === null) {
    symbol.resolvedType = new skew.Type(skew.TypeKind.SYMBOL, symbol);
  }

  self.forbidOverriddenSymbol(symbol);

  // Resolve the base type (only for classes)
  if (symbol.base !== null) {
    self.resolveAsParameterizedType(symbol.base, symbol.scope);
    var baseType = symbol.base.resolvedType;

    if (baseType.kind === skew.TypeKind.SYMBOL && baseType.symbol.kind === skew.SymbolKind.OBJECT_CLASS && !baseType.symbol.isValueType()) {
      symbol.baseClass = baseType.symbol.asObjectSymbol();

      // Don't lose the type parameters from the base type
      symbol.resolvedType.environment = baseType.environment;
    } else if (baseType !== skew.Type.DYNAMIC) {
      self.log.semanticErrorInvalidBaseType(symbol.base.range, baseType);
    }
  }

  // Assign values for all enums before they are initialized
  if (symbol.kind === skew.SymbolKind.OBJECT_ENUM) {
    var nextEnumValue = 0;

    for (var i2013 = 0, x2013 = symbol.variables; i2013 < x2013.length; i2013++) {
      var variable = x2013[i2013];
      if (variable.kind === skew.SymbolKind.VARIABLE_ENUM) {
        variable.enumValue = nextEnumValue;
        nextEnumValue += 1;
      }
    }
  }

  self.resolveAnnotations(symbol);

  // Create a default constructor if one doesn't exist
  var $constructor = in_StringMap.get$811(symbol.members, "new", null);

  if (symbol.kind === skew.SymbolKind.OBJECT_CLASS && !symbol.isImported() && $constructor === null) {
    var baseConstructor = symbol.baseClass !== null ? in_StringMap.get$811(symbol.baseClass.members, "new", null) : null;

    // Unwrap the overload group if present
    if (baseConstructor !== null && baseConstructor.kind === skew.SymbolKind.OVERLOADED_GLOBAL) {
      var overloaded = baseConstructor.asOverloadedFunctionSymbol();

      for (var i2017 = 0, x2017 = overloaded.symbols; i2017 < x2017.length; i2017++) {
        var overload = x2017[i2017];
        if (overload.kind === skew.SymbolKind.FUNCTION_CONSTRUCTOR) {
          if (baseConstructor.kind === skew.SymbolKind.FUNCTION_CONSTRUCTOR) {
            // Signal that there isn't a single base constructor
            baseConstructor = null;
            break;
          }

          baseConstructor = overload;
        }
      }
    }

    // A default constructor can only be created if the base class has a single constructor
    if (symbol.baseClass === null || baseConstructor !== null && baseConstructor.kind === skew.SymbolKind.FUNCTION_CONSTRUCTOR) {
      var generated = new skew.FunctionSymbol(skew.SymbolKind.FUNCTION_CONSTRUCTOR, "new");
      generated.scope = new skew.FunctionScope(symbol.scope, generated);
      generated.flags |= skew.Symbol.IS_AUTOMATICALLY_GENERATED;
      generated.parent = symbol;
      generated.range = symbol.range;
      generated.overridden = baseConstructor !== null ? baseConstructor.asFunctionSymbol() : null;
      in_List.append$851(symbol.functions, generated);
      symbol.members[generated.name] = generated;
    }
  }
};

skew.resolving.Resolver.prototype.resolveObject = function(symbol) {
  var self = this;
  self.initializeSymbol(symbol);
  self.resolveParameters(symbol.parameters);

  for (var i2021 = 0, x2021 = symbol.objects; i2021 < x2021.length; i2021++) {
    var object = x2021[i2021];
    self.resolveObject(object);
  }

  for (var i2022 = 0, x2022 = symbol.functions; i2022 < x2022.length; i2022++) {
    var $function = x2022[i2022];
    self.resolveFunction($function);
  }

  for (var i2023 = 0, x2023 = symbol.variables; i2023 < x2023.length; i2023++) {
    var variable = x2023[i2023];
    self.resolveVariable(variable);
  }
};

skew.resolving.Resolver.prototype.initializeFunction = function(symbol) {
  var self = this;
  if (symbol.resolvedType === null) {
    symbol.resolvedType = new skew.Type(skew.TypeKind.SYMBOL, symbol);
  }

  // Referencing a normal variable instead of a special node kind for "this"
  // makes many things much easier including lambda capture and devirtualization
  if (symbol.kind === skew.SymbolKind.FUNCTION_INSTANCE || symbol.kind === skew.SymbolKind.FUNCTION_CONSTRUCTOR) {
    symbol.self = new skew.VariableSymbol(skew.SymbolKind.VARIABLE_LOCAL, "self");
    symbol.self.flags |= skew.Symbol.IS_CONST;
    symbol.self.resolvedType = self.cache.parameterize(symbol.parent.resolvedType);
    symbol.self.state = skew.SymbolState.INITIALIZED;
  }

  // Lazily-initialize automatically generated functions
  if (symbol.isAutomaticallyGenerated()) {
    assert(symbol.kind === skew.SymbolKind.FUNCTION_CONSTRUCTOR);
    self.automaticallyGenerateConstructor(symbol);
  }

  // Find the overridden function or overloaded function in the base class
  var overridden = self.findOverriddenMember(symbol);

  if (overridden !== null) {
    var symbolKind = skew.merging.overloadedKind(symbol.kind);
    var overriddenKind = skew.merging.overloadedKind(overridden.kind);

    // Make sure the overridden symbol can be merged with this symbol
    if (symbolKind !== overriddenKind) {
      self.log.semanticErrorBadOverride(symbol.range, symbol.name, symbol.parent.asObjectSymbol().base.resolvedType, overridden.range);
      overridden = null;
    }

    // Overriding something makes both symbols overloaded for simplicity
    else {
      skew.resolving.Resolver.ensureFunctionIsOverloaded(symbol);

      if (skew.SymbolKind.isFunction(overridden.kind)) {
        var $function = overridden.asFunctionSymbol();
        skew.resolving.Resolver.ensureFunctionIsOverloaded($function);
        overridden = $function.overloaded;
      }
    }
  }

  self.resolveParameters(symbol.parameters);

  // Resolve the argument variables
  symbol.resolvedType.argumentTypes = [];

  for (var i2030 = 0, x2030 = symbol.$arguments; i2030 < x2030.length; i2030++) {
    var argument = x2030[i2030];
    argument.scope = symbol.scope;
    self.resolveVariable(argument);
    in_List.append$851(symbol.resolvedType.argumentTypes, argument.resolvedType);
  }

  symbol.argumentOnlyType = self.cache.createLambdaType(symbol.resolvedType.argumentTypes, null);

  // Resolve the return type if present (no return type means "void")
  var returnType = null;

  if (symbol.returnType !== null) {
    if (symbol.kind === skew.SymbolKind.FUNCTION_CONSTRUCTOR) {
      self.log.semanticErrorConstructorReturnType(symbol.returnType.range);
    } else {
      self.resolveAsParameterizedType(symbol.returnType, symbol.scope);
      returnType = symbol.returnType.resolvedType;
    }
  }

  // Constructors always return the type they construct
  if (symbol.kind === skew.SymbolKind.FUNCTION_CONSTRUCTOR) {
    returnType = self.cache.parameterize(symbol.parent.resolvedType);
  }

  // The "<=>" operator must return a numeric value for comparison with zero
  var count = in_List.count$846(symbol.$arguments);

  if (symbol.name === "<=>") {
    if (returnType === null || !self.cache.isNumeric(returnType)) {
      self.log.semanticErrorComparisonOperatorNotNumeric(symbol.returnType !== null ? symbol.returnType.range : symbol.range);
      returnType = skew.Type.DYNAMIC;
    } else if (count !== 1) {
      self.log.semanticErrorWrongArgumentCount(symbol.range, symbol.name, 1);
    }
  }

  // Setters must have one argument
  else if (symbol.isSetter() && count !== 1) {
    self.log.semanticErrorWrongArgumentCount(symbol.range, symbol.name, 1);
    symbol.flags &= ~skew.Symbol.IS_SETTER;
  }

  // Validate argument count
  else {
    var argumentCount = skew.argumentCountForOperator(symbol.name);
    var hasArgumentCountError = false;

    switch (argumentCount) {
      case skew.ArgumentCount.ZERO:
      case skew.ArgumentCount.ONE: {
        var expected = argumentCount === skew.ArgumentCount.ZERO ? 0 : 1;

        if (count !== expected) {
          self.log.semanticErrorWrongArgumentCount(symbol.range, symbol.name, expected);
          hasArgumentCountError = true;
        }
        break;
      }

      case skew.ArgumentCount.ZERO_OR_ONE:
      case skew.ArgumentCount.ONE_OR_TWO:
      case skew.ArgumentCount.TWO_OR_FEWER: {
        var lower = argumentCount === skew.ArgumentCount.ONE_OR_TWO ? 1 : 0;
        var upper = argumentCount === skew.ArgumentCount.ZERO_OR_ONE ? 1 : 2;

        if (count < lower || count > upper) {
          self.log.semanticErrorWrongArgumentCountRange(symbol.range, symbol.name, lower, upper);
          hasArgumentCountError = true;
        }
        break;
      }

      case skew.ArgumentCount.ONE_OR_MORE:
      case skew.ArgumentCount.TWO_OR_MORE: {
        var expected = argumentCount === skew.ArgumentCount.ONE_OR_MORE ? 1 : 2;

        if (count < expected) {
          self.log.semanticErrorWrongArgumentCountRange(symbol.range, symbol.name, expected, -1);
          hasArgumentCountError = true;
        }
        break;
      }
    }

    // Enforce that the initializer constructor operators take lists of
    // values to avoid confusing error messages inside the code generated
    // for initializer expressions
    if (!hasArgumentCountError && (symbol.name === "{new}" || symbol.name === "[new]")) {
      for (var i2039 = 0, x2039 = symbol.$arguments; i2039 < x2039.length; i2039++) {
        var argument = x2039[i2039];
        if (argument.resolvedType !== skew.Type.DYNAMIC && !self.cache.isList(argument.resolvedType)) {
          self.log.semanticErrorExpectedList(argument.range, argument.name, argument.resolvedType);
        }
      }
    }
  }

  // Link this symbol with the overridden symbol if there is one
  var hasOverrideError = false;

  if (overridden !== null) {
    var overloaded = overridden.asOverloadedFunctionSymbol();
    self.initializeSymbol(overloaded);

    for (var i2042 = 0, x2042 = overloaded.symbols; i2042 < x2042.length; i2042++) {
      var overload = x2042[i2042];
      if (overload.argumentOnlyType === symbol.argumentOnlyType) {
        symbol.overridden = overload.asFunctionSymbol();

        if (symbol.kind !== skew.SymbolKind.FUNCTION_CONSTRUCTOR && overload.kind !== skew.SymbolKind.FUNCTION_CONSTRUCTOR && symbol.overridden.resolvedType.returnType !== returnType) {
          self.log.semanticErrorBadOverrideReturnType(symbol.range, symbol.name, symbol.parent.asObjectSymbol().base.resolvedType, overload.range);
          hasOverrideError = true;
        }

        break;
      }
    }
  }

  symbol.resolvedType.returnType = returnType;
  self.resolveAnnotations(symbol);

  // Validate use of "def" vs "over"
  if (!hasOverrideError) {
    if (symbol.overridden !== null && symbol.kind === skew.SymbolKind.FUNCTION_INSTANCE) {
      if (!symbol.isOver()) {
        self.log.semanticErrorModifierMissingOverride(symbol.range, symbol.name, symbol.overridden.range);
      }
    } else if (symbol.isOver()) {
      self.log.semanticErrorModifierUnusedOverride(symbol.range, symbol.name);
    }
  }
};

skew.resolving.Resolver.prototype.automaticallyGenerateConstructor = function(symbol) {
  var self = this;
  var statements = [];

  // Mirror the base constructor's arguments
  if (symbol.overridden !== null) {
    self.initializeSymbol(symbol.overridden);
    var $arguments = symbol.overridden.$arguments;
    var values = [];

    for (var i2048 = 0, x2048 = $arguments; i2048 < x2048.length; i2048++) {
      var variable = x2048[i2048];
      var argument = new skew.VariableSymbol(skew.SymbolKind.VARIABLE_LOCAL, variable.name);
      argument.resolvedType = variable.resolvedType;
      argument.state = skew.SymbolState.INITIALIZED;
      in_List.append$851(symbol.$arguments, argument);
      in_List.append$851(values, skew.resolving.Resolver.createSymbolReference(argument));
    }

    in_List.append$851(statements, skew.Node.createExpression(in_List.isEmpty$845(values) ? skew.Node.createSuper() : skew.Node.createCall(skew.Node.createSuper(), values)));
  }

  // Add an argument for every uninitialized variable
  var parent = symbol.parent.asObjectSymbol();
  self.initializeSymbol(parent);

  for (var i2051 = 0, x2051 = parent.variables; i2051 < x2051.length; i2051++) {
    var variable = x2051[i2051];
    if (variable.kind === skew.SymbolKind.VARIABLE_INSTANCE) {
      self.initializeSymbol(variable);

      if (variable.value === null) {
        var argument = new skew.VariableSymbol(skew.SymbolKind.VARIABLE_LOCAL, variable.name);
        argument.resolvedType = variable.resolvedType;
        argument.state = skew.SymbolState.INITIALIZED;
        in_List.append$851(symbol.$arguments, argument);
        in_List.append$851(statements, skew.Node.createExpression(skew.Node.createBinary(skew.NodeKind.ASSIGN, skew.resolving.Resolver.createMemberReference(skew.resolving.Resolver.createSymbolReference(symbol.self), variable), skew.resolving.Resolver.createSymbolReference(argument))));
      } else {
        in_List.append$851(statements, skew.Node.createExpression(skew.Node.createBinary(skew.NodeKind.ASSIGN, skew.resolving.Resolver.createMemberReference(skew.resolving.Resolver.createSymbolReference(symbol.self), variable), variable.value)));
        variable.value = null;
      }
    }
  }

  // Create the function body
  symbol.block = skew.Node.createBlock(statements);

  // Make constructors without arguments into getters
  if (in_List.isEmpty$845(symbol.$arguments)) {
    symbol.flags |= skew.Symbol.IS_GETTER;
  }
};

skew.resolving.Resolver.prototype.resolveFunction = function(symbol) {
  var self = this;
  self.initializeSymbol(symbol);
  var scope = new skew.LocalScope(symbol.scope, skew.LocalType.NORMAL);

  if (symbol.self !== null) {
    scope.define(symbol.self, self.log);
  }

  // Default values for argument variables aren't resolved with this local
  // scope since they are evaluated at the call site, not inside the
  // function body, and shouldn't have access to other arguments
  for (var i2056 = 0, x2056 = symbol.$arguments; i2056 < x2056.length; i2056++) {
    var argument = x2056[i2056];
    scope.define(argument, self.log);
  }

  // The function is considered abstract if the body is missing
  if (symbol.block !== null) {
    self.resolveNode(symbol.block, scope, null);

    // Missing a return statement is an error
    if (symbol.kind !== skew.SymbolKind.FUNCTION_CONSTRUCTOR) {
      var returnType = symbol.resolvedType.returnType;

      if (returnType !== null && returnType !== skew.Type.DYNAMIC && !symbol.block.blockAlwaysEndsWithReturn()) {
        self.log.semanticErrorMissingReturn(symbol.range, symbol.name, returnType);
      }
    }
  }
};

skew.resolving.Resolver.prototype.initializeVariable = function(symbol) {
  var self = this;
  self.forbidOverriddenSymbol(symbol);

  // Normal variables may omit the initializer if the type is present
  if (symbol.type !== null) {
    self.resolveAsParameterizedType(symbol.type, symbol.scope);
    symbol.resolvedType = symbol.type.resolvedType;

    // Resolve the constant now so initialized constants always have a value
    if (symbol.isConst() && symbol.value !== null) {
      self.resolveAsParameterizedExpressionWithConversion(symbol.value, symbol.scope, symbol.resolvedType);
    }
  }

  // Enums take their type from their parent
  else if (symbol.kind === skew.SymbolKind.VARIABLE_ENUM) {
    symbol.resolvedType = symbol.parent.resolvedType;
  }

  // Implicitly-typed variables take their type from their initializer
  else if (symbol.value !== null) {
    self.resolveAsParameterizedExpression(symbol.value, symbol.scope);
    var type = symbol.value.resolvedType;
    symbol.resolvedType = type;

    // Forbid certain types
    if (!skew.resolving.Resolver.isValidVariableType(type)) {
      self.log.semanticErrorBadVariableType(symbol.range, type);
      symbol.resolvedType = skew.Type.DYNAMIC;
    }
  }

  // Use a different error for constants which must have a type and lambda arguments which cannot have an initializer
  else if (symbol.isConst() || symbol.scope.kind$2438() === skew.ScopeKind.FUNCTION && symbol.scope.asFunctionScope().symbol.kind === skew.SymbolKind.FUNCTION_LOCAL) {
    self.log.semanticErrorVarMissingType(symbol.range, symbol.name);
    symbol.resolvedType = skew.Type.DYNAMIC;
  }

  // Variables without a type are an error
  else {
    self.log.semanticErrorVarMissingValue(symbol.range, symbol.name);
    symbol.resolvedType = skew.Type.DYNAMIC;
  }

  self.resolveAnnotations(symbol);

  // Run post-annotation checks
  if (symbol.resolvedType !== skew.Type.DYNAMIC && symbol.isConst() && !symbol.isImported() && symbol.value === null && symbol.kind !== skew.SymbolKind.VARIABLE_ENUM && symbol.kind !== skew.SymbolKind.VARIABLE_INSTANCE) {
    self.log.semanticErrorConstMissingValue(symbol.range, symbol.name);
  }
};

skew.resolving.Resolver.prototype.resolveVariable = function(symbol) {
  var self = this;
  self.initializeSymbol(symbol);

  if (symbol.value !== null) {
    self.resolveAsParameterizedExpressionWithConversion(symbol.value, symbol.scope, symbol.resolvedType);
  }
};

skew.resolving.Resolver.prototype.initializeOverloadedFunction = function(symbol) {
  var self = this;
  var symbols = symbol.symbols;

  if (symbol.resolvedType === null) {
    symbol.resolvedType = new skew.Type(skew.TypeKind.SYMBOL, symbol);
  }

  // Ensure no two overloads have the same argument types
  var types = [];
  var i = 0;

  while (i < in_List.count$846(symbols)) {
    var $function = symbols[i];
    self.initializeSymbol($function);
    var index = types.indexOf($function.argumentOnlyType);

    if (index !== -1) {
      var other = symbols[index];

      // Allow duplicate function declarations with the same type to merge
      // as long as there is one declaration that provides an implementation
      if ($function.block !== null === (other.block !== null) || $function.resolvedType.returnType !== other.resolvedType.returnType) {
        self.log.semanticErrorDuplicateOverload($function.range, symbol.name, other.range);
      } else if ($function.block !== null) {
        $function.flags |= other.flags & ~skew.Symbol.IS_IMPORTED;
        symbols[index] = $function;
      } else {
        other.flags |= $function.flags & ~skew.Symbol.IS_IMPORTED;
      }

      // Remove the symbol after the merge so "types" still matches "symbols"
      in_List.removeAt$865(symbols, i);
      continue;
    }

    in_List.append$851(types, $function.argumentOnlyType);
    i += 1;
  }

  // Include non-overridden overloads from the base class
  var overridden = self.findOverriddenMember(symbol);

  if (overridden !== null && skew.SymbolKind.isOverloadedFunction(overridden.kind)) {
    symbol.overridden = overridden.asOverloadedFunctionSymbol();

    for (var i2072 = 0, x2072 = symbol.overridden.symbols; i2072 < x2072.length; i2072++) {
      var $function = x2072[i2072];
      // Constructors are not inherited
      if ($function.kind !== skew.SymbolKind.FUNCTION_CONSTRUCTOR) {
        self.initializeSymbol($function);
        var index = types.indexOf($function.argumentOnlyType);

        if (index === -1) {
          in_List.append$851(symbols, $function);
          in_List.append$851(types, $function.argumentOnlyType);
        }
      }
    }
  }
};

skew.resolving.Resolver.prototype.resolveNode = function(node, scope, context) {
  var self = this;
  if (node.resolvedType !== null) {
    // Only resolve once
    return;
  }

  node.resolvedType = skew.Type.DYNAMIC;

  switch (node.kind) {
    case skew.NodeKind.BLOCK: {
      self.resolveBlock(node, scope);
      break;
    }

    case skew.NodeKind.PAIR: {
      self.resolvePair(node, scope);
      break;
    }

    case skew.NodeKind.BREAK:
    case skew.NodeKind.CONTINUE: {
      self.resolveJump(node, scope);
      break;
    }

    case skew.NodeKind.EXPRESSION: {
      self.resolveExpression(node, scope);
      break;
    }

    case skew.NodeKind.FOR: {
      self.resolveFor(node, scope);
      break;
    }

    case skew.NodeKind.IF: {
      self.resolveIf(node, scope);
      break;
    }

    case skew.NodeKind.IMPLICIT_RETURN:
    case skew.NodeKind.RETURN: {
      self.resolveReturn(node, scope);
      break;
    }

    case skew.NodeKind.SWITCH: {
      self.resolveSwitch(node, scope);
      break;
    }

    case skew.NodeKind.VAR: {
      self.resolveVar(node, scope);
      break;
    }

    case skew.NodeKind.WHILE: {
      self.resolveWhile(node, scope);
      break;
    }

    case skew.NodeKind.ASSIGN_INDEX: {
      self.resolveIndex(node, scope);
      break;
    }

    case skew.NodeKind.CALL: {
      self.resolveCall(node, scope);
      break;
    }

    case skew.NodeKind.CAST: {
      self.resolveCast(node, scope, context);
      break;
    }

    case skew.NodeKind.CONSTANT: {
      self.resolveConstant(node, scope);
      break;
    }

    case skew.NodeKind.DOT: {
      self.resolveDot(node, scope, context);
      break;
    }

    case skew.NodeKind.DYNAMIC: {
      break;
    }

    case skew.NodeKind.HOOK: {
      self.resolveHook(node, scope, context);
      break;
    }

    case skew.NodeKind.INDEX: {
      self.resolveIndex(node, scope);
      break;
    }

    case skew.NodeKind.INITIALIZER_LIST:
    case skew.NodeKind.INITIALIZER_MAP:
    case skew.NodeKind.INITIALIZER_SET: {
      self.resolveInitializer(node, scope, context);
      break;
    }

    case skew.NodeKind.INTERPOLATE: {
      self.resolveInterpolate(node, scope);
      break;
    }

    case skew.NodeKind.LAMBDA: {
      self.resolveLambda(node, scope, context);
      break;
    }

    case skew.NodeKind.LAMBDA_TYPE: {
      self.resolveLambdaType(node, scope);
      break;
    }

    case skew.NodeKind.NAME: {
      self.resolveName(node, scope);
      break;
    }

    case skew.NodeKind.NULL: {
      node.resolvedType = skew.Type.NULL;
      break;
    }

    case skew.NodeKind.PARAMETERIZE: {
      self.resolveParameterize(node, scope);
      break;
    }

    case skew.NodeKind.SUPER: {
      self.resolveSuper(node, scope);
      break;
    }

    default: {
      if (skew.NodeKind.isUnary(node.kind)) {
        self.resolveUnary(node, scope);
      } else if (skew.NodeKind.isBinary(node.kind)) {
        self.resolveBinary(node, scope);
      } else {
        assert(false);
      }
      break;
    }
  }

  assert(node.resolvedType !== null);
};

skew.resolving.Resolver.prototype.resolveAsParameterizedType = function(node, scope) {
  var self = this;
  assert(skew.NodeKind.isExpression(node.kind));
  self.resolveNode(node, scope, null);
  self.checkIsType(node);
  self.checkIsParameterized(node);
};

skew.resolving.Resolver.prototype.resolveAsParameterizedExpression = function(node, scope) {
  var self = this;
  assert(skew.NodeKind.isExpression(node.kind));
  self.resolveNode(node, scope, null);
  self.checkIsInstance(node);
  self.checkIsParameterized(node);
};

skew.resolving.Resolver.prototype.resolveAsParameterizedExpressionWithTypeContext = function(node, scope, type) {
  var self = this;
  assert(skew.NodeKind.isExpression(node.kind));
  self.resolveNode(node, scope, type);
  self.checkIsInstance(node);
  self.checkIsParameterized(node);
};

skew.resolving.Resolver.prototype.resolveAsParameterizedExpressionWithConversion = function(node, scope, type) {
  var self = this;
  self.resolveAsParameterizedExpressionWithTypeContext(node, scope, type);
  self.checkConversion(node, type, skew.resolving.ConversionKind.IMPLICIT);
};

skew.resolving.Resolver.prototype.resolveChildrenAsParameterizedExpressions = function(node, scope) {
  var self = this;
  for (var i2095 = 0, x2095 = node.children; i2095 < x2095.length; i2095++) {
    var child = x2095[i2095];
    self.resolveAsParameterizedExpression(child, scope);
  }
};

skew.resolving.Resolver.prototype.checkUnusedExpression = function(node) {
  var self = this;
  var kind = node.kind;

  if (kind === skew.NodeKind.HOOK) {
    self.checkUnusedExpression(node.hookTrue());
    self.checkUnusedExpression(node.hookFalse());
  } else if (node.range !== null && node.resolvedType !== skew.Type.DYNAMIC && kind !== skew.NodeKind.CALL && !skew.NodeKind.isBinaryAssign(kind)) {
    self.log.semanticWarningUnusedExpression(node.range);
  }
};

skew.resolving.Resolver.prototype.checkIsInstance = function(node) {
  var self = this;
  if (node.resolvedType !== skew.Type.DYNAMIC && node.isType()) {
    self.log.semanticErrorUnexpectedType(node.range, node.resolvedType);
    node.resolvedType = skew.Type.DYNAMIC;
  }
};

skew.resolving.Resolver.prototype.checkIsType = function(node) {
  var self = this;
  if (node.resolvedType !== skew.Type.DYNAMIC && !node.isType()) {
    self.log.semanticErrorUnexpectedExpression(node.range, node.resolvedType);
    node.resolvedType = skew.Type.DYNAMIC;
  }
};

skew.resolving.Resolver.prototype.checkIsParameterized = function(node) {
  var self = this;
  if (node.resolvedType.parameters() !== null && !node.resolvedType.isParameterized()) {
    self.log.semanticErrorUnparameterizedType(node.range, node.resolvedType);
    node.resolvedType = skew.Type.DYNAMIC;
  }
};

skew.resolving.Resolver.prototype.checkStorage = function(node, scope) {
  var self = this;
  var symbol = node.symbol;

  // Only allow storage to variables
  if (node.kind !== skew.NodeKind.NAME && node.kind !== skew.NodeKind.DOT || symbol !== null && !skew.SymbolKind.isVariable(symbol.kind)) {
    self.log.semanticErrorBadStorage(node.range);
  }

  // Forbid storage to constants
  else if (symbol !== null && symbol.isConst()) {
    var $function = scope.findEnclosingFunction();

    // Allow assignments to constants inside constructors
    if ($function === null || $function.symbol.kind !== skew.SymbolKind.FUNCTION_CONSTRUCTOR || $function.symbol.parent !== symbol.parent || symbol.kind !== skew.SymbolKind.VARIABLE_INSTANCE) {
      self.log.semanticErrorStorageToConstSymbol(node.internalRangeOrRange(), symbol.name);
    }
  }
};

skew.resolving.Resolver.prototype.checkAccess = function(node, scope) {
  var self = this;
  var symbol = node.symbol;

  if (symbol !== null && symbol.isPrivateOrProtected()) {
    var isPrivate = symbol.isPrivate();

    while (scope !== null) {
      if (scope.kind$2438() === skew.ScopeKind.OBJECT) {
        var object = scope.asObjectScope().symbol;

        if (object === symbol.parent || !isPrivate && object.hasBaseClass(symbol.parent)) {
          return;
        }
      }

      scope = scope.parent;
    }

    self.log.semanticErrorAccessViolation(node.internalRangeOrRange(), isPrivate ? "@private" : "@protected", symbol.name);
  }
};

skew.resolving.Resolver.prototype.checkConversion = function(node, to, kind) {
  var self = this;
  var from = node.resolvedType;
  assert(from !== null);
  assert(to !== null);

  // The "dynamic" type is a hole in the type system
  if (from === skew.Type.DYNAMIC || to === skew.Type.DYNAMIC) {
    return;
  }

  // No conversion is needed for identical types
  if (from === to) {
    return;
  }

  // The implicit conversion must be valid
  if (kind === skew.resolving.ConversionKind.IMPLICIT && !self.cache.canImplicitlyConvert(from, to) || kind === skew.resolving.ConversionKind.EXPLICIT && !self.cache.canExplicitlyConvert(from, to)) {
    self.log.semanticErrorIncompatibleTypes(node.range, from, to, self.cache.canExplicitlyConvert(from, to));
    node.resolvedType = skew.Type.DYNAMIC;
    return;
  }

  // Make the implicit conversion explicit for convenience later on
  if (kind === skew.resolving.ConversionKind.IMPLICIT) {
    var value = skew.Node.createNull();
    value.become(node);
    node.become(skew.Node.createCast(value, skew.Node.createType(to)).withType(to).withRange(node.range));
  }
};

skew.resolving.Resolver.prototype.resolveAnnotation = function(node, symbol) {
  var self = this;
  var value = node.annotationValue();
  var test = node.annotationTest();
  self.resolveNode(value, symbol.scope, null);

  if (test !== null) {
    self.resolveAsParameterizedExpressionWithConversion(test, symbol.scope, self.cache.boolType);
  }

  // Terminate early when there were errors
  if (value.symbol === null) {
    return;
  }

  // Make sure annotations have the arguments they need
  if (value.kind !== skew.NodeKind.CALL) {
    self.log.semanticErrorArgumentCount(value.range, in_List.count$846(value.symbol.resolvedType.argumentTypes), 0, value.symbol.name);
    return;
  }

  // Apply built-in annotation logic
  var flag = in_StringMap.get$811(skew.resolving.Resolver.annotationSymbolFlags, value.symbol.fullName(), 0);

  if (flag !== 0) {
    var isValid = true;

    switch (flag) {
      case skew.Symbol.IS_EXPORTED: {
        isValid = !symbol.isImported();
        break;
      }

      case skew.Symbol.IS_IMPORTED: {
        isValid = !symbol.isExported();
        break;
      }

      case skew.Symbol.IS_PREFERRED: {
        isValid = skew.SymbolKind.isFunction(symbol.kind);
        break;
      }

      case skew.Symbol.IS_PRIVATE: {
        isValid = !symbol.isProtected() && symbol.parent !== null && symbol.parent.kind !== skew.SymbolKind.OBJECT_GLOBAL;
        break;
      }

      case skew.Symbol.IS_PROTECTED: {
        isValid = !symbol.isPrivate() && symbol.parent !== null && symbol.parent.kind !== skew.SymbolKind.OBJECT_GLOBAL;
        break;
      }

      case skew.Symbol.IS_RENAMED: {
        break;
      }

      case skew.Symbol.IS_SKIPPED: {
        isValid = skew.SymbolKind.isFunction(symbol.kind) && symbol.resolvedType.returnType === null;
        break;
      }
    }

    if (!isValid) {
      self.log.semanticErrorInvalidAnnotation(value.range, value.symbol.name, symbol.name);
    } else if ((symbol.flags & flag) !== 0) {
      self.log.semanticErrorDuplicateAnnotation(value.range, value.symbol.name, symbol.name);
    } else {
      symbol.flags |= flag;
    }
  }
};

skew.resolving.Resolver.prototype.resolveBlock = function(node, scope) {
  var self = this;
  assert(node.kind === skew.NodeKind.BLOCK);
  var children = node.children;
  var n = in_List.count$846(children);
  var i = 0;

  while (i < n) {
    var child = children[i];

    // There is a well-known ambiguity in languages like JavaScript where
    // a return statement followed by a newline and a value can either be
    // parsed as a single return statement with a value or as two
    // statements, a return statement without a value and an expression
    // statement. Luckily, we're better off than JavaScript since we know
    // the type of the function. Parse a single statement in a non-void
    // function but two statements in a void function.
    if (child.kind === skew.NodeKind.RETURN && i + 1 < n && child.returnValue() === null && children[i + 1].kind === skew.NodeKind.EXPRESSION) {
      var $function = scope.findEnclosingFunctionOrLambda().symbol;

      if ($function.kind !== skew.SymbolKind.FUNCTION_CONSTRUCTOR && $function.resolvedType.returnType !== null) {
        child.replaceChild(0, node.removeChildAtIndex(i + 1).expressionValue().replaceWithNull());
        n -= 1;
      }
    }

    self.resolveNode(child, scope, null);
    i += 1;
  }
};

skew.resolving.Resolver.prototype.resolvePair = function(node, scope) {
  var self = this;
  self.resolveAsParameterizedExpression(node.firstValue(), scope);
  self.resolveAsParameterizedExpression(node.secondValue(), scope);
};

skew.resolving.Resolver.prototype.resolveJump = function(node, scope) {
  var self = this;
  if (scope.findEnclosingLoop() === null) {
    self.log.semanticErrorBadJump(node.range, node.kind === skew.NodeKind.BREAK ? "break" : "continue");
  }
};

skew.resolving.Resolver.prototype.resolveExpression = function(node, scope) {
  var self = this;
  var value = node.expressionValue();
  self.resolveAsParameterizedExpression(value, scope);
  self.checkUnusedExpression(value);
};

skew.resolving.Resolver.prototype.resolveFor = function(node, scope) {
  var self = this;
  var type = skew.Type.DYNAMIC;
  scope = new skew.LocalScope(scope, skew.LocalType.LOOP);
  var value = node.forValue();
  self.resolveAsParameterizedExpression(value, scope);

  // Support "for i in 0..10"
  if (value.kind === skew.NodeKind.PAIR) {
    var first = value.firstValue();
    var second = value.secondValue();
    type = self.cache.intType;
    self.checkConversion(first, self.cache.intType, skew.resolving.ConversionKind.IMPLICIT);
    self.checkConversion(second, self.cache.intType, skew.resolving.ConversionKind.IMPLICIT);

    // The ".." syntax only counts up, unlike CoffeeScript
    if (first.kind === skew.NodeKind.CONSTANT && first.content.kind$474() === skew.ContentKind.INT && second.kind === skew.NodeKind.CONSTANT && second.content.kind$474() === skew.ContentKind.INT && first.content.asInt() >= second.content.asInt()) {
      self.log.semanticWarningEmptyRange(value.range);
    }
  }

  // Support "for i in [1, 2, 3]"
  else if (self.cache.isList(value.resolvedType)) {
    type = value.resolvedType.substitutions[0];
  }

  // Anything else is an error
  else if (value.resolvedType !== skew.Type.DYNAMIC) {
    self.log.semanticErrorBadForValue(value.range, value.resolvedType);
  }

  // Special-case symbol initialization with the type
  var symbol = node.symbol.asVariableSymbol();
  scope.asLocalScope().define(symbol, self.log);
  symbol.resolvedType = type;
  symbol.flags |= skew.Symbol.IS_CONST;
  symbol.state = skew.SymbolState.INITIALIZED;
  self.resolveBlock(node.forBlock(), scope);
};

skew.resolving.Resolver.prototype.resolveIf = function(node, scope) {
  var self = this;
  var ifFalse = node.ifFalse();
  self.resolveAsParameterizedExpressionWithConversion(node.ifTest(), scope, self.cache.boolType);
  self.resolveBlock(node.ifTrue(), new skew.LocalScope(scope, skew.LocalType.NORMAL));

  if (ifFalse !== null) {
    self.resolveBlock(ifFalse, new skew.LocalScope(scope, skew.LocalType.NORMAL));
  }
};

skew.resolving.Resolver.prototype.resolveReturn = function(node, scope) {
  var self = this;
  var value = node.returnValue();
  var $function = scope.findEnclosingFunctionOrLambda().symbol;
  var returnType = $function.kind !== skew.SymbolKind.FUNCTION_CONSTRUCTOR ? $function.resolvedType.returnType : null;

  // Check for a returned value
  if (value === null) {
    if (returnType !== null) {
      self.log.semanticErrorExpectedReturnValue(node.range, returnType);
    }

    return;
  }

  // Check the type of the returned value
  if (returnType !== null) {
    self.resolveAsParameterizedExpressionWithConversion(value, scope, returnType);
    return;
  }

  // If there's no return type, still check for other errors
  self.resolveAsParameterizedExpression(value, scope);

  // Lambdas without a return type or an explicit "return" statement get special treatment
  if (node.kind !== skew.NodeKind.IMPLICIT_RETURN) {
    self.log.semanticErrorUnexpectedReturnValue(value.range);
    return;
  }

  // Check for a return value of type "void"
  if (!$function.shouldInferReturnType() || value.kind === skew.NodeKind.CALL && value.symbol !== null && value.symbol.resolvedType.returnType === null) {
    self.checkUnusedExpression(value);
    node.kind = skew.NodeKind.EXPRESSION;
    return;
  }

  // Check for an invalid return type
  var type = value.resolvedType;

  if (!skew.resolving.Resolver.isValidVariableType(type)) {
    self.log.semanticErrorBadReturnType(value.range, type);
    node.kind = skew.NodeKind.EXPRESSION;
    return;
  }

  // Mutate the return type to the type from the returned value
  $function.returnType = skew.Node.createType(type);
};

skew.resolving.Resolver.prototype.resolveSwitch = function(node, scope) {
  var self = this;
  var value = node.switchValue();
  var cases = node.children;
  self.resolveAsParameterizedExpression(value, scope);

  for (var i = 1, n2171 = in_List.count$846(cases); i < n2171; i++) {
    var child = cases[i];
    var values = child.children;

    for (var j = 1, n2174 = in_List.count$846(values); j < n2174; j++) {
      self.resolveAsParameterizedExpressionWithConversion(values[j], scope, value.resolvedType);
    }

    self.resolveBlock(child.caseBlock(), new skew.LocalScope(scope, skew.LocalType.NORMAL));
  }
};

skew.resolving.Resolver.prototype.resolveVar = function(node, scope) {
  var self = this;
  var symbol = node.symbol.asVariableSymbol();
  scope.asLocalScope().define(symbol, self.log);
  self.resolveVariable(symbol);
};

skew.resolving.Resolver.prototype.resolveWhile = function(node, scope) {
  var self = this;
  self.resolveAsParameterizedExpressionWithConversion(node.whileTest(), scope, self.cache.boolType);
  self.resolveBlock(node.whileBlock(), new skew.LocalScope(scope, skew.LocalType.LOOP));
};

skew.resolving.Resolver.prototype.resolveCall = function(node, scope) {
  var self = this;
  var value = node.callValue();
  self.resolveAsParameterizedExpression(value, scope);
  var type = value.resolvedType;

  switch (type.kind) {
    case skew.TypeKind.SYMBOL: {
      if (self.resolveSymbolCall(node, scope, type)) {
        return;
      }
      break;
    }

    case skew.TypeKind.LAMBDA: {
      if (self.resolveFunctionCall(node, scope, type)) {
        return;
      }
      break;
    }

    default: {
      if (type !== skew.Type.DYNAMIC) {
        self.log.semanticErrorInvalidCall(node.internalRangeOrRange(), value.resolvedType);
      }
      break;
    }
  }

  // If there was an error, resolve the arguments to check for further
  // errors but use a dynamic type context to avoid introducing errors
  for (var i = 1, n2187 = in_List.count$846(node.children); i < n2187; i++) {
    self.resolveAsParameterizedExpressionWithConversion(node.children[i], scope, skew.Type.DYNAMIC);
  }
};

skew.resolving.Resolver.prototype.resolveSymbolCall = function(node, scope, type) {
  var self = this;
  var symbol = type.symbol;

  // Getters are called implicitly, so explicitly calling one is an error.
  // This error prevents a getter returning a lambda which is then called,
  // but that's really strange and I think this error is more useful.
  if (symbol.isGetter() && skew.resolving.Resolver.isCallValue(node)) {
    self.log.semanticErrorGetterCalledTwice(node.parent.internalRangeOrRange(), symbol.name);
    return false;
  }

  // Check for calling a function directly
  if (skew.SymbolKind.isFunction(symbol.kind)) {
    return self.resolveFunctionCall(node, scope, type);
  }

  // Check for calling a set of functions, must not be ambiguous
  if (skew.SymbolKind.isOverloadedFunction(symbol.kind)) {
    return self.resolveOverloadedFunctionCall(node, scope, type);
  }

  // Can't call other symbols
  self.log.semanticErrorInvalidCall(node.internalRangeOrRange(), node.callValue().resolvedType);
  return false;
};

skew.resolving.Resolver.prototype.resolveFunctionCall = function(node, scope, type) {
  var self = this;
  var $function = type.symbol !== null ? type.symbol.asFunctionSymbol() : null;
  var expected = in_List.count$846(type.argumentTypes);
  var count = in_List.count$846(node.children) - 1;
  node.symbol = $function;

  // Use the return type even if there were errors
  if (type.returnType !== null) {
    node.resolvedType = type.returnType;
  }

  // There is no "void" type, so make sure this return value isn't used
  else if (skew.resolving.Resolver.isVoidExpressionUsed(node)) {
    if ($function !== null) {
      self.log.semanticErrorUseOfVoidFunction(node.range, $function.name);
    } else {
      self.log.semanticErrorUseOfVoidLambda(node.range);
    }
  }

  // Check argument count
  if (expected !== count) {
    self.log.semanticErrorArgumentCount(node.internalRangeOrRange(), expected, count, $function !== null ? $function.name : "");
    return false;
  }

  // Check argument types
  for (var i = 0, n2200 = count; i < n2200; i++) {
    self.resolveAsParameterizedExpressionWithConversion(node.children[i + 1], scope, type.argumentTypes[i]);
  }

  // Replace overloaded symbols with the chosen overload
  var callValue = node.children[0];

  if ($function !== null && $function.overloaded !== null && callValue.symbol === $function.overloaded) {
    callValue.symbol = $function;
  }

  return true;
};

skew.resolving.Resolver.prototype.resolveOverloadedFunction = function(range, children, scope, symbolType) {
  var self = this;
  var overloaded = symbolType.symbol.asOverloadedFunctionSymbol();
  var count = in_List.count$846(children) - 1;
  var candidates = [];

  // Filter by argument length and substitute using the current type environment
  for (var i2210 = 0, x2210 = overloaded.symbols; i2210 < x2210.length; i2210++) {
    var symbol = x2210[i2210];
    if (in_List.count$846(symbol.$arguments) === count || in_List.count$846(overloaded.symbols) === 1) {
      in_List.append$851(candidates, self.cache.substitute(symbol.resolvedType, symbolType.environment));
    }
  }

  // Check for matches
  if (in_List.isEmpty$845(candidates)) {
    self.log.semanticErrorNoMatchingOverload(range, overloaded.name, count, null);
    return null;
  }

  // Check for an unambiguous match
  if (in_List.count$846(candidates) === 1) {
    return candidates[0];
  }

  // First filter by syntactic structure impossibilities. This helps break
  // the chicken-and-egg problem of needing to resolve argument types to
  // get a match and needing a match to resolve argument types. For example,
  // a list literal needs type context to resolve correctly.
  var index = 0;

  while (index < in_List.count$846(candidates)) {
    var argumentTypes = candidates[index].argumentTypes;

    for (var i = 0, n2213 = count; i < n2213; i++) {
      var kind = children[i + 1].kind;
      var type = argumentTypes[i];

      if (kind === skew.NodeKind.NULL && !type.isReference() || kind === skew.NodeKind.INITIALIZER_LIST && self.findMember(type, "[new]") === null && self.findMember(type, "[...]") === null || (kind === skew.NodeKind.INITIALIZER_SET || kind === skew.NodeKind.INITIALIZER_MAP) && self.findMember(type, "{new}") === null && self.findMember(type, "{...}") === null) {
        in_List.removeAt$865(candidates, index);
        index -= 1;
        break;
      }
    }

    index += 1;
  }

  // Check for an unambiguous match
  if (in_List.count$846(candidates) === 1) {
    return candidates[0];
  }

  // If that still didn't work, resolve the arguments without type context
  for (var i = 0, n2216 = count; i < n2216; i++) {
    self.resolveAsParameterizedExpression(children[i + 1], scope);
  }

  // Try again, this time discarding all implicit conversion failures
  index = 0;

  while (index < in_List.count$846(candidates)) {
    var argumentTypes = candidates[index].argumentTypes;

    for (var i = 0, n2218 = count; i < n2218; i++) {
      if (!self.cache.canImplicitlyConvert(children[i + 1].resolvedType, argumentTypes[i])) {
        in_List.removeAt$865(candidates, index);
        index -= 1;
        break;
      }
    }

    index += 1;
  }

  // Check for an unambiguous match
  if (in_List.count$846(candidates) === 1) {
    return candidates[0];
  }

  // Extract argument types for an error if there is one
  var childTypes = [];

  for (var i = 0, n2220 = count; i < n2220; i++) {
    in_List.append$851(childTypes, children[i + 1].resolvedType);
  }

  // Give up without a match
  if (in_List.isEmpty$845(candidates)) {
    self.log.semanticErrorNoMatchingOverload(range, overloaded.name, count, childTypes);
    return null;
  }

  // If that still didn't work, try type equality
  for (var i2221 = 0, x2221 = candidates; i2221 < x2221.length; i2221++) {
    var type = x2221[i2221];
    var isMatch = true;

    for (var i = 0, n2223 = count; i < n2223; i++) {
      if (children[i + 1].resolvedType !== type.argumentTypes[i]) {
        isMatch = false;
        break;
      }
    }

    if (isMatch) {
      return type;
    }
  }

  // If that still didn't work, try picking the preferred overload
  var firstPreferred = null;
  var secondPreferred = null;

  for (var i2226 = 0, x2226 = candidates; i2226 < x2226.length; i2226++) {
    var type = x2226[i2226];
    if (type.symbol.isPreferred()) {
      secondPreferred = firstPreferred;
      firstPreferred = type;
    }
  }

  // Check for a single preferred overload
  if (firstPreferred !== null && secondPreferred === null) {
    return firstPreferred;
  }

  // Give up since the overload is ambiguous
  self.log.semanticErrorAmbiguousOverload(range, overloaded.name, count, childTypes);
  return null;
};

skew.resolving.Resolver.prototype.resolveOverloadedFunctionCall = function(node, scope, type) {
  var self = this;
  var match = self.resolveOverloadedFunction(node.callValue().range, node.children, scope, type);
  return match !== null && self.resolveFunctionCall(node, scope, match);
};

skew.resolving.Resolver.prototype.resolveCast = function(node, scope, context) {
  var self = this;
  var value = node.castValue();
  var type = node.castType();
  self.resolveAsParameterizedType(type, scope);
  self.resolveAsParameterizedExpressionWithTypeContext(value, scope, type.resolvedType);
  self.checkConversion(value, type.resolvedType, skew.resolving.ConversionKind.EXPLICIT);
  node.resolvedType = type.resolvedType;

  // Warn about unnecessary casts
  if (value.resolvedType === type.resolvedType || context === type.resolvedType && self.cache.canImplicitlyConvert(value.resolvedType, type.resolvedType)) {
    self.log.semanticWarningExtraCast(skew.Range.span(node.internalRangeOrRange(), type.range), value.resolvedType, type.resolvedType);
  }
};

skew.resolving.Resolver.prototype.resolveConstant = function(node, scope) {
  var self = this;
  switch (node.content.kind$474()) {
    case skew.ContentKind.BOOL: {
      node.resolvedType = self.cache.boolType;
      break;
    }

    case skew.ContentKind.DOUBLE: {
      node.resolvedType = self.cache.doubleType;
      break;
    }

    case skew.ContentKind.INT: {
      node.resolvedType = self.cache.intType;
      break;
    }

    case skew.ContentKind.STRING: {
      node.resolvedType = self.cache.stringType;
      break;
    }

    default: {
      assert(false);
      break;
    }
  }
};

skew.resolving.Resolver.prototype.findOverriddenMember = function(symbol) {
  var self = this;
  if (symbol.parent !== null && symbol.parent.kind === skew.SymbolKind.OBJECT_CLASS) {
    var object = symbol.parent.asObjectSymbol();

    if (object.baseClass !== null) {
      return self.findMember(object.baseClass.resolvedType, symbol.name);
    }
  }

  return null;
};

skew.resolving.Resolver.prototype.forbidOverriddenSymbol = function(symbol) {
  var self = this;
  var overridden = self.findOverriddenMember(symbol);

  if (overridden !== null) {
    self.log.semanticErrorBadOverride(symbol.range, symbol.name, symbol.parent.asObjectSymbol().base.resolvedType, overridden.range);
  }
};

skew.resolving.Resolver.prototype.findMember = function(type, name) {
  var self = this;
  var check = type;

  while (check !== null) {
    if (check.kind === skew.TypeKind.SYMBOL) {
      var symbol = check.symbol;

      if (skew.SymbolKind.isObject(symbol.kind)) {
        var member = in_StringMap.get$811(symbol.asObjectSymbol().members, name, null);

        if (member !== null) {
          self.initializeSymbol(member);
          return member;
        }
      }
    }

    check = check.baseClass();
  }

  return null;
};

skew.resolving.Resolver.prototype.resolveDot = function(node, scope, context) {
  var self = this;
  var target = node.dotTarget();
  var name = node.asString();

  // Infer the target from the type context if it's omitted
  if (target === null) {
    if (context === null) {
      self.log.semanticErrorMissingDotContext(node.range, name);
      return;
    }

    target = skew.Node.createType(context);
    node.replaceChild(0, target);
  } else {
    self.resolveNode(target, scope, null);
  }

  // Search for a setter first, then search for a normal member
  var symbol = null;

  if (skew.resolving.Resolver.shouldCheckForSetter(node)) {
    symbol = self.findMember(target.resolvedType, name + "=");
  }

  if (symbol === null) {
    symbol = self.findMember(target.resolvedType, name);

    if (symbol === null) {
      if (target.resolvedType !== skew.Type.DYNAMIC) {
        self.log.semanticErrorUnknownMemberSymbol(node.internalRangeOrRange(), name, target.resolvedType);
      }

      if (target.kind === skew.NodeKind.DYNAMIC) {
        node.kind = skew.NodeKind.NAME;
        node.removeChildren();
      }

      return;
    }
  }

  // Forbid referencing a base class global or constructor function from a derived class
  if (skew.resolving.Resolver.isBaseGlobalReference(target.resolvedType, symbol)) {
    self.log.semanticErrorUnknownMemberSymbol(node.internalRangeOrRange(), name, target.resolvedType);
    return;
  }

  var isType = target.isType();
  var needsType = !skew.SymbolKind.isOnInstances(symbol.kind);

  // Make sure the global/instance context matches the intended usage
  if (isType) {
    if (!needsType) {
      self.log.semanticErrorMemberUnexpectedInstance(node.internalRangeOrRange(), symbol.name);
    } else if (skew.SymbolKind.isFunctionOrOverloadedFunction(symbol.kind)) {
      self.checkIsParameterized(target);
    } else if (target.resolvedType.isParameterized()) {
      self.log.semanticErrorParameterizedType(target.range, target.resolvedType);
    }
  } else if (needsType) {
    self.log.semanticErrorMemberUnexpectedGlobal(node.internalRangeOrRange(), symbol.name);
  }

  // Always access referenced globals directly
  if (skew.SymbolKind.isGlobalReference(symbol.kind)) {
    node.kind = skew.NodeKind.NAME;
    node.removeChildren();
  }

  node.symbol = symbol;
  node.resolvedType = self.cache.substitute(symbol.resolvedType, target.resolvedType.environment);
  self.checkAccess(node, scope);
  self.automaticallyCallGetter(node, scope);
};

skew.resolving.Resolver.prototype.resolveHook = function(node, scope, context) {
  var self = this;
  self.resolveAsParameterizedExpressionWithConversion(node.hookTest(), scope, self.cache.boolType);
  var trueValue = node.hookTrue();
  var falseValue = node.hookFalse();

  // Use the type context from the parent
  if (context !== null) {
    self.resolveAsParameterizedExpressionWithConversion(trueValue, scope, context);
    self.resolveAsParameterizedExpressionWithConversion(falseValue, scope, context);
    node.resolvedType = context;
  }

  // Find the common type from both branches
  else {
    self.resolveAsParameterizedExpression(trueValue, scope);
    self.resolveAsParameterizedExpression(falseValue, scope);
    var common = self.cache.commonImplicitType(trueValue.resolvedType, falseValue.resolvedType);

    if (common !== null) {
      node.resolvedType = common;
    } else {
      self.log.semanticErrorNoCommonType(skew.Range.span(trueValue.range, falseValue.range), trueValue.resolvedType, falseValue.resolvedType);
    }
  }
};

skew.resolving.Resolver.prototype.resolveInitializer = function(node, scope, context) {
  var self = this;
  var count = in_List.count$846(node.children);

  // Make sure to resolve the children even if the initializer is invalid
  if (context !== null) {
    if (context === skew.Type.DYNAMIC || !self.resolveInitializerWithContext(node, scope, context)) {
      self.resolveChildrenAsParameterizedExpressions(node, scope);
    }

    return;
  }

  // First pass: only children with type context, second pass: all children
  for (var pass = 0, n2274 = 2; pass < n2274; pass++) {
    switch (node.kind) {
      case skew.NodeKind.INITIALIZER_LIST: {
        var type = null;

        // Resolve all children for this pass
        for (var i2276 = 0, x2276 = node.children; i2276 < x2276.length; i2276++) {
          var child = x2276[i2276];
          if (pass !== 0 || !skew.resolving.Resolver.needsTypeContext(child)) {
            self.resolveAsParameterizedExpression(child, scope);
            type = self.mergeCommonType(type, child);
          }
        }

        // Resolve remaining children using the type context if valid
        if (type !== null && skew.resolving.Resolver.isValidVariableType(type)) {
          self.resolveInitializerWithContext(node, scope, self.cache.createListType(type));
          return;
        }
        break;
      }

      case skew.NodeKind.INITIALIZER_MAP: {
        var keyType = null;
        var valueType = null;

        // Resolve all children for this pass
        for (var i2279 = 0, x2279 = node.children; i2279 < x2279.length; i2279++) {
          var child = x2279[i2279];
          var key = child.firstValue();
          var value = child.secondValue();

          if (pass !== 0 || !skew.resolving.Resolver.needsTypeContext(key)) {
            self.resolveAsParameterizedExpression(key, scope);
            keyType = self.mergeCommonType(keyType, key);
          }

          if (pass !== 0 || !skew.resolving.Resolver.needsTypeContext(value)) {
            self.resolveAsParameterizedExpression(value, scope);
            valueType = self.mergeCommonType(valueType, value);
          }
        }

        // Resolve remaining children using the type context if valid
        if (keyType !== null && valueType !== null && skew.resolving.Resolver.isValidVariableType(keyType) && skew.resolving.Resolver.isValidVariableType(valueType)) {
          if (keyType === self.cache.intType) {
            self.resolveInitializerWithContext(node, scope, self.cache.createIntMapType(valueType));
            return;
          }

          if (keyType === self.cache.stringType) {
            self.resolveInitializerWithContext(node, scope, self.cache.createStringMapType(valueType));
            return;
          }
        }
        break;
      }
    }
  }

  self.log.semanticErrorInitializerTypeInferenceFailed(node.range);
};

skew.resolving.Resolver.prototype.isToStringMember = function(symbol) {
  var self = this;
  return symbol.kind === skew.SymbolKind.FUNCTION_INSTANCE && in_List.isEmpty$845(symbol.resolvedType.argumentTypes) && symbol.resolvedType.returnType === self.cache.stringType;
};

skew.resolving.Resolver.prototype.hasToStringMember = function(type) {
  var self = this;
  var member = self.findMember(type, "toString");

  if (member !== null) {
    if (self.isToStringMember(member)) {
      return true;
    }

    if (member.kind === skew.SymbolKind.OVERLOADED_INSTANCE) {
      for (var i2287 = 0, x2287 = member.asOverloadedFunctionSymbol().symbols; i2287 < x2287.length; i2287++) {
        var symbol = x2287[i2287];
        if (self.isToStringMember(symbol)) {
          return true;
        }
      }
    }
  }

  return false;
};

skew.resolving.Resolver.prototype.wrapWithToString = function(node, scope) {
  var self = this;
  self.resolveAsParameterizedExpression(node, scope);

  if (node.resolvedType !== skew.Type.DYNAMIC && self.hasToStringMember(node.resolvedType)) {
    var parent = node.parent;
    var index = node.indexInParent();
    node = skew.Node.createDot(node.replaceWithNull(), "toString").withRange(node.range);
    parent.replaceChild(index, node);
  }

  self.resolveAsParameterizedExpressionWithConversion(node, scope, self.cache.stringType);
};

skew.resolving.Resolver.prototype.resolveInterpolate = function(node, scope) {
  var self = this;
  self.wrapWithToString(node.interpolateLeft(), scope);
  self.wrapWithToString(node.interpolateRight(), scope);
  node.resolvedType = self.cache.stringType;
  node.kind = skew.NodeKind.ADD;
};

skew.resolving.Resolver.prototype.shouldUseMapConstructor = function(symbol) {
  var self = this;
  if (skew.SymbolKind.isFunction(symbol.kind)) {
    return in_List.count$846(symbol.asFunctionSymbol().$arguments) === 2;
  }

  for (var i2298 = 0, x2298 = symbol.asOverloadedFunctionSymbol().symbols; i2298 < x2298.length; i2298++) {
    var overload = x2298[i2298];
    if (in_List.count$846(overload.$arguments) === 2) {
      return true;
    }
  }

  return false;
};

skew.resolving.Resolver.prototype.resolveInitializerWithContext = function(node, scope, context) {
  var self = this;
  var isList = node.kind === skew.NodeKind.INITIALIZER_LIST;
  var create = self.findMember(context, isList ? "[new]" : "{new}");
  var add = self.findMember(context, isList ? "[...]" : "{...}");

  // Special-case imported literals to prevent an infinite loop for list literals
  if (add !== null && add.isImported()) {
    var $function = add.asFunctionSymbol();

    if (in_List.count$846($function.$arguments) === (isList ? 1 : 2)) {
      var functionType = self.cache.substitute($function.resolvedType, context.environment);

      for (var i2308 = 0, x2308 = node.children; i2308 < x2308.length; i2308++) {
        var child = x2308[i2308];
        if (child.kind === skew.NodeKind.PAIR) {
          self.resolveAsParameterizedExpressionWithConversion(child.firstValue(), scope, functionType.argumentTypes[0]);
          self.resolveAsParameterizedExpressionWithConversion(child.secondValue(), scope, functionType.argumentTypes[1]);
        } else {
          self.resolveAsParameterizedExpressionWithConversion(child, scope, functionType.argumentTypes[0]);
        }
      }

      node.resolvedType = context;
      return true;
    }
  }

  // Use simple call chaining when there's an add operator present
  if (add !== null) {
    var chain = skew.Node.createDot(skew.Node.createType(context).withRange(node.range), create !== null ? create.name : "new").withRange(node.range);

    for (var i2310 = 0, x2310 = node.children; i2310 < x2310.length; i2310++) {
      var child = x2310[i2310];
      var dot = skew.Node.createDot(chain, add.name).withRange(child.range);
      var $arguments = child.kind === skew.NodeKind.PAIR ? [child.firstValue().replaceWithNull(), child.secondValue().replaceWithNull()] : [child.replaceWithNull()];
      chain = skew.Node.createCall(dot, $arguments).withRange(child.range);
    }

    node.become(chain);
    self.resolveAsParameterizedExpressionWithConversion(node, scope, context);
    return true;
  }

  // Make sure there's a constructor to call
  if (create === null) {
    self.log.semanticErrorInitializerTypeInferenceFailed(node.range);
    return false;
  }

  var dot = skew.Node.createDot(skew.Node.createType(context).withRange(node.range), create.name).withRange(node.range);

  // The literal "{}" is ambiguous and may be a map or a set
  if (in_List.isEmpty$845(node.children) && !isList && self.shouldUseMapConstructor(create)) {
    node.become(skew.Node.createCall(dot, [skew.Node.createList([]).withRange(node.range), skew.Node.createList([]).withRange(node.range)]).withRange(node.range));
    self.resolveAsParameterizedExpressionWithConversion(node, scope, context);
    return true;
  }

  // Call the initializer constructor
  if (node.kind === skew.NodeKind.INITIALIZER_MAP) {
    var firstValues = [];
    var secondValues = [];

    for (var i2316 = 0, x2316 = node.children; i2316 < x2316.length; i2316++) {
      var child = x2316[i2316];
      in_List.append$851(firstValues, child.firstValue().replaceWithNull());
      in_List.append$851(secondValues, child.secondValue().replaceWithNull());
    }

    node.become(skew.Node.createCall(dot, [skew.Node.createList(firstValues).withRange(node.range), skew.Node.createList(secondValues).withRange(node.range)]).withRange(node.range));
  } else {
    node.become(skew.Node.createCall(dot, [skew.Node.createList(node.removeChildren()).withRange(node.range)]).withRange(node.range));
  }

  self.resolveAsParameterizedExpressionWithConversion(node, scope, context);
  return true;
};

skew.resolving.Resolver.prototype.mergeCommonType = function(commonType, child) {
  var self = this;
  if (commonType === null || child.resolvedType === skew.Type.DYNAMIC) {
    return child.resolvedType;
  }

  var result = self.cache.commonImplicitType(commonType, child.resolvedType);

  if (result !== null) {
    return result;
  }

  self.log.semanticErrorNoCommonType(child.range, commonType, child.resolvedType);
  return skew.Type.DYNAMIC;
};

skew.resolving.Resolver.prototype.resolveLambda = function(node, scope, context) {
  var self = this;
  var symbol = node.symbol.asFunctionSymbol();
  symbol.scope = new skew.FunctionScope(scope, symbol);

  // Use type context to implicitly set missing types
  if (context !== null && context.kind === skew.TypeKind.LAMBDA) {
    // Copy over the argument types if they line up
    if (in_List.count$846(context.argumentTypes) === in_List.count$846(symbol.$arguments)) {
      for (var i = 0, n2326 = in_List.count$846(symbol.$arguments); i < n2326; i++) {
        var argument = symbol.$arguments[i];

        if (argument.type === null) {
          argument.type = skew.Node.createType(context.argumentTypes[i]);
        }
      }
    }

    // Copy over the return type
    if (symbol.returnType === null && context.returnType !== null) {
      symbol.returnType = skew.Node.createType(context.returnType);
    }
  }

  // Only infer non-void return types if there's no type context
  else if (symbol.returnType === null) {
    symbol.flags |= skew.Symbol.SHOULD_INFER_RETURN_TYPE;
  }

  self.resolveFunction(symbol);

  // Use a LambdaType instead of a SymbolType for the node
  var argumentTypes = [];
  var returnType = symbol.returnType;

  for (var i2330 = 0, x2330 = symbol.$arguments; i2330 < x2330.length; i2330++) {
    var argument = x2330[i2330];
    in_List.append$851(argumentTypes, argument.resolvedType);
  }

  node.resolvedType = self.cache.createLambdaType(argumentTypes, returnType !== null ? returnType.resolvedType : null);
};

skew.resolving.Resolver.prototype.resolveLambdaType = function(node, scope) {
  var self = this;
  var types = [];

  for (var i2335 = 0, x2335 = node.children; i2335 < x2335.length; i2335++) {
    var child = x2335[i2335];
    if (child !== null) {
      self.resolveAsParameterizedType(child, scope);
      in_List.append$851(types, child.resolvedType);
    } else {
      in_List.append$851(types, null);
    }
  }

  var returnType = in_List.takeLast$857(types);
  node.resolvedType = self.cache.createLambdaType(types, returnType);
};

skew.resolving.Resolver.prototype.resolveName = function(node, scope) {
  var self = this;
  var enclosingFunction = scope.findEnclosingFunction();
  var name = node.asString();
  var symbol = null;

  // Search for a setter first, then search for a normal symbol
  if (skew.resolving.Resolver.shouldCheckForSetter(node)) {
    symbol = scope.find$2439(name + "=");
  }

  // If a setter wasn't found, search for a normal symbol
  if (symbol === null) {
    symbol = scope.find$2439(name);

    if (symbol === null) {
      self.log.semanticErrorUndeclaredSymbol(node.range, name);
      return;
    }
  }

  self.initializeSymbol(symbol);

  // Forbid referencing a base class global or constructor function from a derived class
  if (enclosingFunction !== null && skew.resolving.Resolver.isBaseGlobalReference(enclosingFunction.symbol.parent.resolvedType, symbol)) {
    self.log.semanticErrorUndeclaredSymbol(node.range, name);
    return;
  }

  // Automatically insert "self." before instance symbols
  if (skew.SymbolKind.isOnInstances(symbol.kind)) {
    var variable = enclosingFunction !== null ? enclosingFunction.symbol.self : null;

    if (variable !== null) {
      node.withChildren([skew.Node.createName(variable.name).withSymbol(variable).withType(variable.resolvedType)]).kind = skew.NodeKind.DOT;
    } else {
      self.log.semanticErrorMemberUnexpectedInstance(node.range, symbol.name);
    }
  }

  // Type parameters for objects may only be used in certain circumstances
  else if (symbol.kind === skew.SymbolKind.PARAMETER_OBJECT) {
    var parent = scope;
    var isValid = false;
    var stop = false;

    while (parent !== null) {
      switch (parent.kind$2438()) {
        case skew.ScopeKind.OBJECT: {
          isValid = parent.asObjectScope().symbol === symbol.parent;
          stop = true;
          break;
        }

        case skew.ScopeKind.FUNCTION: {
          var $function = parent.asFunctionScope().symbol;

          if ($function.kind !== skew.SymbolKind.FUNCTION_LOCAL) {
            isValid = $function.parent === symbol.parent;
            stop = true;
          }
          break;
        }

        case skew.ScopeKind.VARIABLE: {
          var variable = parent.asVariableScope().symbol;
          isValid = variable.kind === skew.SymbolKind.VARIABLE_INSTANCE && variable.parent === symbol.parent;
          stop = true;
          break;
        }
      }

      // TODO: Should be able to use "break" above
      if (stop) {
        break;
      }

      parent = parent.parent;
    }

    if (!isValid) {
      self.log.semanticErrorMemberUnexpectedTypeParameter(node.range, symbol.name);
    }
  }

  node.symbol = symbol;
  node.resolvedType = symbol.resolvedType;
  self.checkAccess(node, scope);
  self.automaticallyCallGetter(node, scope);
};

skew.resolving.Resolver.prototype.resolveParameterize = function(node, scope) {
  var self = this;
  var value = node.parameterizeValue();
  self.resolveNode(value, scope, null);

  // Resolve parameter types
  var substitutions = [];
  var count = in_List.count$846(node.children) - 1;

  for (var i = 0, n2355 = count; i < n2355; i++) {
    var child = node.children[i + 1];
    self.resolveAsParameterizedType(child, scope);
    in_List.append$851(substitutions, child.resolvedType);
  }

  // Check for type parameters
  var type = value.resolvedType;
  var parameters = type.parameters();

  if (parameters === null || type.isParameterized()) {
    if (type !== skew.Type.DYNAMIC) {
      self.log.semanticErrorCannotParameterize(node.range, type);
    }

    value.resolvedType = skew.Type.DYNAMIC;
    return;
  }

  // Check parameter count
  var expected = in_List.count$846(parameters);

  if (count !== expected) {
    self.log.semanticErrorParameterCount(node.internalRangeOrRange(), expected, count);
    value.resolvedType = skew.Type.DYNAMIC;
    return;
  }

  // Make sure all parameters have types
  for (var i2360 = 0, x2360 = parameters; i2360 < x2360.length; i2360++) {
    var parameter = x2360[i2360];
    self.initializeSymbol(parameter);
  }

  // Include the symbol for use with Node.isType
  node.resolvedType = self.cache.substitute(type, self.cache.mergeEnvironments(type.environment, self.cache.createEnvironment(parameters, substitutions), null));
  node.symbol = value.symbol;
};

skew.resolving.Resolver.prototype.resolveSuper = function(node, scope) {
  var self = this;
  var $function = scope.findEnclosingFunction();
  var symbol = $function === null ? null : $function.symbol;
  var overridden = symbol === null ? null : symbol.overloaded !== null ? symbol.overloaded.overridden : symbol.overridden;

  if (overridden === null) {
    self.log.semanticErrorBadSuper(node.range);
    return;
  }

  // Calling a static method doesn't need special handling
  if (overridden.kind === skew.SymbolKind.FUNCTION_GLOBAL) {
    node.kind = skew.NodeKind.NAME;
  }

  node.resolvedType = overridden.resolvedType;
  node.symbol = overridden;
  self.automaticallyCallGetter(node, scope);
};

skew.resolving.Resolver.prototype.resolveUnary = function(node, scope) {
  var self = this;
  self.resolveOperatorOverload(node, scope);
};

skew.resolving.Resolver.prototype.resolveBinary = function(node, scope) {
  var self = this;
  var kind = node.kind;
  var left = node.binaryLeft();
  var right = node.binaryRight();

  // Special-case the equality operators
  if (kind === skew.NodeKind.EQUAL || kind === skew.NodeKind.NOT_EQUAL) {
    if (skew.resolving.Resolver.needsTypeContext(left)) {
      self.resolveAsParameterizedExpression(right, scope);
      self.resolveAsParameterizedExpressionWithTypeContext(left, scope, right.resolvedType);
    } else if (skew.resolving.Resolver.needsTypeContext(right)) {
      self.resolveAsParameterizedExpression(left, scope);
      self.resolveAsParameterizedExpressionWithTypeContext(right, scope, left.resolvedType);
    } else {
      self.resolveAsParameterizedExpression(left, scope);
      self.resolveAsParameterizedExpression(right, scope);
    }

    // The two types must be compatible
    var commonType = self.cache.commonImplicitType(left.resolvedType, right.resolvedType);

    if (commonType !== null) {
      node.resolvedType = self.cache.boolType;
    } else {
      self.log.semanticErrorNoCommonType(node.range, left.resolvedType, right.resolvedType);
    }

    return;
  }

  // Special-case assignment since it's not overridable
  if (kind === skew.NodeKind.ASSIGN) {
    self.resolveAsParameterizedExpression(left, scope);

    // Automatically call setters
    if (left.symbol !== null && left.symbol.isSetter()) {
      node.become(skew.Node.createCall(left.replaceWithNull(), [right.replaceWithNull()]).withRange(node.range).withInternalRange(right.range));
      self.resolveAsParameterizedExpression(node, scope);
    }

    // Resolve the right side using type context from the left side
    else {
      self.resolveAsParameterizedExpressionWithConversion(right, scope, left.resolvedType);
      node.resolvedType = left.resolvedType;
      self.checkStorage(left, scope);
    }

    return;
  }

  // Special-case short-circuit logical operators since they aren't overridable
  if (kind === skew.NodeKind.LOGICAL_AND || kind === skew.NodeKind.LOGICAL_OR) {
    self.resolveAsParameterizedExpressionWithConversion(left, scope, self.cache.boolType);
    self.resolveAsParameterizedExpressionWithConversion(right, scope, self.cache.boolType);
    node.resolvedType = self.cache.boolType;
    return;
  }

  self.resolveOperatorOverload(node, scope);
};

skew.resolving.Resolver.prototype.resolveIndex = function(node, scope) {
  var self = this;
  self.resolveOperatorOverload(node, scope);
};

skew.resolving.Resolver.prototype.resolveOperatorOverload = function(node, scope) {
  var self = this;
  // The order of operands are reversed for the "in" operator
  var kind = node.kind;
  var reverseBinaryOrder = kind === skew.NodeKind.IN;
  var target = node.children[((reverseBinaryOrder) | 0)];
  var other = skew.NodeKind.isBinary(kind) ? node.children[1 - ((reverseBinaryOrder) | 0)] : null;

  // Allow "foo in [.FOO, .BAR]"
  if (kind === skew.NodeKind.IN && target.kind === skew.NodeKind.INITIALIZER_LIST && !skew.resolving.Resolver.needsTypeContext(other)) {
    self.resolveAsParameterizedExpression(other, scope);
    self.resolveAsParameterizedExpressionWithTypeContext(target, scope, other.resolvedType !== skew.Type.DYNAMIC ? self.cache.createListType(other.resolvedType) : null);
  }

  // Resolve just the target since the other arguments may need type context from overload resolution
  else {
    self.resolveAsParameterizedExpression(target, scope);
  }

  // Check for a valid storage location even for overloadable operators
  if (skew.NodeKind.isBinaryAssign(kind)) {
    self.checkStorage(target, scope);
  }

  // Can't do overload resolution on the dynamic type
  var type = target.resolvedType;

  if (type === skew.Type.DYNAMIC) {
    self.resolveChildrenAsParameterizedExpressions(node, scope);
    return;
  }

  // Check if the operator can be overridden at all
  var info = skew.operatorInfo[((kind) | 0)];

  if (info.kind !== skew.OperatorKind.OVERRIDABLE) {
    self.log.semanticErrorUnknownMemberSymbol(node.internalRangeOrRange(), info.text, type);
    self.resolveChildrenAsParameterizedExpressions(node, scope);
    return;
  }

  // Avoid infinite expansion
  var isComparison = skew.NodeKind.isBinaryComparison(kind);

  if (isComparison && self.cache.isNumeric(type)) {
    self.resolveAsParameterizedExpression(other, scope);

    if (self.cache.isNumeric(other.resolvedType)) {
      self.resolveChildrenAsParameterizedExpressions(node, scope);
      node.resolvedType = self.cache.boolType;
      return;
    }
  }

  // Auto-convert int to double when it appears as the target
  if (other !== null && type === self.cache.intType) {
    self.resolveAsParameterizedExpression(other, scope);

    if (other.resolvedType === self.cache.doubleType) {
      self.checkConversion(target, self.cache.doubleType, skew.resolving.ConversionKind.IMPLICIT);
      type = self.cache.doubleType;
    }
  }

  // Find the operator method
  var name = isComparison ? "<=>" : info.text;
  var symbol = self.findMember(type, name);

  if (symbol === null) {
    self.log.semanticErrorUnknownMemberSymbol(node.internalRangeOrRange(), name, type);
    self.resolveChildrenAsParameterizedExpressions(node, scope);
    return;
  }

  var symbolType = self.cache.substitute(symbol.resolvedType, type.environment);

  // Resolve the overload now so the symbol's properties can be inspected
  if (skew.SymbolKind.isOverloadedFunction(symbol.kind)) {
    if (reverseBinaryOrder) {
      node.children.reverse();
    }

    symbolType = self.resolveOverloadedFunction(node.internalRangeOrRange(), node.children, scope, symbolType);

    if (reverseBinaryOrder) {
      node.children.reverse();
    }

    if (symbolType === null) {
      self.resolveChildrenAsParameterizedExpressions(node, scope);
      return;
    }

    symbol = symbolType.symbol;
  }

  // Don't replace the operator with a call if it's just used for type checking
  if (symbol.isImported() && !symbol.isRenamed()) {
    if (reverseBinaryOrder) {
      node.children.reverse();
    }

    if (!self.resolveFunctionCall(node, scope, symbolType)) {
      self.resolveChildrenAsParameterizedExpressions(node, scope);
    }

    if (reverseBinaryOrder) {
      node.children.reverse();
    }

    return;
  }

  // Resolve the method call
  var children = node.removeChildren();

  if (reverseBinaryOrder) {
    children.reverse();
  }

  children[0] = skew.Node.createDot(children[0], name).withSymbol(symbol).withRange(node.internalRangeOrRange());

  // Implement the logic for the "<=>" operator
  if (isComparison) {
    var $call = new skew.Node(skew.NodeKind.CALL).withChildren(children).withRange(node.range);
    node.appendChild($call);
    node.appendChild(skew.Node.createInt(0));
    node.resolvedType = self.cache.boolType;
    self.resolveFunctionCall($call, scope, symbolType);
    return;
  }

  // All other operators are just normal method calls
  node.kind = skew.NodeKind.CALL;
  node.withChildren(children);
  self.resolveFunctionCall(node, scope, symbolType);
};

skew.resolving.Resolver.prototype.automaticallyCallGetter = function(node, scope) {
  var self = this;
  var symbol = node.symbol;

  if (symbol === null) {
    return;
  }

  var kind = symbol.kind;
  var parent = node.parent;
  var isGetter = symbol.isGetter();

  // The check for getters is complicated by overloaded functions
  if (!isGetter && skew.SymbolKind.isOverloadedFunction(kind) && (!skew.resolving.Resolver.isCallValue(node) || in_List.count$846(parent.children) === 1)) {
    var overloaded = symbol.asOverloadedFunctionSymbol();

    for (var i2403 = 0, x2403 = overloaded.symbols; i2403 < x2403.length; i2403++) {
      var getter = x2403[i2403];
      // Just return the first getter assuming errors for duplicate getters
      // were already logged when the overloaded symbol was initialized
      if (getter.isGetter()) {
        node.resolvedType = self.cache.substitute(getter.resolvedType, node.resolvedType.environment);
        node.symbol = getter;
        isGetter = true;
        break;
      }
    }
  }

  // Automatically wrap the getter in a call expression
  if (isGetter) {
    var value = skew.Node.createNull();
    value.become(node);
    node.become(skew.Node.createCall(value, []).withRange(node.range));
    self.resolveAsParameterizedExpression(node, scope);
  }

  // Forbid bare function references
  else if (node.resolvedType !== skew.Type.DYNAMIC && skew.SymbolKind.isFunctionOrOverloadedFunction(kind) && kind !== skew.SymbolKind.FUNCTION_ANNOTATION && !skew.resolving.Resolver.isCallValue(node) && (parent === null || parent.kind !== skew.NodeKind.PARAMETERIZE || !skew.resolving.Resolver.isCallValue(parent))) {
    self.log.semanticErrorMustCallFunction(node.internalRangeOrRange(), symbol.name);
    node.resolvedType = skew.Type.DYNAMIC;
  }
};

skew.resolving.Resolver.shouldCheckForSetter = function(node) {
  return node.parent !== null && node.parent.kind === skew.NodeKind.ASSIGN && node === node.parent.binaryLeft();
};

skew.resolving.Resolver.isVoidExpressionUsed = function(node) {
  // Check for a null parent to handle variable initializers
  var parent = node.parent;
  return parent === null || parent.kind !== skew.NodeKind.EXPRESSION && parent.kind !== skew.NodeKind.IMPLICIT_RETURN && (parent.kind !== skew.NodeKind.ANNOTATION || node !== parent.annotationValue());
};

skew.resolving.Resolver.isValidVariableType = function(type) {
  return type !== skew.Type.NULL && (type.kind !== skew.TypeKind.SYMBOL || !skew.SymbolKind.isFunctionOrOverloadedFunction(type.symbol.kind));
};

skew.resolving.Resolver.createSymbolReference = function(symbol) {
  return skew.Node.createName(symbol.name).withSymbol(symbol).withType(symbol.resolvedType);
};

skew.resolving.Resolver.createMemberReference = function(target, member) {
  return skew.Node.createDot(target, member.name).withSymbol(member).withType(member.resolvedType);
};

skew.resolving.Resolver.isBaseGlobalReference = function(parent, member) {
  return skew.SymbolKind.isGlobalReference(member.kind) && member.parent !== parent.symbol && member.parent.kind === skew.SymbolKind.OBJECT_CLASS;
};

skew.resolving.Resolver.isCallValue = function(node) {
  var parent = node.parent;
  return parent !== null && parent.kind === skew.NodeKind.CALL && node === parent.callValue();
};

skew.resolving.Resolver.needsTypeContext = function(node) {
  return node.kind === skew.NodeKind.DOT && node.dotTarget() === null || node.kind === skew.NodeKind.HOOK && skew.resolving.Resolver.needsTypeContext(node.hookTrue()) && skew.resolving.Resolver.needsTypeContext(node.hookFalse()) || skew.NodeKind.isInitializer(node.kind);
};

skew.resolving.Resolver.ensureFunctionIsOverloaded = function(symbol) {
  if (symbol.overloaded === null) {
    var overloaded = new skew.OverloadedFunctionSymbol(skew.merging.overloadedKind(symbol.kind), symbol.name, [symbol]);
    overloaded.parent = symbol.parent;
    overloaded.scope = overloaded.parent.scope;
    symbol.overloaded = overloaded;
    overloaded.scope.asObjectScope().symbol.members[symbol.name] = overloaded;
  }
};

skew.ScopeKind = {
  FUNCTION: 0, 0: "FUNCTION",
  LOCAL: 1, 1: "LOCAL",
  OBJECT: 2, 2: "OBJECT",
  VARIABLE: 3, 3: "VARIABLE"
};

skew.Scope = function(parent) {
  var self = this;
  self.parent = parent;
};

skew.Scope.prototype.asObjectScope = function() {
  var self = this;
  assert(self.kind$2438() === skew.ScopeKind.OBJECT);
  return self;
};

skew.Scope.prototype.asFunctionScope = function() {
  var self = this;
  assert(self.kind$2438() === skew.ScopeKind.FUNCTION);
  return self;
};

skew.Scope.prototype.asVariableScope = function() {
  var self = this;
  assert(self.kind$2438() === skew.ScopeKind.VARIABLE);
  return self;
};

skew.Scope.prototype.asLocalScope = function() {
  var self = this;
  assert(self.kind$2438() === skew.ScopeKind.LOCAL);
  return self;
};

skew.Scope.prototype.findEnclosingFunctionOrLambda = function() {
  var self = this;
  var scope = self;

  while (scope !== null) {
    if (scope.kind$2438() === skew.ScopeKind.FUNCTION) {
      return scope.asFunctionScope();
    }

    scope = scope.parent;
  }

  return null;
};

skew.Scope.prototype.findEnclosingFunction = function() {
  var self = this;
  var scope = self;

  while (scope !== null) {
    if (scope.kind$2438() === skew.ScopeKind.FUNCTION && scope.asFunctionScope().symbol.kind !== skew.SymbolKind.FUNCTION_LOCAL) {
      return scope.asFunctionScope();
    }

    scope = scope.parent;
  }

  return null;
};

skew.Scope.prototype.findEnclosingLoop = function() {
  var self = this;
  var scope = self;

  while (scope !== null && scope.kind$2438() === skew.ScopeKind.LOCAL) {
    if (scope.asLocalScope().type === skew.LocalType.LOOP) {
      return scope.asLocalScope();
    }

    scope = scope.parent;
  }

  return null;
};

skew.ObjectScope = function(parent, symbol) {
  var self = this;
  skew.Scope.call(self, parent);
  self.symbol = symbol;
};

$extends(skew.ObjectScope, skew.Scope);

skew.ObjectScope.prototype.kind$2438 = function() {
  var self = this;
  return skew.ScopeKind.OBJECT;
};

skew.ObjectScope.prototype.find$2439 = function(name) {
  var self = this;
  var check = self.symbol;

  while (check !== null) {
    var result = in_StringMap.get$811(check.members, name, null);

    if (result !== null) {
      return result;
    }

    check = check.baseClass;
  }

  return self.parent !== null ? self.parent.find$2439(name) : null;
};

skew.FunctionScope = function(parent, symbol) {
  var self = this;
  skew.Scope.call(self, parent);
  self.symbol = symbol;
  self.parameters = in_StringMap.$new();
};

$extends(skew.FunctionScope, skew.Scope);

skew.FunctionScope.prototype.kind$2438 = function() {
  var self = this;
  return skew.ScopeKind.FUNCTION;
};

skew.FunctionScope.prototype.find$2439 = function(name) {
  var self = this;
  var result = in_StringMap.get$811(self.parameters, name, null);
  return result !== null ? result : self.parent !== null ? self.parent.find$2439(name) : null;
};

skew.VariableScope = function(parent, symbol) {
  var self = this;
  skew.Scope.call(self, parent);
  self.symbol = symbol;
};

$extends(skew.VariableScope, skew.Scope);

skew.VariableScope.prototype.kind$2438 = function() {
  var self = this;
  return skew.ScopeKind.VARIABLE;
};

skew.VariableScope.prototype.find$2439 = function(name) {
  var self = this;
  return self.parent !== null ? self.parent.find$2439(name) : null;
};

skew.LocalType = {
  LOOP: 0, 0: "LOOP",
  NORMAL: 1, 1: "NORMAL"
};

skew.LocalScope = function(parent, type) {
  var self = this;
  skew.Scope.call(self, parent);
  self.locals = in_StringMap.$new();
  self.type = type;
};

$extends(skew.LocalScope, skew.Scope);

skew.LocalScope.prototype.kind$2438 = function() {
  var self = this;
  return skew.ScopeKind.LOCAL;
};

skew.LocalScope.prototype.find$2439 = function(name) {
  var self = this;
  var result = in_StringMap.get$811(self.locals, name, null);
  return result !== null ? result : self.parent !== null ? self.parent.find$2439(name) : null;
};

skew.LocalScope.prototype.define = function(symbol, log) {
  var self = this;
  symbol.scope = self;

  // Check for duplicates
  var other = in_StringMap.get$811(self.locals, symbol.name, null);

  if (other !== null) {
    log.semanticErrorDuplicateSymbol(symbol.range, symbol.name, other.range);
    return;
  }

  // Check for shadowing
  var scope = self.parent;

  while (scope.kind$2438() === skew.ScopeKind.LOCAL) {
    var local = in_StringMap.get$811(scope.asLocalScope().locals, symbol.name, null);

    if (local !== null) {
      log.semanticErrorShadowedSymbol(symbol.range, symbol.name, local.range);
      return;
    }

    scope = scope.parent;
  }

  self.locals[symbol.name] = symbol;
};

skew.TypeKind = {
  LAMBDA: 0, 0: "LAMBDA",
  SPECIAL: 1, 1: "SPECIAL",
  SYMBOL: 2, 2: "SYMBOL"
};

skew.Type = function(kind, symbol) {
  var self = this;
  self.id = skew.Type.createID();
  self.kind = kind;
  self.symbol = symbol;
  self.environment = null;
  self.substitutions = null;
  self.argumentTypes = null;
  self.returnType = null;
  self.substitutionCache = null;
};

skew.Type.prototype.parameters = function() {
  var self = this;
  return self.symbol === null ? null : skew.SymbolKind.isObject(self.symbol.kind) ? self.symbol.asObjectSymbol().parameters : skew.SymbolKind.isFunction(self.symbol.kind) ? self.symbol.asFunctionSymbol().parameters : null;
};

skew.Type.prototype.isParameterized = function() {
  var self = this;
  return self.substitutions !== null;
};

skew.Type.prototype.isClass = function() {
  var self = this;
  return self.symbol !== null && self.symbol.kind === skew.SymbolKind.OBJECT_CLASS;
};

skew.Type.prototype.isEnum = function() {
  var self = this;
  return self.symbol !== null && self.symbol.kind === skew.SymbolKind.OBJECT_ENUM;
};

// Type parameters are not guaranteed to be nullable since generics are
// implemented through type erasure and the substituted type may be "int"
skew.Type.prototype.isReference = function() {
  var self = this;
  return self.symbol === null || !self.symbol.isValueType() && !skew.SymbolKind.isParameter(self.symbol.kind);
};

skew.Type.prototype.toString = function() {
  var self = this;
  if (self.kind === skew.TypeKind.SYMBOL) {
    if (self.substitutions !== null) {
      var name = self.symbol.name + "<";

      for (var i = 0, n2507 = in_List.count$846(self.substitutions); i < n2507; i++) {
        if (i !== 0) {
          name += ", ";
        }

        name += self.substitutions[i].toString();
      }

      return name + ">";
    }

    return self.symbol.name;
  }

  if (self.kind === skew.TypeKind.LAMBDA) {
    var result = "fn(";

    for (var i = 0, n2509 = in_List.count$846(self.argumentTypes); i < n2509; i++) {
      if (i !== 0) {
        result += ", ";
      }

      result += self.argumentTypes[i].toString();
    }

    return result + (self.returnType !== null ? ") " + self.returnType.toString() : ")");
  }

  return self === skew.Type.DYNAMIC ? "dynamic" : "null";
};

skew.Type.prototype.baseClass = function() {
  var self = this;
  if (self.isClass()) {
    var base = self.symbol.asObjectSymbol().base;

    if (base !== null) {
      return base.resolvedType;
    }
  }

  return null;
};

skew.Type.prototype.hasBaseType = function(type) {
  var self = this;
  var base = self.baseClass();
  return base !== null && (base === type || base.hasBaseType(type));
};

skew.Type.initialize = function() {
  if (skew.Type.DYNAMIC === null) {
    skew.Type.DYNAMIC = new skew.Type(skew.TypeKind.SPECIAL, null);
  }

  if (skew.Type.NULL === null) {
    skew.Type.NULL = new skew.Type(skew.TypeKind.SPECIAL, null);
  }
};

skew.Type.createID = function() {
  skew.Type.nextID += 1;
  return skew.Type.nextID;
};

skew.Environment = function(parameters, substitutions) {
  var self = this;
  self.id = skew.Environment.createID();
  self.parameters = parameters;
  self.substitutions = substitutions;
  self.mergeCache = null;
};

// This is just for debugging
skew.Environment.prototype.toString = function() {
  var self = this;
  var text = "(";

  for (var i = 0, n2528 = in_List.count$846(self.parameters); i < n2528; i++) {
    if (i !== 0) {
      text += ", ";
    }

    text += self.parameters[i].name + " => " + self.substitutions[i].toString();
  }

  return text + ")";
};

skew.Environment.createID = function() {
  skew.Environment.nextID += 1;
  return skew.Environment.nextID;
};

skew.TypeCache = function() {
  var self = this;
  self.boolType = null;
  self.doubleType = null;
  self.intMapType = null;
  self.intType = null;
  self.listType = null;
  self.stringMapType = null;
  self.stringType = null;
  self.environments = in_IntMap.$new();
  self.lambdaTypes = in_IntMap.$new();
};

skew.TypeCache.prototype.loadGlobals = function(log, global) {
  var self = this;
  skew.Type.initialize();
  self.boolType = skew.TypeCache.loadGlobalClass(log, global, "bool", skew.Symbol.IS_VALUE_TYPE);
  self.doubleType = skew.TypeCache.loadGlobalClass(log, global, "double", skew.Symbol.IS_VALUE_TYPE);
  self.intMapType = skew.TypeCache.loadGlobalClass(log, global, "IntMap", 0);
  self.intType = skew.TypeCache.loadGlobalClass(log, global, "int", skew.Symbol.IS_VALUE_TYPE);
  self.listType = skew.TypeCache.loadGlobalClass(log, global, "List", 0);
  self.stringMapType = skew.TypeCache.loadGlobalClass(log, global, "StringMap", 0);
  self.stringType = skew.TypeCache.loadGlobalClass(log, global, "string", skew.Symbol.IS_VALUE_TYPE);
};

skew.TypeCache.prototype.isNumeric = function(type) {
  var self = this;
  return type === self.intType || type === self.doubleType;
};

skew.TypeCache.prototype.isList = function(type) {
  var self = this;
  return type.symbol === self.listType.symbol;
};

skew.TypeCache.prototype.canImplicitlyConvert = function(from, to) {
  var self = this;
  if (from === to) {
    return true;
  }

  if (from === skew.Type.DYNAMIC || to === skew.Type.DYNAMIC) {
    return true;
  }

  if (from === skew.Type.NULL && to.isReference()) {
    return true;
  }

  if (from === self.intType && to === self.doubleType) {
    return true;
  }

  if (from.hasBaseType(to)) {
    return true;
  }

  if (from.isEnum() && (to === self.intType || to === self.stringType)) {
    return true;
  }

  return false;
};

skew.TypeCache.prototype.canExplicitlyConvert = function(from, to) {
  var self = this;
  if (self.canImplicitlyConvert(from, to)) {
    return true;
  }

  if (self.canCastToNumeric(from) && self.canCastToNumeric(to)) {
    return true;
  }

  if (to.hasBaseType(from)) {
    return true;
  }

  if (to.isEnum() && (from === self.intType || from === self.stringType)) {
    return true;
  }

  return false;
};

skew.TypeCache.prototype.commonImplicitType = function(left, right) {
  var self = this;
  // Short-circuit early for identical types
  if (left === right) {
    return left;
  }

  // Dynamic is a hole in the type system
  if (left === skew.Type.DYNAMIC || right === skew.Type.DYNAMIC) {
    return skew.Type.DYNAMIC;
  }

  // Check implicit conversions
  if (self.canImplicitlyConvert(left, right)) {
    return right;
  }

  if (self.canImplicitlyConvert(right, left)) {
    return left;
  }

  // Implement common implicit types for numeric types
  if (self.isNumeric(left) && self.isNumeric(right)) {
    return left === self.intType && right === self.intType ? self.intType : self.doubleType;
  }

  // Check for a common base class
  if (left.isClass() && right.isClass()) {
    return skew.TypeCache.commonBaseClass(left, right);
  }

  return null;
};

skew.TypeCache.prototype.createListType = function(itemType) {
  var self = this;
  return self.substitute(self.listType, self.createEnvironment(self.listType.parameters(), [itemType]));
};

skew.TypeCache.prototype.createIntMapType = function(valueType) {
  var self = this;
  return self.substitute(self.intMapType, self.createEnvironment(self.intMapType.parameters(), [valueType]));
};

skew.TypeCache.prototype.createStringMapType = function(valueType) {
  var self = this;
  return self.substitute(self.stringMapType, self.createEnvironment(self.stringMapType.parameters(), [valueType]));
};

skew.TypeCache.prototype.createEnvironment = function(parameters, substitutions) {
  var self = this;
  assert(in_List.count$846(parameters) === in_List.count$846(substitutions));

  // Hash the inputs
  var hash = skew.TypeCache.hashTypes(skew.TypeCache.hashParameters(parameters), substitutions);
  var bucket = in_IntMap.get$823(self.environments, hash, null);

  // Check existing environments in the bucket for a match
  if (bucket !== null) {
    for (var i2567 = 0, x2567 = bucket; i2567 < x2567.length; i2567++) {
      var existing = x2567[i2567];
      if (in_List.isEqualTo(parameters, existing.parameters) && in_List.isEqualTo(substitutions, existing.substitutions)) {
        return existing;
      }
    }
  }

  // Make a new bucket
  else {
    bucket = [];
    self.environments[hash] = bucket;
  }

  // Make a new environment
  var environment = new skew.Environment(parameters, substitutions);
  in_List.append$851(bucket, environment);
  return environment;
};

skew.TypeCache.prototype.createLambdaType = function(argumentTypes, returnType) {
  var self = this;
  var hash = skew.TypeCache.hashTypes(returnType !== null ? returnType.id : -1, argumentTypes);
  var bucket = in_IntMap.get$823(self.lambdaTypes, hash, null);

  // Check existing types in the bucket for a match
  if (bucket !== null) {
    for (var i2574 = 0, x2574 = bucket; i2574 < x2574.length; i2574++) {
      var existing = x2574[i2574];
      if (in_List.isEqualTo(argumentTypes, existing.argumentTypes) && returnType === existing.returnType) {
        return existing;
      }
    }
  }

  // Make a new bucket
  else {
    bucket = [];
    self.lambdaTypes[hash] = bucket;
  }

  // Make a new lambda type
  var type = new skew.Type(skew.TypeKind.LAMBDA, null);
  type.argumentTypes = argumentTypes;
  type.returnType = returnType;
  in_List.append$851(bucket, type);
  return type;
};

skew.TypeCache.prototype.mergeEnvironments = function(a, b, restrictions) {
  var self = this;
  if (a === null) {
    return b;
  }

  if (b === null) {
    return a;
  }

  var parameters = in_List.clone$870(a.parameters);
  var substitutions = self.substituteAll(a.substitutions, b);

  for (var i = 0, n2582 = in_List.count$846(b.parameters); i < n2582; i++) {
    var parameter = b.parameters[i];
    var substitution = b.substitutions[i];

    if (!in_List.$in(parameters, parameter) && (restrictions === null || in_List.$in(restrictions, parameter))) {
      in_List.append$851(parameters, parameter);
      in_List.append$851(substitutions, substitution);
    }
  }

  return self.createEnvironment(parameters, substitutions);
};

skew.TypeCache.prototype.parameterize = function(type) {
  var self = this;
  var parameters = type.parameters();

  if (parameters === null) {
    return type;
  }

  assert(!type.isParameterized());
  var substitutions = [];

  for (var i2589 = 0, x2589 = parameters; i2589 < x2589.length; i2589++) {
    var parameter = x2589[i2589];
    in_List.append$851(substitutions, parameter.resolvedType);
  }

  return self.substitute(type, self.createEnvironment(parameters, substitutions));
};

skew.TypeCache.prototype.substituteAll = function(types, environment) {
  var self = this;
  var substitutions = [];

  for (var i2594 = 0, x2594 = types; i2594 < x2594.length; i2594++) {
    var type = x2594[i2594];
    in_List.append$851(substitutions, self.substitute(type, environment));
  }

  return substitutions;
};

skew.TypeCache.prototype.substitute = function(type, environment) {
  var self = this;
  var existing = type.environment;

  if (environment === null || environment === existing) {
    return type;
  }

  // Merge the type environments (this matters for nested generics). For
  // object types, limit the parameters in the environment to just those
  // on this type and the base type.
  var parameters = type.parameters();

  if (existing !== null) {
    environment = self.mergeEnvironments(existing, environment, type.kind === skew.TypeKind.SYMBOL && skew.SymbolKind.isFunctionOrOverloadedFunction(type.symbol.kind) ? null : parameters);
  }

  // Check to see if this has been computed before
  var rootType = type.kind === skew.TypeKind.SYMBOL ? type.symbol.resolvedType : type;

  if (rootType.substitutionCache === null) {
    rootType.substitutionCache = in_IntMap.$new();
  }

  var substituted = in_IntMap.get$823(rootType.substitutionCache, environment.id, null);

  if (substituted !== null) {
    return substituted;
  }

  substituted = type;

  if (type.kind === skew.TypeKind.LAMBDA) {
    var argumentTypes = [];
    var returnType = null;

    // Substitute function arguments
    for (var i2604 = 0, x2604 = type.argumentTypes; i2604 < x2604.length; i2604++) {
      var argumentType = x2604[i2604];
      in_List.append$851(argumentTypes, self.substitute(argumentType, environment));
    }

    // Substitute return type
    if (type.returnType !== null) {
      returnType = self.substitute(type.returnType, environment);
    }

    substituted = self.createLambdaType(argumentTypes, returnType);
  } else if (type.kind === skew.TypeKind.SYMBOL) {
    var symbol = type.symbol;

    // Parameters just need simple substitution
    if (skew.SymbolKind.isParameter(symbol.kind)) {
      var index = environment.parameters.indexOf(symbol.asParameterSymbol());

      if (index !== -1) {
        substituted = environment.substitutions[index];
      }
    }

    // Symbols with type parameters are more complicated
    // Overloaded functions are also included even though they don't have
    // type parameters because the type environment needs to be bundled
    // for later substitution into individual matched overloads
    else if (parameters !== null || skew.SymbolKind.isFunctionOrOverloadedFunction(symbol.kind)) {
      substituted = new skew.Type(skew.TypeKind.SYMBOL, symbol);
      substituted.environment = environment;

      // Generate type substitutions
      if (parameters !== null) {
        var found = true;

        for (var i2608 = 0, x2608 = parameters; i2608 < x2608.length; i2608++) {
          var parameter = x2608[i2608];
          found = in_List.$in(environment.parameters, parameter);

          if (!found) {
            break;
          }
        }

        if (found) {
          substituted.substitutions = [];

          for (var i2609 = 0, x2609 = parameters; i2609 < x2609.length; i2609++) {
            var parameter = x2609[i2609];
            in_List.append$851(substituted.substitutions, self.substitute(parameter.resolvedType, environment));
          }
        }
      }

      // Substitute function arguments
      if (type.argumentTypes !== null) {
        substituted.argumentTypes = [];

        for (var i2610 = 0, x2610 = type.argumentTypes; i2610 < x2610.length; i2610++) {
          var argumentType = x2610[i2610];
          in_List.append$851(substituted.argumentTypes, self.substitute(argumentType, environment));
        }
      }

      // Substitute return type
      if (type.returnType !== null) {
        substituted.returnType = self.substitute(type.returnType, environment);
      }
    }
  }

  rootType.substitutionCache[environment.id] = substituted;
  return substituted;
};

skew.TypeCache.prototype.canCastToNumeric = function(type) {
  var self = this;
  return type === self.intType || type === self.doubleType || type === self.boolType;
};

skew.TypeCache.loadGlobalClass = function(log, global, name, flags) {
  var symbol = in_StringMap.get$811(global.members, name, null);
  assert(symbol !== null);
  assert(symbol.kind === skew.SymbolKind.OBJECT_CLASS);
  var type = new skew.Type(skew.TypeKind.SYMBOL, symbol.asObjectSymbol());
  symbol.resolvedType = type;
  symbol.flags |= flags;
  return type;
};

skew.TypeCache.hashParameters = function(parameters) {
  var hash = 0;

  for (var i2626 = 0, x2626 = parameters; i2626 < x2626.length; i2626++) {
    var parameter = x2626[i2626];
    hash = hashCombine(hash, parameter.id);
  }

  return hash;
};

skew.TypeCache.hashTypes = function(hash, types) {
  for (var i2630 = 0, x2630 = types; i2630 < x2630.length; i2630++) {
    var type = x2630[i2630];
    hash = hashCombine(hash, type.id);
  }

  return hash;
};

skew.TypeCache.commonBaseClass = function(left, right) {
  var a = left;

  while (a !== null) {
    var b = right;

    while (b !== null) {
      if (a === b) {
        return a;
      }

      b = b.baseClass();
    }

    a = a.baseClass();
  }

  return null;
};

var prettyPrint = {};

prettyPrint.plural = function(value) {
  return value === 1 ? "" : "s";
};

prettyPrint.join = function(parts, trailing) {
  if (in_List.count$846(parts) < 3) {
    return (" " + trailing + " ").join(parts);
  }

  var text = "";

  for (var i = 0, n801 = in_List.count$846(parts); i < n801; i++) {
    if (i !== 0) {
      text += ", ";

      if (i + 1 === in_List.count$846(parts)) {
        text += trailing + " ";
      }
    }

    text += parts[i];
  }

  return text;
};

var in_string = {};

in_string.count$830 = function(self) {
  return self.length;
};

in_string.s831$831 = function(self, index) {
  return self.charCodeAt(index);
};

in_string.at$833 = function(self, index) {
  return self[index];
};

in_string.repeat$835 = function(self, times) {
  var result = "";

  for (var i = 0, n838 = times; i < n838; i++) {
    result += self;
  }

  return result;
};

in_string.fromCodeUnit$840 = function(x) {
  return String.fromCharCode(x);
};

var in_StringBuilder = {};

in_StringBuilder.s873$873 = function(self, x) {
  in_StringBuilder.append$875(self, x);
};

in_StringBuilder.append$875 = function(self, x) {
  self.buffer += x;
};

in_StringBuilder.toString$877 = function(self) {
  return self.buffer;
};

in_StringBuilder.$new = function() {
  return {"buffer": ""};
};

var in_List = {};

// TODO: Remove this
in_List.isEqualTo = function(self, other) {
  if (in_List.count$846(self) !== in_List.count$846(other)) {
    return false;
  }

  for (var i = 0, n790 = in_List.count$846(self); i < n790; i++) {
    if (self[i] !== other[i]) {
      return false;
    }
  }

  return true;
};

in_List.count$846 = function(self) {
  return self.length;
};

// TODO: Remove this
in_List.pushAll = function(self, all) {
  for (var i793 = 0, x793 = all; i793 < x793.length; i793++) {
    var value = x793[i793];
    in_List.append$851(self, value);
  }
};

in_List.append$851 = function(self, value) {
  self.push(value);
};

in_List.$in = function(self, value) {
  return self.indexOf(value) >= 0;
};

in_List.isEmpty$845 = function(self) {
  return in_List.count$846(self) === 0;
};

in_List.first$847 = function(self) {
  return self[0];
};

in_List.last$848 = function(self) {
  return self[in_List.count$846(self) - 1];
};

in_List.prepend$849 = function(self, value) {
  self.unshift(value);
};

in_List.append$853 = function(self, values) {
  for (var i855 = 0, x855 = values; i855 < x855.length; i855++) {
    var value = x855[i855];
    in_List.append$851(self, value);
  }
};

in_List.removeLast$856 = function(self) {
  self.pop();
};

in_List.takeLast$857 = function(self) {
  return self.pop();
};

in_List.swap$858 = function(self, i, j) {
  var temp = self[i];
  self[i] = self[j];
  self[j] = temp;
};

in_List.insert$862 = function(self, index, value) {
  self.splice(index, 0, value);
};

in_List.removeAt$865 = function(self, index) {
  self.splice(index, 1);
};

in_List.removeOne$867 = function(self, value) {
  var index = self.indexOf(value);

  if (index >= 0) {
    in_List.removeAt$865(self, index);
  }
};

in_List.clone$870 = function(self) {
  return self.slice();
};

var in_StringMap = {};

in_StringMap.$new = function() {
  return Object.create(null);
};

in_StringMap.s808$808 = function(self, key, value) {
  self[key] = value;
  return self;
};

in_StringMap.get$811 = function(self, key, value) {
  return key in self ? self[key] : value;
};

in_StringMap.values$814 = function(self) {
  var values = [];

  for (var key in self) {
    in_List.append$851(values, self[key]);
  }

  return values;
};

var in_IntMap = {};

in_IntMap.$new = function() {
  return Object.create(null);
};

in_IntMap.s820$820 = function(self, key, value) {
  self[key] = value;
  return self;
};

in_IntMap.get$823 = function(self, key, value) {
  return key in self ? self[key] : value;
};

in_IntMap.values$826 = function(self) {
  var values = [];

  for (var key in self) {
    in_List.append$851(values, self[key]);
  }

  return values;
};

var NATIVE_LIBRARY = "\ndef @export\ndef @import\ndef @prefer\ndef @private\ndef @protected\ndef @rename(name string)\ndef @skip\n\n@import\nnamespace Math {\n  def abs(x double) double\n  def abs(x int) int\n  def acos(x double) double\n  def asin(x double) double\n  def atan(x double) double\n  def atan2(x double, y double) double\n  def ceil(x double) double\n  def cos(x double) double\n  def exp(x double) double\n  def floor(x double) double\n  def log(x double) double\n  def pow(x double, y double) double\n  def random double\n  def round(x double) double\n  def sin(x double) double\n  def sqrt(x double) double\n  def tan(x double) double\n\n  @prefer\n  def max(x double, y double) double\n  def max(x int, y int) int\n\n  @prefer\n  def min(x double, y double) double\n  def min(x int, y int) int\n\n  const E = 2.718281828459045\n  const PI = 3.141592653589793\n}\n\n@import\nclass bool {\n  def ! bool\n  def toString string\n}\n\n@import\nclass int {\n  def + int\n  def - int\n  def toString string\n  def ~ int\n\n  def %(x int) int\n  def &(x int) int\n  def *(x int) int\n  def +(x int) int\n  def -(x int) int\n  def /(x int) int\n  def <<(x int) int\n  def <=>(x int) int\n  def >>(x int) int\n  def ^(x int) int\n  def |(x int) int\n\n  def %=(x int) int\n  def &=(x int) int\n  def *=(x int) int\n  def +=(x int) int\n  def -=(x int) int\n  def /=(x int) int\n  def <<=(x int) int\n  def >>=(x int) int\n  def ^=(x int) int\n  def |=(x int) int\n}\n\n@import\nclass double {\n  def + double\n  def - double\n  def toString string\n\n  def *(x double) double\n  def **(x double) double\n  def +(x double) double\n  def -(x double) double\n  def /(x double) double\n  def <=>(x double) double\n\n  def **=(x double) double\n  def *=(x double) double\n  def +=(x double) double\n  def -=(x double) double\n  def /=(x double) double\n}\n\n@import\nclass string {\n  def +(x string) string\n  def +=(x string)\n  def <=>(x string) int\n  def [](x int) int\n  def at(x int) string\n  def codePoints List<int>\n  def codeUnits List<int>\n  def count int\n  def endsWith(x string) bool\n  def in(x string) bool\n  def indexOf(x string) int\n  def join(x List<string>) string\n  def lastIndexOf(x string) int\n  def repeat(x int) string\n  def replaceAll(before string, after string) string\n  def slice(start int, end int) string\n  def split(x string) List<string>\n  def startsWith(x string) bool\n}\n\nnamespace string {\n  def fromCodePoint(x int) string\n  def fromCodePoints(x List<int>) string\n  def fromCodeUnit(x int) string\n  def fromCodeUnits(x List<int>) string\n}\n\n@import\nclass StringBuilder {\n  def +=(x string)\n  def append(x string)\n  def new\n  def toString string\n}\n\n@import\nclass List<T> {\n  def [...](x T) List<T>\n  def [](x int) T\n  def []=(x int, y T)\n  def all(x fn(T) bool) bool\n  def any(x fn(T) bool) bool\n  def appendOne(x T)\n  def clone List<T>\n  def count int\n  def each(x fn(T))\n  def filter(x fn(T) bool) List<T>\n  def first T\n  def in(x T) bool\n  def indexOf(x T) int\n  def insert(x int, value T)\n  def isEmpty bool\n  def last T\n  def lastIndexOf(x T) int\n  def map<R>(x fn(T) R) List<R>\n  def new\n  def removeAll(x T)\n  def removeAt(x int)\n  def removeDuplicates\n  def removeFirst\n  def removeLast\n  def removeOne(x T)\n  def removeRange(start int, end int)\n  def resize(size int, defaultValue T)\n  def reverse\n  def shuffle\n  def slice(start int, end int) List<T>\n  def sort(x fn(T, T) int)\n  def swap(x int, y int)\n  def takeFirst T\n  def takeLast T\n  def takeRange(start int, end int) List<T>\n\n  @prefer\n  def append(x T)\n  def append(x List<T>)\n\n  @prefer\n  def prepend(x T)\n  def prepend(x List<T>)\n\n  @prefer\n  def +(x T) List<T>\n  def +(x List<T>) List<T>\n\n  @prefer\n  def +=(x T)\n  def +=(x List<T>)\n}\n\n@import\nclass StringMap<T> {\n  def [](key string) T\n  def []=(key string, value T)\n  def count int\n  def each(x fn(string, T))\n  def get(key string, defaultValue T) T\n  def in(key string) bool\n  def isEmpty bool\n  def keys List<string>\n  def new\n  def remove(key string)\n  def values List<T>\n  def {...}(key string, value T) StringMap<T>\n}\n\n@import\nclass IntMap<T> {\n  def [](key int) T\n  def []=(key int, value T)\n  def count int\n  def each(x fn(int, T))\n  def get(key int, defaultValue T) T\n  def in(key int) bool\n  def isEmpty bool\n  def keys List<int>\n  def new\n  def remove(key int)\n  def values List<T>\n  def {...}(key int, value T) IntMap<T>\n}\n";
skew.HEX = "0123456789ABCDEF";
skew.operatorInfo = in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.$new(), ((skew.NodeKind.COMPLEMENT) | 0), new skew.OperatorInfo("~", skew.Precedence.UNARY_PREFIX, skew.Associativity.NONE, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ZERO)), ((skew.NodeKind.NEGATIVE) | 0), new skew.OperatorInfo("-", skew.Precedence.UNARY_PREFIX, skew.Associativity.NONE, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ZERO_OR_ONE)), ((skew.NodeKind.NOT) | 0), new skew.OperatorInfo("!", skew.Precedence.UNARY_PREFIX, skew.Associativity.NONE, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ZERO)), ((skew.NodeKind.POSITIVE) | 0), new skew.OperatorInfo("+", skew.Precedence.UNARY_PREFIX, skew.Associativity.NONE, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ZERO_OR_ONE)), ((skew.NodeKind.ADD) | 0), new skew.OperatorInfo("+", skew.Precedence.ADD, skew.Associativity.LEFT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ZERO_OR_ONE)), ((skew.NodeKind.BITWISE_AND) | 0), new skew.OperatorInfo("&", skew.Precedence.BITWISE_AND, skew.Associativity.LEFT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.BITWISE_OR) | 0), new skew.OperatorInfo("|", skew.Precedence.BITWISE_OR, skew.Associativity.LEFT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.BITWISE_XOR) | 0), new skew.OperatorInfo("^", skew.Precedence.BITWISE_XOR, skew.Associativity.LEFT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.COMPARE) | 0), new skew.OperatorInfo("<=>", skew.Precedence.COMPARE, skew.Associativity.LEFT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.DIVIDE) | 0), new skew.OperatorInfo("/", skew.Precedence.MULTIPLY, skew.Associativity.LEFT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.EQUAL) | 0), new skew.OperatorInfo("==", skew.Precedence.EQUAL, skew.Associativity.LEFT, skew.OperatorKind.FIXED, skew.ArgumentCount.ONE)), ((skew.NodeKind.GREATER_THAN) | 0), new skew.OperatorInfo(">", skew.Precedence.COMPARE, skew.Associativity.LEFT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.GREATER_THAN_OR_EQUAL) | 0), new skew.OperatorInfo(">=", skew.Precedence.COMPARE, skew.Associativity.LEFT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.IN) | 0), new skew.OperatorInfo("in", skew.Precedence.COMPARE, skew.Associativity.LEFT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.LESS_THAN) | 0), new skew.OperatorInfo("<", skew.Precedence.COMPARE, skew.Associativity.LEFT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.LESS_THAN_OR_EQUAL) | 0), new skew.OperatorInfo("<=", skew.Precedence.COMPARE, skew.Associativity.LEFT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.LOGICAL_AND) | 0), new skew.OperatorInfo("&&", skew.Precedence.LOGICAL_AND, skew.Associativity.LEFT, skew.OperatorKind.FIXED, skew.ArgumentCount.ONE)), ((skew.NodeKind.LOGICAL_OR) | 0), new skew.OperatorInfo("||", skew.Precedence.LOGICAL_OR, skew.Associativity.LEFT, skew.OperatorKind.FIXED, skew.ArgumentCount.ONE)), ((skew.NodeKind.MULTIPLY) | 0), new skew.OperatorInfo("*", skew.Precedence.MULTIPLY, skew.Associativity.LEFT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.NOT_EQUAL) | 0), new skew.OperatorInfo("!=", skew.Precedence.EQUAL, skew.Associativity.LEFT, skew.OperatorKind.FIXED, skew.ArgumentCount.ONE)), ((skew.NodeKind.POWER) | 0), new skew.OperatorInfo("**", skew.Precedence.UNARY_PREFIX, skew.Associativity.RIGHT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.REMAINDER) | 0), new skew.OperatorInfo("%", skew.Precedence.MULTIPLY, skew.Associativity.LEFT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.SHIFT_LEFT) | 0), new skew.OperatorInfo("<<", skew.Precedence.SHIFT, skew.Associativity.LEFT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.SHIFT_RIGHT) | 0), new skew.OperatorInfo(">>", skew.Precedence.SHIFT, skew.Associativity.LEFT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.SUBTRACT) | 0), new skew.OperatorInfo("-", skew.Precedence.ADD, skew.Associativity.LEFT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ZERO_OR_ONE)), ((skew.NodeKind.ASSIGN) | 0), new skew.OperatorInfo("=", skew.Precedence.ASSIGN, skew.Associativity.RIGHT, skew.OperatorKind.FIXED, skew.ArgumentCount.ONE)), ((skew.NodeKind.ASSIGN_ADD) | 0), new skew.OperatorInfo("+=", skew.Precedence.ASSIGN, skew.Associativity.RIGHT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.ASSIGN_BITWISE_AND) | 0), new skew.OperatorInfo("&=", skew.Precedence.ASSIGN, skew.Associativity.RIGHT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.ASSIGN_BITWISE_OR) | 0), new skew.OperatorInfo("|=", skew.Precedence.ASSIGN, skew.Associativity.RIGHT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.ASSIGN_BITWISE_XOR) | 0), new skew.OperatorInfo("^=", skew.Precedence.ASSIGN, skew.Associativity.RIGHT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.ASSIGN_DIVIDE) | 0), new skew.OperatorInfo("/=", skew.Precedence.ASSIGN, skew.Associativity.RIGHT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.ASSIGN_MULTIPLY) | 0), new skew.OperatorInfo("*=", skew.Precedence.ASSIGN, skew.Associativity.RIGHT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.ASSIGN_POWER) | 0), new skew.OperatorInfo("**=", skew.Precedence.ASSIGN, skew.Associativity.RIGHT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.ASSIGN_REMAINDER) | 0), new skew.OperatorInfo("%=", skew.Precedence.ASSIGN, skew.Associativity.RIGHT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.ASSIGN_SHIFT_LEFT) | 0), new skew.OperatorInfo("<<=", skew.Precedence.ASSIGN, skew.Associativity.RIGHT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.ASSIGN_SHIFT_RIGHT) | 0), new skew.OperatorInfo(">>=", skew.Precedence.ASSIGN, skew.Associativity.RIGHT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.ASSIGN_SUBTRACT) | 0), new skew.OperatorInfo("-=", skew.Precedence.ASSIGN, skew.Associativity.RIGHT, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE)), ((skew.NodeKind.ASSIGN_INDEX) | 0), new skew.OperatorInfo("[]=", skew.Precedence.MEMBER, skew.Associativity.NONE, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.TWO_OR_MORE)), ((skew.NodeKind.INDEX) | 0), new skew.OperatorInfo("[]", skew.Precedence.MEMBER, skew.Associativity.NONE, skew.OperatorKind.OVERRIDABLE, skew.ArgumentCount.ONE_OR_MORE));
skew.argumentCounts = null;
skew.yy_accept = [skew.TokenKind.YY_INVALID_ACTION, skew.TokenKind.YY_INVALID_ACTION, skew.TokenKind.YY_INVALID_ACTION, skew.TokenKind.END_OF_FILE, skew.TokenKind.ERROR, skew.TokenKind.WHITESPACE, skew.TokenKind.NEWLINE, skew.TokenKind.NOT, skew.TokenKind.ERROR, skew.TokenKind.COMMENT, skew.TokenKind.REMAINDER, skew.TokenKind.BITWISE_AND, skew.TokenKind.ERROR, skew.TokenKind.LEFT_PARENTHESIS, skew.TokenKind.RIGHT_PARENTHESIS, skew.TokenKind.MULTIPLY, skew.TokenKind.PLUS, skew.TokenKind.COMMA, skew.TokenKind.MINUS, skew.TokenKind.DOT, skew.TokenKind.DIVIDE, skew.TokenKind.INT, skew.TokenKind.INT, skew.TokenKind.COLON, skew.TokenKind.LESS_THAN, skew.TokenKind.ASSIGN, skew.TokenKind.GREATER_THAN, skew.TokenKind.QUESTION_MARK, skew.TokenKind.ERROR, skew.TokenKind.IDENTIFIER, skew.TokenKind.LEFT_BRACKET, skew.TokenKind.RIGHT_BRACKET, skew.TokenKind.BITWISE_XOR, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.LEFT_BRACE, skew.TokenKind.BITWISE_OR, skew.TokenKind.RIGHT_BRACE, skew.TokenKind.TILDE, skew.TokenKind.WHITESPACE, skew.TokenKind.NEWLINE, skew.TokenKind.NOT_EQUAL, skew.TokenKind.YY_INVALID_ACTION, skew.TokenKind.STRING, skew.TokenKind.YY_INVALID_ACTION, skew.TokenKind.COMMENT, skew.TokenKind.COMMENT, skew.TokenKind.ASSIGN_REMAINDER, skew.TokenKind.LOGICAL_AND, skew.TokenKind.ASSIGN_BITWISE_AND, skew.TokenKind.YY_INVALID_ACTION, skew.TokenKind.CHARACTER, skew.TokenKind.YY_INVALID_ACTION, skew.TokenKind.POWER, skew.TokenKind.ASSIGN_MULTIPLY, skew.TokenKind.ASSIGN_PLUS, skew.TokenKind.ASSIGN_MINUS, skew.TokenKind.DOT_DOT, skew.TokenKind.ASSIGN_DIVIDE, skew.TokenKind.YY_INVALID_ACTION, skew.TokenKind.INT, skew.TokenKind.YY_INVALID_ACTION, skew.TokenKind.YY_INVALID_ACTION, skew.TokenKind.YY_INVALID_ACTION, skew.TokenKind.YY_INVALID_ACTION, skew.TokenKind.SHIFT_LEFT, skew.TokenKind.LESS_THAN_OR_EQUAL, skew.TokenKind.EQUAL, skew.TokenKind.ARROW, skew.TokenKind.GREATER_THAN_OR_EQUAL, skew.TokenKind.SHIFT_RIGHT, skew.TokenKind.ANNOTATION, skew.TokenKind.IDENTIFIER, skew.TokenKind.YY_INVALID_ACTION, skew.TokenKind.INDEX, skew.TokenKind.YY_INVALID_ACTION, skew.TokenKind.ASSIGN_BITWISE_XOR, skew.TokenKind.AS, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IF, skew.TokenKind.IN, skew.TokenKind.IS, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.YY_INVALID_ACTION, skew.TokenKind.YY_INVALID_ACTION, skew.TokenKind.ASSIGN_BITWISE_OR, skew.TokenKind.LOGICAL_OR, skew.TokenKind.ASSIGN_POWER, skew.TokenKind.DOUBLE, skew.TokenKind.YY_INVALID_ACTION, skew.TokenKind.DOUBLE, skew.TokenKind.INT_BINARY, skew.TokenKind.INT_OCTAL, skew.TokenKind.INT_HEX, skew.TokenKind.ASSIGN_SHIFT_LEFT, skew.TokenKind.COMPARE, skew.TokenKind.ASSIGN_SHIFT_RIGHT, skew.TokenKind.ANNOTATION, skew.TokenKind.YY_INVALID_ACTION, skew.TokenKind.ASSIGN_INDEX, skew.TokenKind.YY_INVALID_ACTION, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.DEF, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.FOR, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.VAR, skew.TokenKind.IDENTIFIER, skew.TokenKind.YY_INVALID_ACTION, skew.TokenKind.YY_INVALID_ACTION, skew.TokenKind.YY_INVALID_ACTION, skew.TokenKind.YY_INVALID_ACTION, skew.TokenKind.IDENTIFIER, skew.TokenKind.CASE, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.ELSE, skew.TokenKind.ENUM, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.NULL, skew.TokenKind.OVER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.TRUE, skew.TokenKind.IDENTIFIER, skew.TokenKind.YY_INVALID_ACTION, skew.TokenKind.YY_INVALID_ACTION, skew.TokenKind.LIST, skew.TokenKind.LIST_NEW, skew.TokenKind.BREAK, skew.TokenKind.CLASS, skew.TokenKind.CONST, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.FALSE, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.SUPER, skew.TokenKind.IDENTIFIER, skew.TokenKind.WHILE, skew.TokenKind.SET, skew.TokenKind.SET_NEW, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.RETURN, skew.TokenKind.SWITCH, skew.TokenKind.IDENTIFIER, skew.TokenKind.DEFAULT, skew.TokenKind.DYNAMIC, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.CONTINUE, skew.TokenKind.IDENTIFIER, skew.TokenKind.IDENTIFIER, skew.TokenKind.INTERFACE, skew.TokenKind.NAMESPACE, skew.TokenKind.YY_INVALID_ACTION];
skew.yy_ec = [0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 4, 5, 6, 1, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 20, 20, 20, 20, 20, 21, 21, 22, 1, 23, 24, 25, 26, 27, 28, 28, 28, 28, 29, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 31, 32, 33, 34, 30, 1, 35, 36, 37, 38, 39, 40, 30, 41, 42, 30, 43, 44, 45, 46, 47, 48, 30, 49, 50, 51, 52, 53, 54, 55, 56, 30, 57, 58, 59, 60, 1];
skew.yy_meta = [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 3, 3, 4, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1];
skew.yy_base = [0, 0, 0, 290, 291, 287, 59, 264, 58, 284, 262, 56, 56, 291, 291, 54, 261, 291, 260, 267, 258, 75, 53, 291, 44, 51, 59, 291, 0, 0, 54, 291, 257, 230, 230, 42, 42, 53, 66, 62, 68, 225, 238, 53, 227, 240, 233, 63, 61, 291, 291, 271, 113, 291, 101, 291, 269, 268, 291, 291, 291, 291, 108, 291, 267, 245, 291, 291, 291, 291, 291, 105, 116, 128, 109, 132, 0, 244, 242, 291, 291, 291, 242, 0, 0, 249, 240, 224, 291, 0, 223, 211, 225, 213, 218, 211, 206, 203, 210, 204, 0, 201, 0, 206, 206, 210, 197, 199, 204, 193, 195, 201, 226, 202, 291, 291, 291, 138, 142, 146, 120, 150, 0, 291, 291, 291, 0, 224, 291, 185, 203, 198, 186, 103, 200, 199, 194, 187, 181, 0, 191, 190, 184, 178, 174, 186, 173, 184, 0, 178, 205, 166, 186, 185, 174, 0, 166, 164, 172, 161, 167, 0, 0, 172, 161, 159, 0, 0, 159, 158, 169, 0, 166, 145, 144, 291, 291, 0, 0, 0, 156, 157, 158, 0, 159, 150, 151, 0, 155, 0, 291, 291, 143, 143, 156, 109, 107, 0, 0, 92, 0, 0, 92, 84, 0, 79, 71, 0, 0, 291, 170, 174, 178, 180, 183, 186, 188];
skew.yy_def = [0, 209, 1, 209, 209, 209, 209, 209, 210, 211, 209, 209, 212, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 213, 214, 209, 209, 209, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 209, 209, 209, 209, 209, 209, 209, 210, 209, 210, 211, 209, 209, 209, 209, 212, 209, 212, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 215, 209, 209, 209, 209, 209, 209, 216, 214, 209, 209, 209, 209, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 215, 209, 209, 209, 216, 209, 209, 209, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 209, 209, 209, 209, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 209, 209, 209, 209, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 209, 209, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 0, 209, 209, 209, 209, 209, 209, 209];
skew.yy_nxt = [0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 22, 22, 23, 24, 25, 26, 27, 28, 29, 29, 29, 30, 4, 31, 32, 33, 34, 35, 36, 37, 38, 29, 39, 29, 29, 29, 40, 41, 29, 42, 43, 44, 29, 45, 46, 29, 29, 47, 48, 49, 50, 52, 52, 55, 60, 63, 65, 77, 78, 71, 85, 72, 72, 72, 72, 79, 80, 91, 66, 112, 61, 94, 73, 81, 82, 114, 92, 86, 64, 93, 56, 71, 73, 72, 72, 72, 72, 96, 95, 97, 87, 98, 100, 103, 73, 107, 55, 108, 101, 113, 208, 74, 102, 99, 73, 52, 52, 63, 207, 115, 104, 206, 75, 117, 117, 117, 117, 120, 120, 205, 76, 204, 71, 56, 72, 72, 72, 72, 120, 120, 64, 118, 203, 118, 202, 73, 119, 119, 119, 119, 121, 121, 121, 157, 158, 73, 117, 117, 117, 117, 119, 119, 119, 119, 119, 119, 119, 119, 121, 121, 121, 54, 54, 54, 54, 57, 57, 57, 57, 62, 62, 62, 62, 83, 83, 84, 84, 84, 122, 122, 126, 126, 126, 201, 200, 199, 198, 197, 196, 195, 194, 193, 192, 191, 190, 189, 188, 187, 186, 185, 184, 183, 182, 181, 180, 179, 178, 177, 176, 175, 174, 173, 172, 171, 170, 169, 168, 167, 166, 165, 164, 163, 162, 161, 160, 159, 156, 155, 154, 153, 152, 151, 150, 149, 148, 147, 146, 145, 144, 143, 142, 141, 140, 139, 138, 137, 136, 135, 134, 133, 132, 131, 130, 129, 128, 127, 125, 124, 123, 116, 209, 58, 209, 51, 111, 110, 109, 106, 105, 90, 89, 88, 70, 69, 68, 67, 59, 58, 53, 51, 209, 3, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209];
skew.yy_chk = [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6, 6, 8, 11, 12, 15, 24, 24, 22, 30, 22, 22, 22, 22, 25, 25, 35, 15, 47, 11, 36, 22, 26, 26, 48, 35, 30, 12, 35, 8, 21, 22, 21, 21, 21, 21, 37, 36, 37, 30, 38, 39, 40, 21, 43, 54, 43, 39, 47, 206, 21, 39, 38, 21, 52, 52, 62, 205, 48, 40, 203, 21, 71, 71, 71, 71, 74, 74, 202, 21, 199, 72, 54, 72, 72, 72, 72, 120, 120, 62, 73, 196, 73, 195, 72, 73, 73, 73, 73, 75, 75, 75, 133, 133, 72, 117, 117, 117, 117, 118, 118, 118, 118, 119, 119, 119, 119, 121, 121, 121, 210, 210, 210, 210, 211, 211, 211, 211, 212, 212, 212, 212, 213, 213, 214, 214, 214, 215, 215, 216, 216, 216, 194, 193, 192, 188, 186, 185, 184, 182, 181, 180, 174, 173, 172, 170, 169, 168, 165, 164, 163, 160, 159, 158, 157, 156, 154, 153, 152, 151, 150, 149, 147, 146, 145, 144, 143, 142, 141, 140, 138, 137, 136, 135, 134, 132, 131, 130, 129, 127, 113, 112, 111, 110, 109, 108, 107, 106, 105, 104, 103, 101, 99, 98, 97, 96, 95, 94, 93, 92, 91, 90, 87, 86, 85, 82, 78, 77, 65, 64, 57, 56, 51, 46, 45, 44, 42, 41, 34, 33, 32, 20, 19, 18, 16, 10, 9, 7, 5, 3, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209, 209];
skew.operatorOverloadTokenKinds = in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.$new(), ((skew.TokenKind.ASSIGN_BITWISE_AND) | 0), 0), ((skew.TokenKind.ASSIGN_BITWISE_OR) | 0), 0), ((skew.TokenKind.ASSIGN_BITWISE_XOR) | 0), 0), ((skew.TokenKind.ASSIGN_DIVIDE) | 0), 0), ((skew.TokenKind.ASSIGN_INDEX) | 0), 0), ((skew.TokenKind.ASSIGN_MINUS) | 0), 0), ((skew.TokenKind.ASSIGN_MULTIPLY) | 0), 0), ((skew.TokenKind.ASSIGN_PLUS) | 0), 0), ((skew.TokenKind.ASSIGN_POWER) | 0), 0), ((skew.TokenKind.ASSIGN_REMAINDER) | 0), 0), ((skew.TokenKind.ASSIGN_SHIFT_LEFT) | 0), 0), ((skew.TokenKind.ASSIGN_SHIFT_RIGHT) | 0), 0), ((skew.TokenKind.BITWISE_AND) | 0), 0), ((skew.TokenKind.BITWISE_OR) | 0), 0), ((skew.TokenKind.BITWISE_XOR) | 0), 0), ((skew.TokenKind.COMPARE) | 0), 0), ((skew.TokenKind.DIVIDE) | 0), 0), ((skew.TokenKind.IN) | 0), 0), ((skew.TokenKind.INDEX) | 0), 0), ((skew.TokenKind.LIST) | 0), 0), ((skew.TokenKind.MINUS) | 0), 0), ((skew.TokenKind.MULTIPLY) | 0), 0), ((skew.TokenKind.NOT) | 0), 0), ((skew.TokenKind.PLUS) | 0), 0), ((skew.TokenKind.POWER) | 0), 0), ((skew.TokenKind.REMAINDER) | 0), 0), ((skew.TokenKind.SET) | 0), 0), ((skew.TokenKind.SHIFT_LEFT) | 0), 0), ((skew.TokenKind.SHIFT_RIGHT) | 0), 0), ((skew.TokenKind.TILDE) | 0), 0);
skew.tokenLiteral = function(kind) {
  return function(context, token) {
    return new skew.Node(kind).withRange(token.range);
  };
};
skew.boolLiteral = function(value) {
  return function(context, token) {
    return skew.Node.createBool(value).withRange(token.range);
  };
};
skew.intLiteral = function(base) {
  return function(context, token) {
    var text = token.range.toString();
    var value = 0;

    switch (base) {
      case 2:
      case 8:
      case 10: {
        for (var i = base === 10 ? 0 : 2, n1570 = in_string.count$830(text); i < n1570; i++) {
          value = value * base + in_string.s831$831(text, i) - 48;
        }
        break;
      }

      case 16: {
        for (var i = 2, n1571 = in_string.count$830(text); i < n1571; i++) {
          var c = in_string.s831$831(text, i);
          value = value * 16 + c - (c <= 57 ? 48 : c <= 70 ? 65 - 10 : 97 - 10);
        }
        break;
      }
    }

    return skew.Node.createInt(value).withRange(token.range);
  };
};
skew.dotInfixParselet = function(context, left) {
  context.next();
  var range = context.current().range;

  if (!context.expect(skew.TokenKind.IDENTIFIER)) {
    return null;
  }

  return skew.Node.createDot(left, range.toString()).withRange(context.spanSince(left.range)).withInternalRange(range);
};
skew.initializerParselet = function(context) {
  var token = context.next();
  var values = [];
  var kind = token.kind === skew.TokenKind.LEFT_BRACE || token.kind === skew.TokenKind.SET_NEW ? skew.NodeKind.INITIALIZER_SET : skew.NodeKind.INITIALIZER_LIST;

  if (token.kind === skew.TokenKind.LEFT_BRACE || token.kind === skew.TokenKind.LEFT_BRACKET) {
    var checkForColon = kind !== skew.NodeKind.INITIALIZER_LIST;
    var end = checkForColon ? skew.TokenKind.RIGHT_BRACE : skew.TokenKind.RIGHT_BRACKET;

    while (!context.peek(end)) {
      var first = skew.pratt.parse(context, skew.Precedence.LOWEST);

      if (first === null) {
        return null;
      }

      var colon = context.current();

      if (!checkForColon || in_List.isEmpty$845(values) && !context.peek(skew.TokenKind.COLON)) {
        in_List.append$851(values, first);
        checkForColon = false;
      } else {
        if (!context.expect(skew.TokenKind.COLON)) {
          return null;
        }

        var second = skew.pratt.parse(context, skew.Precedence.LOWEST);

        if (second === null) {
          return null;
        }

        in_List.append$851(values, skew.Node.createPair(first, second).withRange(skew.Range.span(first.range, second.range)).withInternalRange(colon.range));
        kind = skew.NodeKind.INITIALIZER_MAP;
      }

      if (!context.eat(skew.TokenKind.COMMA)) {
        break;
      }
    }

    context.eat(skew.TokenKind.NEWLINE);

    if (!context.expect(end)) {
      return null;
    }
  } else if (token.kind === skew.TokenKind.LIST_NEW || token.kind === skew.TokenKind.SET_NEW) {
    in_List.append$851(values, skew.Node.createName("new").withRange(new skew.Range(token.range.source, token.range.start + 1, token.range.end - 1)));
  }

  return skew.Node.createInitializer(kind, values).withRange(context.spanSince(token.range));
};
skew.parameterizedParselet = function(context, left) {
  var token = context.next();
  var parameters = [];

  while (true) {
    var type = skew.parseType(context);

    if (type === null) {
      return null;
    }

    in_List.append$851(parameters, type);

    if (!context.eat(skew.TokenKind.COMMA)) {
      break;
    }
  }

  if (!context.expect(skew.TokenKind.END_PARAMETER_LIST)) {
    return null;
  }

  return skew.Node.createParameterize(left, parameters).withRange(context.spanSince(left.range)).withInternalRange(context.spanSince(token.range));
};
skew.pratt = skew.createExpressionParser();
skew.typePratt = skew.createTypeParser();
skew.REMOVE_NEWLINE_BEFORE = in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.$new(), ((skew.TokenKind.COLON) | 0), 0), ((skew.TokenKind.COMMA) | 0), 0), ((skew.TokenKind.QUESTION_MARK) | 0), 0), ((skew.TokenKind.RIGHT_BRACKET) | 0), 0), ((skew.TokenKind.RIGHT_PARENTHESIS) | 0), 0);
skew.KEEP_NEWLINE_BEFORE = in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.$new(), ((skew.TokenKind.ANNOTATION) | 0), 0), ((skew.TokenKind.CLASS) | 0), 0), ((skew.TokenKind.COMMENT) | 0), 0), ((skew.TokenKind.DEF) | 0), 0), ((skew.TokenKind.INTERFACE) | 0), 0), ((skew.TokenKind.NAMESPACE) | 0), 0), ((skew.TokenKind.VAR) | 0), 0);
skew.REMOVE_NEWLINE_AFTER = in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.s820$820(in_IntMap.$new(), ((skew.TokenKind.COLON) | 0), 0), ((skew.TokenKind.COMMA) | 0), 0), ((skew.TokenKind.NEWLINE) | 0), 0), ((skew.TokenKind.QUESTION_MARK) | 0), 0), ((skew.TokenKind.LEFT_BRACE) | 0), 0), ((skew.TokenKind.LEFT_BRACKET) | 0), 0), ((skew.TokenKind.LEFT_PARENTHESIS) | 0), 0), ((skew.TokenKind.BITWISE_AND) | 0), 0), ((skew.TokenKind.BITWISE_OR) | 0), 0), ((skew.TokenKind.BITWISE_XOR) | 0), 0), ((skew.TokenKind.DIVIDE) | 0), 0), ((skew.TokenKind.EQUAL) | 0), 0), ((skew.TokenKind.GREATER_THAN) | 0), 0), ((skew.TokenKind.GREATER_THAN_OR_EQUAL) | 0), 0), ((skew.TokenKind.LESS_THAN) | 0), 0), ((skew.TokenKind.LESS_THAN_OR_EQUAL) | 0), 0), ((skew.TokenKind.LOGICAL_AND) | 0), 0), ((skew.TokenKind.LOGICAL_OR) | 0), 0), ((skew.TokenKind.MINUS) | 0), 0), ((skew.TokenKind.MULTIPLY) | 0), 0), ((skew.TokenKind.NOT_EQUAL) | 0), 0), ((skew.TokenKind.PLUS) | 0), 0), ((skew.TokenKind.REMAINDER) | 0), 0), ((skew.TokenKind.SHIFT_LEFT) | 0), 0), ((skew.TokenKind.SHIFT_RIGHT) | 0), 0), ((skew.TokenKind.ASSIGN) | 0), 0), ((skew.TokenKind.ASSIGN_PLUS) | 0), 0), ((skew.TokenKind.ASSIGN_BITWISE_AND) | 0), 0), ((skew.TokenKind.ASSIGN_BITWISE_OR) | 0), 0), ((skew.TokenKind.ASSIGN_BITWISE_XOR) | 0), 0), ((skew.TokenKind.ASSIGN_DIVIDE) | 0), 0), ((skew.TokenKind.ASSIGN_MULTIPLY) | 0), 0), ((skew.TokenKind.ASSIGN_REMAINDER) | 0), 0), ((skew.TokenKind.ASSIGN_SHIFT_LEFT) | 0), 0), ((skew.TokenKind.ASSIGN_SHIFT_RIGHT) | 0), 0), ((skew.TokenKind.ASSIGN_MINUS) | 0), 0);
skew.main = setTimeout(function() {
  var files = process.argv.slice(2);
  var sources = [];
  var fs = require("fs");

  for (var i2642 = 0, x2642 = files; i2642 < x2642.length; i2642++) {
    var file = x2642[i2642];
    in_List.append$851(sources, new skew.Source(file, fs.readFileSync(file, "utf8")));
  }

  var log = new skew.Log();
  var cache = new skew.TypeCache();
  var global = skew.compile(log, sources, cache);

  if (log.hasErrors()) {
    console.log(log.toString());
  } else {
    var emitter = new skew.JsEmitter(cache);
    emitter.visit$323(global);

    for (var i2647 = 0, x2647 = emitter.sources(); i2647 < x2647.length; i2647++) {
      var source = x2647[i2647];
      process.stdout.write(source.contents);
    }
  }
});
skew.JsEmitter.isKeyword = in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.$new(), "apply", 0), "arguments", 0), "Boolean", 0), "break", 0), "call", 0), "case", 0), "catch", 0), "class", 0), "const", 0), "constructor", 0), "continue", 0), "Date", 0), "debugger", 0), "default", 0), "delete", 0), "do", 0), "double", 0), "else", 0), "export", 0), "extends", 0), "false", 0), "finally", 0), "float", 0), "for", 0), "Function", 0), "function", 0), "if", 0), "import", 0), "in", 0), "instanceof", 0), "int", 0), "let", 0), "new", 0), "null", 0), "Number", 0), "Object", 0), "return", 0), "String", 0), "super", 0), "this", 0), "throw", 0), "true", 0), "try", 0), "var", 0);

// Flags
skew.Symbol.IS_AUTOMATICALLY_GENERATED = 1 << 0;
skew.Symbol.IS_CONST = 1 << 1;
skew.Symbol.IS_GETTER = 1 << 2;
skew.Symbol.SHOULD_INFER_RETURN_TYPE = 1 << 3;
skew.Symbol.IS_OVER = 1 << 4;
skew.Symbol.IS_SETTER = 1 << 5;
skew.Symbol.IS_VALUE_TYPE = 1 << 6;

// Modifiers
skew.Symbol.IS_EXPORTED = 1 << 7;
skew.Symbol.IS_IMPORTED = 1 << 8;
skew.Symbol.IS_PREFERRED = 1 << 9;
skew.Symbol.IS_PRIVATE = 1 << 10;
skew.Symbol.IS_PROTECTED = 1 << 11;
skew.Symbol.IS_RENAMED = 1 << 12;
skew.Symbol.IS_SKIPPED = 1 << 13;
skew.Symbol.nextID = 0;
skew.resolving.Resolver.annotationSymbolFlags = in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.s808$808(in_StringMap.$new(), "@export", skew.Symbol.IS_EXPORTED), "@import", skew.Symbol.IS_IMPORTED), "@prefer", skew.Symbol.IS_PREFERRED), "@private", skew.Symbol.IS_PRIVATE), "@protected", skew.Symbol.IS_PROTECTED), "@rename", skew.Symbol.IS_RENAMED), "@skip", skew.Symbol.IS_SKIPPED);
skew.Type.DYNAMIC = null;
skew.Type.NULL = null;
skew.Type.nextID = 0;
skew.Environment.nextID = 0;