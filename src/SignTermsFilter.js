import * as React from "react";
import * as PropTypes from "prop-types";

import {
	SearchkitComponent,
	SearchkitComponentProps,
	CheckboxFilterAccessor,
	ReactComponentType,
	renderComponent,
	Panel,
	FacetFilterPropTypes,
	CheckboxItemList,
	FacetAccessor, ISizeOption,
	FastClick, FieldOptions
} from "searchkit"

const defaults = require("lodash/defaults")
const identity = require("lodash/identity")
const max = require("lodash/max")
const map = require("lodash/map")
const maxBy = require("lodash/maxBy")
const get = require("lodash/get")


export class SignTermsFilter extends SearchkitComponent {

	static propTypes = FacetFilterPropTypes

	static defaultProps = {
		listComponent: CheckboxItemList,
		containerComponent: Panel,
		size: 50,
		collapsable: false,
		showCount: true,
		showMore: true,
		bucketsTransform: identity
	}

	constructor(props) {
		super(props)
		this.toggleViewMoreOption = this.toggleViewMoreOption.bind(this)
	}
	getAccessorOptions() {
		const {
		field, id, operator, title, include, exclude,
			size, translations, orderKey, orderDirection, fieldOptions
	  } = this.props
		return {
			id, operator, title, size, include, exclude, field,
			translations, orderKey, orderDirection, fieldOptions
		}
	}
	defineAccessor() {
		return new FacetAccessor(
			this.props.field, this.getAccessorOptions())
	}

	defineBEMBlocks() {
		var blockName = this.props.mod || "sk-refinement-list"
		return {
			container: blockName,
			option: `${blockName}-option`
		}
	}

	componentDidUpdate(prevProps) {
		if (prevProps.operator != this.props.operator) {
			this.accessor.options.operator = this.props.operator
			this.searchkit.performSearch()
		}
	}

	toggleFilter(key) {
		this.accessor.state = this.accessor.state.toggle(key)
		this.searchkit.performSearch()
	}

	setFilters(keys) {
		this.accessor.state = this.accessor.state.setValue(keys)
		this.searchkit.performSearch()
	}

	toggleViewMoreOption(option) {
		this.accessor.setViewMoreOption(option);
		this.searchkit.performSearch()
	}

	hasOptions() {
		return this.accessor.getBuckets().length != 0
	}

	getSelectedItems() {
		return this.accessor.state.getValue()
	}

	getItems() {
		return this.props.bucketsTransform(this.accessor.getBuckets())
	}

	render() {
		const { listComponent, containerComponent, showCount, title, id, countFormatter } = this.props
		return renderComponent(containerComponent, {
			title,
			className: id ? `filter--${id}` : undefined,
			disabled: !this.hasOptions()
		}, [
				renderComponent(listComponent, {
					key: "listComponent",
					items: this.getItems(),
					itemComponent: this.props.itemComponent,
					selectedItems: this.getSelectedItems(),
					toggleItem: this.toggleFilter.bind(this),
					setItems: this.setFilters.bind(this),
					docCount: this.accessor.getDocCount(),
					showCount,
					translate: this.translate,
					countFormatter
				}),
				this.renderShowMore()
			]);
	}

	renderShowMore() {
		const option = this.accessor.getMoreSizeOption()

		if (!option || !this.props.showMore) {
			return null;
		}

		return (
			<FastClick handler={() => this.toggleViewMoreOption(option)} key="showMore">
				<div data-qa="show-more" className={this.bemBlocks.container("view-more-action")}>
					{this.translate(option.label)}
				</div>
			</FastClick>
		)
	}
}
