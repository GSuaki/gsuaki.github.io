# Descomplicando o Vavr

Se você está se perguntando "Qual a relação entre Programação Funcional e *Vavr* ?" não se preocupe, vou te explicar. A biblioteca *Vavr* é um *superset* de construções básicas que linguagens funcionais oferecem por padrão, com exceção do Java - o que dificulta a utilização do paradigma funcional no dia-a-dia.

A biblioteca conta com várias construções e aqui focaremos nas mais importantes: *Functions*, *Monads*, *Collections* e *Pattern Matching*.

## 1. Functions

*Functions* enriquece as funções de uma maneira jamais vista antes no Java. É considerado um dos pilares mais importantes, pois Programação Funcional é sobre valores e como manipulá-los  através de funções. Esse módulo sobre funções é divido em cinco conceitos: *Composition*, *Lifting*, *Partial application*, *Currying* e *Memoization*.

### 1.1. Composition

Esse é o conceito mais simples (também encontramos nas interfaces do Java). É basicamente sobre compor as funções a fim de obter maior robustez e significância. Veja o exemplo:

```java
final Function1<Integer, Integer> tributoIRRF = Function1.of(n -> n - 1000);

final Function1<Integer, Integer> contribuicaoINSS = Function1.of(n -> n - 100);

final Function1<Integer, Integer> calculaSalarioLiquido = tributoIRRF.andThen(contribuicaoINSS);

final Integer salarioLiquido = calculaSalarioLiquido.apply(2000); // Líquido de 900
```

Nesse exemplo acima definimos três funções. A primeira `tributoIRRF` recebe um inteiro e subtrai 1000. A segunda `contribuicaoINSS` também recebe um inteiro mas subtrai apenas 100. Na terceira função `calculaSalarioLiquido` não implementamos nenhuma lógica, ao invés disso foi feita uma composição entre as duas primeiras funções. Ao executar `calculaSalarioLiquido` seguimos a lógica em invocar  `tributoIRRF` e, então, invocar `contribuicaoINSS`. Convertendo para funções matemáticas, podemos ler `f(x): ((x - 1000) - 100)`.

Além do `andThen`, também é possível alterar a ordem da execução com o `compose`:

```java
final Function1<Integer, Integer> calculaSalarioLiquido = tributoIRRF.compose(contribuicaoINSS);

final Integer salarioLiquido = calculaSalarioLiquido.apply(2000); // Líquido de 900
```

Dessa forma, o resultado obtido ainda é o mesmo, mas agora lê-se `f(x): ((x - 100) - 1000)` .

### 1.2. Lifting

Esse conceito consiste em envolver uma função que consideramos parcial gerando uma função total. Para entender melhor, veja este exemplo:

```java
public Integer calculaImposto(final Integer tributoIRRF, final Integer contribuicaoINSS) {

  if (tributoIRRF < 0 || contribuicaoINSS < 0) {
    throw new IllegalArgumentException("Imposto não pode ser menor que 0");
  }

  return tributoIRRF + contribuicaoINSS;
}
```

Esse método `calculaImposto` retorna a soma entre os dois impostos da entrada, caso sejam maiores que 0, do contrário, lança uma exceção. O fato de lançar tal exceção o torna uma função parcial. Podemos tornar a mesma completa utilizando o `Function2.lift`.

```java
Function2<Integer, Integer, Option<Integer>> calculadorDeImposto = 
  Function2.lift(this::calculaImposto);
```

Epa! `Option`, *what!?* Calma, por ora, o que você precisa saber é que este `Option` tem a semântica do `Optional` do Java e tem duas representações: `None()` quando é vazio e `Some(n)` quando há um valor. 

Voltando ao exemplo, na nova função `calculadorDeImposto`, agora indicamos ao consumidor que a função pode ou não produzir um resultado. No caso, se o valor de um dos impostos for menor que zero e o método principal `calculaImposto` lançar uma exceção, o resultado da operação é `None()`. Por outro lado, caso os parâmetros estiverem OK, o resultado é `Some(n)`.

### 1.3. Partial application

