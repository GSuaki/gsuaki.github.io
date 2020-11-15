# Fundamentos básicos do paradigma + Estrutura de dados

## 1. Fundamente-se

É comum ouvir palpites em *Pull Requests* como: "ei, você pode refatorar esse código usando programação funcional. Use filter, map ou reduce". Mas será que programação funcional é sobre isso? Bom, já adianto que não. O que define o paradigma funcional são suas características: Comportamento reproduzível (*Referencial transparency*), funções puras (*The absence of side-effects*) e valores imutáveis (*Immutability*).

### 1.1. Referencial transparency

*Referencial transparency* refere-se a substituição de uma função pelo seu valor. No código abaixo, ao substituir a função `sum` pelo valor da soma, não há alteração no comportamento da aplicação, independente de quantas vezes é invocada.

```java
final int dez = 10;
final int result = Math.sum(7, 3);
assertEquals(dez, result); // NAIL IT

// outro exemplo com Strings
final String snaked = "Invoice_ID";
final String result = "Invoice ID".replace(" ", "_");
assertEquals(snaked, result); // NAIL IT
```

Já no código abaixo isso não ocorre. Não podemos prever o valor de `result` por ser randômico.

```java
  final int cinco = 5;
  final int result = new Random().nextInt();
  assertEquals(cinco, result); // FAIL IT
```

### 1.2. Pure functions

Essa característica é dividida em dois aspectos:

1. O valor da função será sempre o mesmo para a mesma entrada. Não importa quantas vezes chamamos `Math.sum(7, 3)`, o resultado sempre será 10. Caso a entrada mude (`Math.sum(10, 3)`), o resultado muda também. É importante ressaltar que esse fator descarta qualquer tipo de apontamento externo ou referência mutável. Veja o exemplo abaixo: 

```java
private static Integer NINE = 9;

public Integer plusNine(final Integer n) {
  return n + NINE;
}
```

A função `plusNine` parece ser pura, tendo seu valor reproduzível. Entretanto, ela aponta para uma variável estática e mutável externa à seu escopo, tornando-a impura.

2. Sua execução não possui *side-effects*. Comportamentos como apontar para uma variável estática, apontar para uma variável fora do escopo da função ou alterar algum estado interno (ou de um parâmetro) são qualificados como *side-effects*. Dito isto, fica claro que funções `void` possuem *side-effects*, do contrário, por que invocar uma função que não produz valor ?

### 1.3. Immutability

Imutabilidade é um conceito bastante conhecido porém pouco trabalhado, principalmente em linguaguem orientada a objetos. Essa característica implica em construir um objeto e não poder alterar o seu estado interno, ou seja, seu valor. No Java as classes mais utilizadas são imutáveis como, por exemplo: `String`, `LocalDate`, `LocalDateTime`, `BigInteger`, `BigDecimal`.

**Exemplo 1. Strings**
```java
final String nome = "Gabriel";
final String nomeEmMinusculo = nome.toLowerCase();

assertEquals("Gabriel", nome); // NAIL IT
assertEquals("gabriel", nomeEmMinusculo); // NAIL IT
```

**Exemplo 2. BigInteger**
```java
final BigInteger age = BigInteger.valueOf(15L);
final BigInteger agePlusFive = age.add(BigInteger.valueOf(5L));

assertEquals(15, age); // NAIL IT
assertEquals(20, agePlusFive); // NAIL IT
```

Em ambos exemplos o estado interno do objeto não se alterou, tanto `BigInteger.add` quanto `String.toLowerCase` 
produzem o resultado esperado, porém em um novo objeto. Neste próximo exemplo, entretanto, o mesmo não se aplica:

**Exemplo 3. ArrayList**
```java
final List<Integer> integers = Arrays.asList(1, 2);
final Integer size = integers.size();
integers.add(3);
        
assertEquals(size, 2); // FAIL IT
```

