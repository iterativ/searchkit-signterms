import {
    State,
    LevelState,
    TermQuery,
    TermsBucket,
    FilterBucket,
    SignificantTermsBucket,
    BoolShould,
    BoolMust
} from "searchkit"

import { AccessorBase } from "./AccessorBase"

import { map } from "lodash"
import { each } from "lodash"
import { compact } from "lodash"
import { take } from "lodash"
import { omitBy } from "lodash"
import { isUndefined } from "lodash"

// export interface HierarchicalFacetAccessorOptions {
//     fields: Array<string>
//     size: number
//     id: string
//     title: string
//     orderKey?: string
//     orderDirection?: string
// }

export class SignTermsAccessor extends AccessorBase {
    state = new LevelState()

    constructor(key, options /*HierarchicalFacetAccessorOptions*/) {
        super(key)
        this.options = options
        this.computeUuids()
    }

    computeUuids() {
        this.uuids = map(
            this.options.fields, field => this.uuid + field)
    }

    onResetFilters() {
        this.resetState()
    }

    getBuckets(level) {
        var field = this.options.fields[level]
        // var aggs = this.getAggregations([this.options.id, "buckets"], [])
        var aggs = this.getAggregations([this.options.id, field, field, "buckets"], [])
        return aggs
    }

    getOrder() {
        if (this.options.orderKey) {
            let orderDirection = this.options.orderDirection || "asc"
            return { [this.options.orderKey]: orderDirection }
        }
    }

    buildSharedQuery(query) {

        each(this.options.fields, (field, i) => {
            var filters = this.state.getLevel(i);
            var parentFilter = this.state.getLevel(i - 1);
            var isLeaf = !this.state.levelHasFilters(i + 1)
            var filterTerms = map(filters, TermQuery.bind(null, field))

            if (filterTerms.length > 0) {
                query = query.addFilter(
                    this.uuids[i],
                    (filterTerms.length > 1) ?
                        BoolShould(filterTerms) : filterTerms[0])
            }

            if (isLeaf) {
                var selectedFilters = map(filters, (filter) => {
                    return {
                        id: this.options.id,
                        name: this.translate(parentFilter[0]) || this.options.title || this.translate(field),
                        value: this.translate(filter),
                        remove: () => {
                            this.state = this.state.remove(i, filter)
                        }
                    }
                })
                query = query.addSelectedFilters(selectedFilters)
            }

        })

        console.log("Build Shared Query")
        query.printJSON()
        return query
    }

    buildOwnQuery(query) {

        var filters = this.state.getValue()
        var field = this.options.fields[0]

        let lvlAggs = compact(map(this.options.fields, (field, i) => {
            if (this.state.levelHasFilters(i - 1) || i == 0) {
                if (i == 0) {
                    var bucketType = TermsBucket
                } else if (i == 1) {
                    var bucketType = SignificantTermsBucket
                }
                return FilterBucket(
                    field,
                    query.getFiltersWithKeys(take(this.uuids, i)),
                    bucketType(field, field, omitBy({
                        size: this.options.size, order: this.getOrder()
                    }, isUndefined))
                )    
            }
        }));

        // var aggs = FilterBucket(
        //     this.options.id,
        //     query.getFiltersWithoutKeys(this.uuids),
        //     ...lvlAggs
        // )

        // export function TermsBucket(key, field, options: TermsBucketOptions = {}, ...childAggs) {
        //     return AggsContainer(key, {
        //         terms: assign({ field }, options)
        //     }, childAggs)
        // }

        // export function SignificantTermsBucket(key, field, options={}, ...childAggs){
        //     return AggsContainer(key, {significant_terms:assign({field}, options)}, childAggs)
        // }

        var aggs = FilterBucket(
            this.options.id,
            query.getFiltersWithoutKeys(this.uuids),
            ...lvlAggs
        )

        // var aggs = TermsBucket(
        //     this.options.id,
        //     "meta.subject",
        //     {},
        //     SignificantTermsBucket(
        //         this.options.id,
        //         "meta.text"
        //     )
        // )

        console.log("Build Own Query")
        query.printJSON()
        var queryAfterAggs = query.setAggs(aggs)
        console.log("Build Aggs Query")
        queryAfterAggs.printJSON()
        return queryAfterAggs
    }

}