*Partial application* consiste em reduzir gradativamente a quantidade de parâmetros de uma função aplicando aqueles que estão disponíveis. É parecido com o conceito `Currying`, mas não se engane, pois eles são diferentes. Vamos ao exemplo:

**Exemplo 1. Reduzindo parâmetros até o último**
```java
final Function3<Integer, Integer, Integer, Integer> calculaSalarioLiquido = 
  (salario, tributoIRRF, contribuicaoINSS) -> salario - (contribuicaoINSS + tributoIRRF);

final Function2<Integer, Integer, Integer> salarioBruto = calculaSalarioLiquido.apply(2000);

final Function1<Integer, Integer> salarioMenosIRRF = salarioBruto.apply(1000);

final Integer salarioLiquido = salarioMenosIRRF.apply(100);
```

Nesse exemplo 1, a função `calculaSalarioLiquido` é de aridade três, ou seja, demanda três parâmetros de entrada. Supondo que no momento da execução não temos todos os três valores, como proceder? Felizmente, o *Vavr* está preparado para receber os valores individualmente e ir reduzindo a aridade da função, exatamente como no exemplo 1. 

Primeiramente aplicamos o valor do salário (2000) e a função `calculaSalarioLiquido` nos retornou uma **nova função** de aridade dois, a qual chamamos de `salarioBruto`. Em seguida, aplicamos o próximo valor (1000) referente ao **tributoIRRF** e o resultado foi uma **nova função** de aridade um, a qual chamamos de `salarioMenosIRRF`. Por fim, aplicamos o valor de 100 referente a **contribuicaoINSS** e obtivemos o resultado final que é o salário líquido no valor de 900.

O *Vavr* também possibilita fazer de outras formas. No próximo exemplo utilizamos os métodos `reversed()` e `.apply(p1, p2)` de aridade dois, veja:

**Exemplo 2. Invertendo a ordem e aplicando dois parâmetros de uma só vez**
```java
final Function3<Integer, Integer, Integer, Integer> calculaSalarioLiquido =
  (salario, tributoIRRF, contribuicaoINSS) -> salario - (contribuicaoINSS + tributoIRRF);

final Function1<Integer, Integer> salarioMenosIRRFeINSS = calculaSalarioLiquido.reversed().apply(100, 1000);

final Integer salarioLiquido = salarioMenosIRRFeINSS.apply(100);
```

Nesse segundo cenário fizemos basicamente a **inversão** dos parâmetros de entrada para que pudéssemos aplicar os dois impostos de uma só vez e, então, gerar função `salarioMenosIRRFeINSS` cuja aridade caiu de três para um. Dessa forma, para o cálculo da aridade da função resultante utilizamos a fórmula: `aridade original - parâmetros aplicados`.

### 1.4. Currying

*Currying* é a técnica de quebrar a aridade de uma função em funções de aridade única. Ficou confuso? Vamos ao exemplo:

```java
final Function3<Integer, Integer, Integer, Integer> calculaSalarioLiquido =
  (salario, tributoIRRF, contribuicaoINSS) -> salario - (contribuicaoINSS + tributoIRRF);

final Function1<Integer, Function1<Integer, Function1<Integer, Integer>>> calculoSeparado =
  calculaSalarioLiquido.curried();
```

Aqui, podemos ver nossa conhecida função, de aridade três e bastante complexa, `calculaSalarioLiquido`. Com o uso do `.curried()` possibilitamos desmembrá-la em três funções encadeadas de um único parâmetro.

Para invocar a função resultante de `.curried()`, faremos desta forma:

```java
final Integer salarioLiquido = calculoSeparado.apply(2000).apply(1000).apply(100);
```

Resumindo, a diferença entre *Currying* e *Partial application* é que *Currying* quebra a função em funções de aridade única encadeadas, enquanto o *Partial application* é flexível, pois resulta sempre em uma função com o restante dos parâmetros não aplicados.

### 1.5. Memoization

*Memoization* consiste em cachear o resultado de uma função com base nos parâmetros.