O método `List.add` produz um `boolean`, logo, fica evidente que altera o estado interno da lista para armazenar o novo inteiro, do contrário,`List.add` produziria uma nova lista. Podemos dizer então que há *side-effect* e *ArrayList* não é imutável.

## 2. Estrutura de dados

No paradigma Funcional não trabalhamos com classes que encapsulam comportamento e estado. Ao invés, trabalhamos com estrutura de dados as quais são divididas em três tipos: **Estruturas mutáveis**, **estruturas imutáveis** e **estruturas persistêntes**.

### 2.1. Estruturas mutáveis

É basicamente o que vimos no `exemplo 3`. A estrutura `ArrayList` do Java é mutável por padrão. Toda operação altera o estado interno da estrutura.

### 2.2. Estruturas imutáveis

Essas estruturas não se alteram pós construção e, no Java, as operações lançam erros. Veja o exemplo abaixo:

```java
final List<Integer> integers = Collections.unmodifiableList(Arrays.asList(1, 2));
integers.add(3); // throws UnsupportedOperationException
```

O método `unmodifiableList` transforma uma lista mutável em uma nova lista imutável e, feito isso, toda tentativa de alterar o estado interno resulta no erro `UnsupportedOperationException`.

### 2.3. Estruturas persistentes

Nesse tipo de estrutura é possível operar em cima dela mesma. Todavia, o resultado da operação sempre retorna uma nova estrutura baseada na antiga, compartilhando os elementos para otimizar uso da memória. No Java não temos essas estruturas e é ai que entra o *Vavr*. Na biblioteca *Vavr* temos a estrutura que representa uma lista ligada conhecida como *List*.

```java
final List<Integer> count = List.of(1, 2, 3);
```

Podemos visualizar a lista *count* como sendo:

![List(1, 2, 3)](https://dev-to-uploads.s3.amazonaws.com/i/4ovtdtaqwmretc4e1c7w.png)

O que acontece se manipularmos a lista substituindo o primeiro elemento por 0 ?

```java
final List<Integer> newCount = count.tail().prepend(0);
```

A operação acima descarta o primeiro elemento "cabeça" `newCount`, retornando a "calda" `.tail()`, além de adicionar o elemento 0 como primeiro elemento `.prepend(0)`. Por ser uma lista persistente, as operações resultam em uma nova lista chamada `newCount`, mantendo a anterior `count` intacta com mesmo valor (1, 2 e 3).

![List(0, 2, 3)](https://dev-to-uploads.s3.amazonaws.com/i/juerwnntfonm287m5373.png)

O truque aqui é gerar uma nova versão da lista primária, reutilizando os mesmos elementos para otimizar o uso de memória. 

## 3. Conclusão sobre FP

Não pense que trabalhar com linguagens funcionais é estar 100% conforme as características. Existem momentos onde não da para escapar dos *side-effects*. Por exemplo, qualquer funcionalidade que faz I/O (log, stream, req/res, etc.) é um *side-effect*.

> Estamos falando tanto em funções, fiquei curioso, você saberia me dizer qual a diferença entre um método e um função?
> Bom, um método não existe por si só, ele precisa de uma classe para existir. 
> A função, por outro lado, pode viver sozinha, flutuando em um arquivo.

## 4. Próximos passos
Em breve trarei o segundo post da série: Programação Funcional em Java #2 - Descomplicando Vavr.

## 5. Referências
- [Vavr docs](https://www.vavr.io/vavr-docs/)
- [The agonizing death of an astronaut](http://blog.vavr.io/the-agonizing-death-of-an-astronaut/)
- [A Fistful of Monads](http://learnyouahaskell.com/a-fistful-of-monads)
- [Monad comprehensions](https://arrow-kt.io/docs/patterns/monad_comprehensions/)
- [The Duality of Pure Functions](https://nofluffjuststuff.com/magazine/2016/11/the_duality_of_pure_functions)
- [Functional Programming, Simplified](https://alvinalexander.com/scala/functional-programming-simplified-book/)