import type {IsAny} from './is-any';

/**
An if-else-like type that resolves depending on whether the given type is `any`.

@see {@link IsAny}

@example
```
import type {IfAny} from 'type-fest';

type ShouldBeTrue = IfAny<any>;
//=> true

type ShouldBeBar = IfAny<'not any', 'foo', 'bar'>;
//=> 'bar'
```

@group type-fest
*/
export type IfAny<T, TypeIfAny = true, TypeIfNotAny = false> = (
	IsAny<T> extends true ? TypeIfAny : TypeIfNotAny
);