```java
final Function3<Integer, Integer, Integer, Integer> calculaSalarioLiquido =
  (salario, tributoIRRF, contribuicaoINSS) -> salario - (contribuicaoINSS + tributoIRRF);

final Function1<Integer, Integer> salarioMenosDescontos =
  calculaSalarioLiquido.reversed().apply(100, 1000).memoized();

final Integer salarioLiquido = salarioMenosDescontos.apply(2000); // Calcula e cacheia

final Integer salarioLiquido2 = salarioMenosDescontos.apply(2000); // Utiliza valor do cache

final Integer salarioLiquido3 = salarioMenosDescontos.apply(3000); // Calcula e cacheia
```

Supondo que `calculaSalarioLiquido` demande uma computação enorme e que os parâmetros `tributoIRRF` e `contribuicaoINSS` não se alterem com muita frequência, podemos aplicar os parâmetros de impostos e marcar a função resultante como `.memoized()`, assim, a **nova função** `salarioMenosDescontos` terá o comportamento de cachear o resultado em memória, sendo a chave o parâmetro de entrada. Ou seja, ao aplicar o valor 2000, toda computação é feita e ao final armazena-se o resultado. Se o valor for *inputado* novamente o cache estará populado, retornando o resultado computado previamente.

## 2.1. Monads

*Monads* são *typeclasses* que encapsulam um **valor** a um comportamento específico. Você conhece o `java.util.Optional` ? É um *Monad*. Ele encapsula um **valor** que pode, ou não, estar presente.

### 2.1. Option

*Option* é um container que representa um valor opcional. Por baixo dos panos, a interface *Option* tem duas implementações: `Some(value)` quando há valor dentro do *Option* e `None()` para quando não há.

```java
Option<String> maybeName = Option.of("Gabriel"); // Some(string)

Option<String> maybeName = Option.of(null); // None()
```

Veja que, diferentemente do `Optional`, o *factory method* padrão do `Option` contém a inteligência de fazer a triagem do valor *null*, sem precisar de um outro método como `Optional.ofNullable`. Além disso, existe outra diferença muito importante no comportamento do `.map` que ,se você não se atentar, pode resultar em NPEs. 

**Exemplo 1. *Optional* padrão do Java**
```java
final Optional<String> name = Optional.of("gabriel") // (1)
  .map(value -> (String) null) // (2)
  .map(value -> value.toLowerCase()); // (3) Não acontece

assertFalse(name.isPresent());
```

1. Optional com valor interno "gabriel".
2. Optional se torna vazio pois *null* é retornado.
3. Não é invocado pois o Optional está vazio.

No exemplo acima, ao retornar *null* no primeiro `.map`, podemos observar que o comportamento é de desconsiderar os próximos `.map`, pois o valor interno tornou-se vazio. Caso prosseguisse para o próximo `.map(value -> value.toLowerCase())` o resultado seria, inevitavelmete, NPE, já que *value* passou a ser *null*.

**Exemplo 2. *Option* do *Vavr***
```java
final Option<String> name = Option.of("gabriel") // (1)
  .map(value -> (String) null) // (1)
  .map(value -> value.toLowerCase()); // (3) throws NullPointerException
```

1. Option com valor interno `Some("gabriel")`.
2. Option se torna `Some(null)`.
3. `.map` é invocado com valor *null* e um NPE é lançado.

Simulando o mesmo cenário, mas com *Option* do *Vavr*, observamos que *NullPointerException* é lançado ao tentar invocar `.toLowerCase` em uma variável *null*. Isso acontece porque a semântica do `.map` do *Vavr* preserva o conceito matemático de que invocar `.map` em um `Some` resulta em outro `Some`, e invocar `.map` em um `None` resulta em outro `None`. No `Optional` do Java, o resultado *null* ao invocar o `.map` altera o contexto interno de `Some` para `None`. 

Sabendo disso, o que fazer para voltar a estar seguro contra *null* ? É simples. Ao invés de `.map`, **flatMap that shit!**.

```java
final Option<String> name = Option.of("gabriel")
  .flatMap(value -> Option.of((String) null))
  .map(value -> value.toLowerCase()); // we are safe

assertFalse(name.isPresent());
```

