# searchkit-signterms

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

searchkit-signterms are searchkit Filters which use the significant_terms aggregations instead of the terms aggregation. 

[build-badge]: https://img.shields.io/travis/user/repo/master.png?style=flat-square
[build]: https://travis-ci.org/user/repo

[npm-badge]: https://img.shields.io/npm/v/npm-package.png?style=flat-square
[npm]: https://www.npmjs.org/package/npm-package

[coveralls-badge]: https://img.shields.io/coveralls/user/repo/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/user/repo

# Build searchkit-signterms

> nwb build

# Publish to npm registry

> npm publish

# Use searchkit-signterms

Here the first aggregation on `meta.subject` will be a normal terms aggregation and the second `meta.text` is a `significant_terms` aggregation operating within the scope of the first filter. Internally the second aggregation is implemented using the `SignificantTermsBucket` provided by `searchkit`.

```javascript
import { SignTermsFilter } from 'searchkit-signterms'
<SignTermsFilter
    id="subjectSignTerms"
    title="Stichwörter"
    label="SignTerms"
    fields={["meta.subject", "meta.text"]}
    size={10} />
```

```javascript
import { SignRefinementListFilter } from 'searchkit-signterms'
<SignRefinementListFilter
    id="title.words"
    title="Stichwörter"
    field="meta.title"
    operator="OR" 
    size={10} />
```
