import * as React from "react";
import * as PropTypes from "prop-types";

import {
	SearchkitComponent,
	SearchkitComponentProps,
	NestedFacetAccessor,
	FacetAccessor, 
	HierarchicalFacetAccessor,
	ReactComponentType,
	renderComponent,
	Panel,
	FacetFilterPropTypes,
	CheckboxItemList,
	ISizeOption,
	FastClick, 
	FieldOptions
} from "searchkit"

import { SignTermsAccessor } from "./SignTermsAccessor"

const defaults = require("lodash/defaults")
const identity = require("lodash/identity")
const max = require("lodash/max")
const map = require("lodash/map")
const maxBy = require("lodash/maxBy")
const get = require("lodash/get")


export class SignTermsFilter extends SearchkitComponent {

	static defaultProps = {
		countFormatter: identity,
		size: 20
	}
	static propTypes = defaults({
		id: PropTypes.string.isRequired,
		fields: PropTypes.arrayOf(PropTypes.string).isRequired,
		title: PropTypes.string.isRequired,
		orderKey: PropTypes.string,
		orderDirection: PropTypes.oneOf(["asc", "desc"]),
		countFormatter: PropTypes.func
	}, SearchkitComponent.propTypes)

	defineBEMBlocks() {
		var blockClass = this.props.mod || "sk-hierarchical-menu";
		return {
			container: `${blockClass}-list`,
			option: `${blockClass}-option`
		};
	}

	defineAccessor() {
		const { id, title, fields, size, orderKey, orderDirection } = this.props
		return new SignTermsAccessor(id, {
			id, title, fields, size, orderKey, orderDirection
		})
	}

	addFilter(option, level) {
		this.accessor.state = this.accessor.state.toggleLevel(level, option.key)
		this.searchkit.performSearch()
	}

	renderOption(level, option) {
		var block = this.bemBlocks.option
		const { countFormatter } = this.props
		var className = block().state({
			selected: this.accessor.state.contains(level, option.key)
		})

		return (
			<div key={option.key}>
				<FastClick handler={this.addFilter.bind(this, option, level)}>
					<div className={className}>
						<div className={block("text")}>{this.translate(option.key)}</div>
						<div className={block("count")}>{countFormatter(option.doc_count)}</div>
					</div>
				</FastClick>
				{(() => {
					if (this.accessor.resultsState.contains(level, option.key)) {
						return this.renderOptions(level + 1);
					}
				})()}
			</div>
		)
	}

	renderOptions(level) {
		let block = this.bemBlocks.container;
		return (
			<div className={block("hierarchical-options")}>
				{map(this.accessor.getBuckets(level), this.renderOption.bind(this, level))}
			</div>
		)
	}

	render() {
		let block = this.bemBlocks.container;
		let classname = block()
			.mix(`filter--${this.props.id}`)
			.state({
				disabled: this.accessor.getBuckets(0).length == 0
			})
		return (
			<div className={classname}>
				<div className={block("header")}>{this.props.title}</div>
				<div className={block("root")}>
					{this.renderOptions(0)}
				</div>
			</div>
		)
	}

}
