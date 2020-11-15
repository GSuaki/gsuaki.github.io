15/09/20 - Java 15 se torna GA. 

Além das *preview features*, conhecidas das versões anteriores (*Text Blocks*, *Pattern Matching* para *instanceof* e *Records*), foi introduzido no Java 15 os conceitos de *sealed classes* e *Local interfaces & enums*.

## 1. Getting Started

Para começar vamos instalar a *JDK* 15. Eu utilizo o [sdkman](https://sdkman.io/) para gerenciar todas as *JDKs* do meu *workspace*, mas se achar mais conveniente  baixar direto da OpenJDK, [este é o link](https://jdk.java.net/15/).

Utilizando o *sdkman*, primeiro listamos as *JDKs* disponíveis:

```shell
sdk list java
```

![sdk list java result](https://dev-to-uploads.s3.amazonaws.com/i/ii8mrbjjuebkg1z9r6ha.png)

Em seguida, basta executar o comando com o *identifier* encontrado:

```shell
sdk install java 15.ea.36-open
```

Pronto! A JDK está instalada e pronta para ser usada. Agora basta configurar o IntelliJ:

![IntelliJ config](https://dev-to-uploads.s3.amazonaws.com/i/jw9b6f20zznlugnvh02t.png)

## 2. *Sealed Classes & Interfaces (Preview)*

Essa funcionalidade permite assumir o controle da hierarquia de classes e interfaces através da keyword `sealed` e `permits`. Vamos ao exemplo:

```java
sealed public interface Shape permits Circle, Square, Rectangle, Diamond { }
```

No código acima, definimos a interface `Shape` e marcamos como `sealed`. Classes *sealed* demandam a declaração da *keyword* `permits` para dizer ao compilador quais as classes ou interfaces poderão estender ou implementar `Shape`. Existe uma exceção a regra somente para casos onde as implementações estão no mesmo arquivo que a *sealed class*. Quando isto ocorre, podemos omitir a *keyword* `permits` da declaração da *sealed class*.

Classes cuja classe pai é *sealed* demandam declarar sua abrangência de hierarquia entre: `final`, `non-sealed` ou `sealed`.

Normalmente, as **classes** filhas serão *final* para evitar que possam ser herdadas. Ao tentar herdar, observará um erro de compilação.

```java
final class Square implements Shape { }

class TimesSquare extends Square { } // Compilador fica chateado, pois Square é final.
```

Também é possível substituir o uso da *final class* por `record`, pois são classes imutáveis e, por baixo dos panos, o compilador gera um *final class*.

```java
record Square() implements Shape { }
```

As estruturas filhas declaradas como `non-sealed` expandem a hierarquia, possibilitando-as de serem estendidas ou implementadas por qualquer outra classe ou interface.

```java
non-sealed interface Diamond extends Shape { }

non-sealed class Circle implements Shape { }

class BigCircle extends Circle { }

interface ColoredDiamond extends Diamond {}
```

> Deve-se atentar que *non-sealed classes* podem quebrar a coesão de seus modelos, pois voltam a expor tudo o que tentou proteger com `sealed`.

Por último, e não menos importante, podemos ter *sealed classes* implementando *sealed classes*. Dessa forma, não deixamos tão aberto quanto as `non-sealed` e nem tão engessado quanto as `final`, continuamos restringindo a herança ou composição.

```java
sealed class Rectangle implements Shape permits CustomRectangle { }

final class CustomRectangle extends Rectangle { }
```

### 2.1. Type-Test Pattern matching

Com o controle de hierarquia que as *sealed classes* proveem ao compilador, seria possível fazer *type-test-pattern* igual ao que vemos no [*when* do *Kotlin*](https://kotlinlang.org/docs/reference/control-flow.html#when-expression). 
 
```java
public Double getAreaOfShape(final Shape shape) {
	return switch (shape) {
		case Circle c -> circleArea(c);
		case Diamond d -> diamondArea(d);
		case Rectangle r -> rectangleArea(r);
		case Square s -> squareArea(s);
	};
}
```

Atualmente esse código acima **não compila**, pois *type-test-pattern* no *switch-case* não é uma funcionalidade ainda, é apenas uma possibilidade. A razão disso, é por conta do precedente que foi adicionado ao Java 14: *Pattern Matching for instanceof*.

Indo mais além, pelo fato do compilador saber exatamente quem implementa determinada *sealed class*, seria possível omitir o *default* no *switch-case*, pois todas as possibilidades foram declaradas.

## 3. Local interfaces e enums

Com a segunda *preview* de *Records* ([JEP 384](https://openjdk.java.net/jeps/384)) assomado no Java 15, a possibilidade de criar estruturas no escopo local de um método virou realidade. Além das *records*, agora podemos declarar classes, *enums* e interfaces dentro do escopo de métodos também!

```java
  public List<TV> getTop5ExpensiveTV(final List<TV> tvs) {

    enum Price {EXPENSIVE, CHEAP}

    record TVPrice(TV tv, Double amount) { 
      
      Price price() {
        return amount > 4_000 ? Price.EXPENSIVE : Price.CHEAP;
      }
    }

    return tvs.stream()
        .map(tv -> new TVPrice(tv, calculateAmount(tv)))
        .sorted(Comparator.comparing(TVPrice::price))
        .map(TVPrice::tv)
        .limit(5)
        .collect(Collectors.toList());
  }
```

O exemplo acima mostra uma forma de usufruir de estruturas locais. Foi utilizado *local* `record` e `enum` para fazer um filtro em uma lista.

## 5. What’s next?

Existem outras *features* de melhoria de performance e reimplementações de estruturas, não hesite em ler o [*release notes* completo](https://openjdk.java.net/projects/jdk/15/).

## 4. Referências

- [JDK 15](https://openjdk.java.net/projects/jdk/15/)
- [Java 15 and IntelliJ IDEA](https://blog.jetbrains.com/idea/2020/09/java-15-and-intellij-idea/)
- [Kotlin docs](https://kotlinlang.org/docs/reference/control-flow.html#when-expression)