Para conhecer mais sobre o assunto, recomendo este *post* [The agonizing death of an astronaut](http://blog.vavr.io/the-agonizing-death-of-an-astronaut).

### 2.2. Try

*Try* é um container que representa uma execução que pode resultar em sucesso ou em uma exceção.

```java
// Simples try com valor padrão em caso de erro.
Try.of(() -> calculaImpostos())
   .getOrElse(valorDefault);

// Exemplo um pouco mais avançado utilizando Try with resources para ler um InputStream
Try.withResources(() -> readFile())
   .of(stream -> IOUtils.toString(stream))
   .getOrElse("");
```

Em caso de erro, esse mônada fornece métodos utilitários que nos permite fazer tratamentos, tais como:

```java
Try.of(this::calculaImposto)
   .recover(AException.class, t -> recoverFromA(t))
   .recover(BException.class, t -> recoverFromB(t))
   .recoverWith(CException.class, t -> Try.of(() -> recoverFromC(t)))
```

Ou, podemos utilizar *Pattern Matching* - conceito que veremos mais à frente - e unificar os `.recover` com *rebuscado fancy* *switch-case* funcional *Match*, fornecido pelo *Vavr*:

```java
Try.of(this::calculaImposto)
   .recover(error -> Match(error).of(
     Case($(instanceOf(AException.class)), t -> recoverFromA(t)),
     Case($(instanceOf(BException.class)), t -> recoverFromB(t)),
     Case($(instanceOf(CException.class)), t -> recoverFromC(t)),
     Case($(), t -> recoverFromUnknown(t))
   ))
   .getOrElse(impostoPadrao);
```

No exemplo acima, fica  notável como *Vavr* nos permite desenvolver códigos **funcionais** e **expressivos**. Além dos métodos exemplificados, *Try* conta com hooks como `.onFailure`, `.onSuccess`, `.andFinally`, `.andThen`, entre outros.

### 2.3. Lazy

*Lazy* é um container que representa um valor que não precisa ser computado no momento em que é criado, apenas quando solicitado. Diferentemente do *Supplier*, cuja semântica é parecida, no *Lazy* o resultado é cacheado ao ser evaluado.

```java
final Lazy<UUID> id = Lazy.of(UUID::randomUUID); // (1)
id.isEvaluated(); // (2)

final UUID newID = id.get(); // (3)
id.isEvaluated(); // (4)

final UUID cachedID = id.get(); // (5)
assertEquals(newID, cachedID);
```

1. Cria-se instância do *Lazy* a partir de um *supplier* de *UUID*.
2. `isEvaluated` é *false* por não ter sido invocado o `.get`.
3. Invoca-se o `.get` que invoca o *supplier* `UUID.randomUUID` gerando o *UUID* aleatório.
4. `isEvaluated` passa a ser *true*.
5. Invoca-se o `.get` e retorna o UUID cacheado do **passo 3**.

Outra funcionalidade muito interessante é o suporte a *interfaces*, onde a instância da implementação é feita via *Proxy* na primeira chamada de qualquer método da *interface*. Não entendeu ? Vamos ao exemplo:

```java
final CalculadoraImposto inss = Lazy.val(CalculadoraINSS::new, CalculadoraImposto.class);
inss.calcular(); // (1)
inss.calcular(); // (2)

public interface CalculadoraImposto {
  Integer calcular();
}

public class CalculadoraINSS implements CalculadoraImposto {
  public CalculadoraINSS() {
    System.out.println("Instanciando calculadora INSS");
    // Computação custosa e demorada
  }
  
  @Override
  public Integer calcula() {
      return 1000;
  }
}
```

1. Invoca-se o método `calcular`, o qual passa pelo *proxy* e invoca o *supplier* `CalculadoraINSS::new`, cacheando o resultado e depois invocando o método.

2. Invoca-se o método `calcular`, o qual também passa pelo *proxy*, mas desta vez, o resultado do *supplier* está cacheado e não passa pelo `CalculadoraINSS::new`, indo direto ao método.

Nesse exemplo, temos a *interface* `CalculadoraImposto` e a implementação `CalculadoraINSS`. Supondo que instanciar `CalculadoraINSS` demande muito poder computacional e *tempo*, obviamente não gostaríamos de instanciar sem realmente precisar. Utilizando *factory method* `Lazy.val`, passamos como primeiro parâmetro o *Supplier*, responsável por construir o objeto, e como segundo parâmetro o `.class` da interface, a qual a implementação pertence (CalculadoraImposto). Repare que o retorno do `Lazy.val` é a própria interface e não `Lazy<CalculadoraImposto>`, como no exemplo anterior com `Lazy.of`. O truque aqui é que o *Vavr* cria um *Proxy* dinâmico da interface envolvendo o *Supplier* em um *Lazy*. Quando qualquer invocação é feita, nos métodos da interface, primeiro passa-se pelo *Proxy* que invoca o `Lazy.get` e depois invoca-se a implementação real do método, caso necessário. Como vimos acima, `Lazy.get` faz cache do resultado, ou seja, só invocamos o construtor `CalculadoraINSS` uma vez e a instância fica em memória para ser reutilizada.

### 2.4. Either

*Either* é um container que representa um valor que pode se apresentar de duas maneiras diferentes. Por debaixo dos panos, a interface *Either* tem duas implementações: `Left()`  e `Right()` .
Este mônada é bastante utilizada para representar um valor que deu certo (*right*) ou que falhou (*left*). Imagino que você esteja se perguntando  "qual a diferença entre *Either* e *Try*" ? Bom, assim como o *Either*, a semântica do *Try* também  representa um valor que pode ser um sucesso ou um erro. A grosso modo, é possível visualizar o *Try* sendo um `Either<Throwable, R>`, todavia, seu contexto é inteiro voltado para isso e **apenas** isso. Por outro lado, o *Either* é flexível e não representa, necessariamente, sucesso ou falha.

```java
final Either<String, Integer> impostoINSS = calculaINSS();

final Integer inss = impostoINSS
  .map(imposto -> salario - imposto) // (1)
  .getOrElseThrow(left -> handleError(left)); // (2)
```

1. `.map` só será executado caso o *Either* seja *Right*, ou seja, sucesso.

2. Caso seja *Left*, lidamos com erro invocando `handleError`.

No exemplo acima, *Either* foi utilizado para indicar cálculo do INSS com sucesso (*right*) ou falha (*left*). `calculaINSS` poderia retornar *Try* ao invés de *Either* ? Sim, mas repare que a assinatura é `Either<String, Integer>`, se fosse *Try* lidaríamos com `Throwable` ao invés de `String`, o que pode fazer toda diferença para o contexto da aplicação e a maneira como lidamos com a falha.
Existem outras formas de trabalhar com o *Either*, conheça o `.fold`:

```java
final Integer inss = impostoINSS.fold(
  left -> 1000, // (1) 
  imposto -> salario - imposto // (2)
);

```

1. Ignora-se a mensagem de erro *left* e retorna o valor padrão 1000. Poderíamos obter o mesmo resultado alterando a implementação do `leftMapper` por `left -> { throw handleError(left); }`.

2. Mantém o mesmo comportamento que o exemplo anterior para caso de sucesso.

Diferentemente do `.map` e `.getOrElseThrow` encadeados, o `.fold` recebe ambos os *mappers* (*leftMapper* e *rightMapper*) e utiliza um deles dependendo de seu estado interno (*left* ou *right*).

## 3 Collections
As coleções do *Vavr* são uma evolução das que encontramos no Java. Todas são imutáveis e cada tentativa de mutação gera uma nova lista, ou seja, são estruturas persistentes.

**Exemplo 1. java.util.List vs io.vavr.collection.List**
```java
// Java 8
final java.util.List<Integer> list = Arrays.asList(1, 2, 3);
list.add(4);
list.add(5);
list.add(0, 9);
list.set(1, 6);

list
  .stream()
  .max(Integer::compareTo)
  .ifPresent(System.out::print);

// Vavr - io.vavr.collection.List
List.of(1, 2, 3) // List(1, 2, 3) 
    .append(4) // List(1, 2, 3, 4)
    .append(5) // List(1, 2, 3, 4, 5)
    .insert(0, 9) // List(9, 1, 2, 3, 4, 5)
    .pop()
    .update(1, 6) // List(9, 6, 2, 3, 4, 5)
    .max() // Option(9)
    .peek(System.out::print); // 9
```

Parece complexo, mas na verdade é bem simples. No exemplo acima, ambas *collections* iniciam-se com valores de 1, 2 e 3. Em seguida, adicionam-se os inteiros 4 e 5. Depois disso, insere-se o número 9 como primeiro elemento da lista e atualiza-se o valor do elemento de índice 1 para 6. Na próxima etapa devemos ir à procura  do maior valor da lista e imprimir no console.

Podemos observar que a lista do *Vavr* é bem mais simples de se manipular. Cada manipulação gera uma nova lista e não corremos o risco de algum *side-effect* indesejado.

**Exemplo 2. io.vavr.collection.HashMap**
```java
final HashSet<String> setOfNames = HashSet.of("Gabriel", "Joao", "Caio", "Pedro", "Fernando");

final Map<String, Integer> nameWithSize = setOfNames.toMap(Function.identity(), String::length);

nameWithSize.filterValues(size -> size > 4)
            .computeIfAbsent("Priscila", String::length)
            ._2()
            .computeIfPresent("Gabriel", (name, size) -> name.length())
            ._2()
            .maxBy(entry -> entry._2())
            .peek(System.out::println);
```

Todas as coleções são otimizadas no quesito *Time Complexity*, para saber mais: [Performance Characteristics](https://www.vavr.io/vavr-docs/#_performance_characteristics).

## 4. Pattern Matching

> Finalmente chegamos na parte mais poderosa do *Vavr* - e aquela que eu mais utilizo! 

*Pattern Matching* é a habilidade de comparar um valor aos padrões estipulados. Caso surja algum match, aplica-se a função correspondente ao valor. Na prática é um hiper *switch-case*, veja o exemplo:

```java
import static io.vavr.API.*;
// io.vavr.API.Match, io.vavr.API.Case e io.vavr.API.$
final String value = "Gabriel";
final Number number = Match(value).of(
  Case($("gab"), name -> 3),
  Case($(isNull()), name -> 0),
  Case($(isIn("Monica", "Cebolinha", "Joao")), name -> 0),
  Case($(instanceOf(CharSequence.class)), name -> name.length()),
  Case($(name -> name.length() > 10), name -> -1),
  Case($(), name -> -1)
);
```

O exemplo acima é bastante simples, mas exibe as possibilidades que *Pattern Matching* nos dá. A estrutura apresenta-se como: 

1. `Match(valor)` entrando com valor que será comparado aos padrões.
2. `Case(padrão, função)` definindo o padrão que será comparado e, se servir, a função na qual será aplicado o valor.

Os possíveis **padrões**, dentro do `Case`, podem ser:
- $() - Padrão genérico/default
- $(value) - Padrão *equals*
- $(predicate) - Padrão condicional

Caso não queira usar o padrão genérico `$()`, é necessário utilizar o `Match().option` ao invés de `Match().of` e tratar manualmente.

```java
final Option<Number> plusOne = Match(number).option(
  Case($(instanceOf(Integer.class)), i -> i + 1),
  Case($(instanceOf(Double.class)), d -> d + 1)
);
```

## 5. What’s next?

A biblioteca *Vavr* ainda tem muito mais a ser explorada, não hesite em ler a [documentação completa](https://www.vavr.io/vavr-docs).

## 6. Referências
- [Vavr docs](https://www.vavr.io/vavr-docs/)
- [The agonizing death of an astronaut](http://blog.vavr.io/the-agonizing-death-of-an-astronaut/)
- [A Fistful of Monads](http://learnyouahaskell.com/a-fistful-of-monads)
- [Monad comprehensions](https://arrow-kt.io/docs/patterns/monad_comprehensions/)
- [Functional Exception Handling in Java with Vavr by Grzegorz Piwowarek](https://www.youtube.com/watch?v=pPy-ETY8a-E)
