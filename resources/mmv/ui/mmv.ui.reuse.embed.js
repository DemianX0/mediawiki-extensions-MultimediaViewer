/*
 * This file is part of the MediaWiki extension MultimediaViewer.
 *
 * MultimediaViewer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * MultimediaViewer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MultimediaViewer.  If not, see <http://www.gnu.org/licenses/>.
 */

( function ( mw, $, oo ) {
	// Shortcut for prototype later
	var EP;

	/**
	 * UI component that provides the user html/wikitext snippets needed to share
	 * and/or embed a media asset.
	 *
	 * @class mw.mmv.ui.reuse.Embed
	 * @extends mw.mmv.ui.reuse.Tab
	 * @constructor
	 * @param {jQuery} $container
	 */
	function Embed( $container ) {
		Embed.super.call( this, $container );

		/**
		 * Formatter converting image data into formats needed for output
		 * @property {mw.mmv.EmbedFileFormatter}
		 */
		this.formatter = new mw.mmv.EmbedFileFormatter();

		/** @property {mw.mmv.ui.reuse.Utils} utils - */
		this.utils = new mw.mmv.ui.reuse.Utils();

		/**
		 * Indicates whether or not the default option has been reset for both size menus.
		 * @property {boolean}
		 */
		this.isSizeMenuDefaultReset = false;

		this.$pane.addClass( 'mw-mmv-embed-pane' );

		this.$pane.appendTo( this.$container );

		this.createSnippetTextAreas( this.$pane );

		this.$explanation = $( '<div>' )
			.addClass( 'mw-mmv-shareembed-explanation mw-mmv-embed-explanation' )
			.text( mw.message( 'multimediaviewer-embed-explanation' ).text() )
			.appendTo( this.$pane );

		this.createSnippetSelectionButtons( this.$pane );
		this.createSizePulldownMenus( this.$pane );

		/**
		 * Currently selected embed snippet, defaults to wikitext.
		 * @property {jQuery}
		 */
		this.$currentMainEmbedText = this.embedTextWikitext.$element;

		/**
		 * Default item for the html size menu.
		 * @property {OO.ui.MenuItemWidget}
		 */
		this.defaultHtmlItem = this.embedSizeSwitchHtml.getMenu().getSelectedItem();

		/**
		 * Default item for the wikitext size menu.
		 * @property {OO.ui.MenuItemWidget}
		 */
		this.defaultWikitextItem = this.embedSizeSwitchWikitext.getMenu().getSelectedItem();

		/**
		 * Currently selected size menu.
		 * @property {OO.ui.MenuWidget}
		 */
		this.currentSizeMenu = this.embedSizeSwitchWikitext.getMenu();

		/**
		 * Current default item.
		 * @property {OO.ui.MenuItemWidget}
		 */
		this.currentDefaultItem = this.defaultWikitextItem;

	}
	oo.inheritClass( Embed, mw.mmv.ui.reuse.Tab );
	EP = Embed.prototype;

	/** @property {number} Width threshold at which an image is to be considered "large" */
	EP.LARGE_IMAGE_WIDTH_THRESHOLD = 1200;

	/** @property {number} Height threshold at which an image is to be considered "large" */
	EP.LARGE_IMAGE_HEIGHT_THRESHOLD = 900;


	/**
	 * Creates text areas for html and wikitext snippets.
	 *
	 * @param {jQuery} $container
	 */
	EP.createSnippetTextAreas = function( $container ) {
		this.embedTextHtml = new oo.ui.TextInputWidget( {
			classes: [ 'mw-mmv-embed-text-html' ],
			multiline: true,
			readOnly: true
		} );

		this.embedTextHtml.$element.find( 'textarea' )
			.prop( 'placeholder', mw.message( 'multimediaviewer-reuse-loading-placeholder' ).text() );

		this.embedTextWikitext = new oo.ui.TextInputWidget( {
			classes: [ 'mw-mmv-embed-text-wikitext', 'active' ],
			multiline: true,
			readOnly: true
		} );

		this.embedTextWikitext.$element.find( 'textarea' )
			.prop( 'placeholder', mw.message( 'multimediaviewer-reuse-loading-placeholder' ).text() );

		$( '<p>' )
			.append(
				this.embedTextHtml.$element,
				this.embedTextWikitext.$element
			)
			.appendTo( $container );
	};

	/**
	 * Creates snippet selection buttons.
	 *
	 * @param {jQuery} $container
	 */
	EP.createSnippetSelectionButtons = function( $container ) {
		var wikitextButtonOption,
			htmlButtonOption;
		this.embedSwitch = new oo.ui.ButtonSelectWidget( {
			classes: [ 'mw-mmv-embed-select' ]
		} );

		wikitextButtonOption = new oo.ui.ButtonOptionWidget( 'wikitext', {
				label: mw.message( 'multimediaviewer-embed-wt' ).text()
			} );
		htmlButtonOption = new oo.ui.ButtonOptionWidget( 'html', {
				label: mw.message( 'multimediaviewer-embed-html' ).text()
			} );

		this.embedSwitch.addItems( [
			wikitextButtonOption,
			htmlButtonOption
		] );

		$( '<p>' )
			.append( this.embedSwitch.$element )
			.appendTo( $container );

		this.embedSwitch.selectItem( wikitextButtonOption );
	};

	/**
	 * Creates pulldown menus to select file sizes.
	 *
	 * @param {jQuery} $container
	 */
	EP.createSizePulldownMenus = function( $container ) {
		// Wikitext sizes pulldown menu
		this.embedSizeSwitchWikitext = this.utils.createPulldownMenu(
			[ 'default', 'small', 'medium', 'large' ],
			[ 'mw-mmv-embed-size', 'active' ],
			'default'
		);

		// Html sizes pulldown menu
		this.embedSizeSwitchHtml = this.utils.createPulldownMenu(
			[ 'small', 'medium', 'large', 'original' ],
			[ 'mw-mmv-embed-size' ],
			'original'
		);

		$( '<p>' )
			.append(
				this.embedSizeSwitchHtml.$element,
				this.embedSizeSwitchWikitext.$element
			)
			.appendTo( $container );
	};

	/**
	 * Registers listeners.
	 */
	EP.attach = function() {
		var embed = this,
			$htmlTextarea = this.embedTextHtml.$element.find( 'textarea' ),
			$wikitextTextarea = this.embedTextWikitext.$element.find( 'textarea' );

		// Select all text once element gets focus
		this.embedTextHtml.onDOMEvent( 'focus', $.proxy( this.selectAllOnEvent, $htmlTextarea ) );
		this.embedTextWikitext.onDOMEvent( 'focus', $.proxy( this.selectAllOnEvent, $wikitextTextarea ) );
		// Disable partial text selection inside the textboxes
		this.embedTextHtml.onDOMEvent( 'mousedown click', $.proxy( this.onlyFocus, $htmlTextarea ) );
		this.embedTextWikitext.onDOMEvent( 'mousedown click', $.proxy( this.onlyFocus, $wikitextTextarea ) );

		// Register handler for switching between wikitext/html snippets
		this.embedSwitch.on( 'select', $.proxy( embed.handleTypeSwitch, embed ) );

		// Register handlers for switching between file sizes
		this.embedSizeSwitchHtml.getMenu().on( 'choose', $.proxy( this.handleSizeSwitch, this ) );
		this.embedSizeSwitchWikitext.getMenu().on( 'choose', $.proxy( this.handleSizeSwitch, this ) );
	};

	/**
	 * Clears listeners.
	 */
	EP.unattach = function() {
		this.constructor.super.prototype.unattach.call( this );

		this.embedTextHtml.offDOMEvent( 'focus mousedown click' );
		this.embedTextWikitext.offDOMEvent( 'focus mousedown click' );
		this.embedSwitch.off( 'select' );
		this.embedSizeSwitchHtml.getMenu().off( 'choose' );
		this.embedSizeSwitchWikitext.getMenu().off( 'choose' );
	};

	/**
	 * Handles size menu change events.
	 *
	 * @param {OO.ui.MenuItemWidget} item
	 */
	EP.handleSizeSwitch = function ( item ) {
		var value = item.getData();

		this.changeSize( value.width, value.height );
	};

	/**
	 * Handles snippet type switch.
	 *
	 * @param {OO.ui.MenuItemWidget} item
	 */
	EP.handleTypeSwitch = function ( item ) {
		var value = item.getData();

		if ( value === 'html' ) {
			this.$currentMainEmbedText = this.embedTextHtml.$element;
			this.embedSizeSwitchWikitext.getMenu().hide();

			this.currentSizeMenu = this.embedSizeSwitchHtml.getMenu();
			this.currentDefaultItem = this.defaultHtmlItem;
		} else if ( value === 'wikitext' ) {
			this.$currentMainEmbedText = this.embedTextWikitext.$element;
			this.embedSizeSwitchHtml.getMenu().hide();

			this.currentSizeMenu = this.embedSizeSwitchWikitext.getMenu();
			this.currentDefaultItem = this.defaultWikitextItem;
		}

		this.embedTextHtml.$element
			.add( this.embedSizeSwitchHtml.$element )
			.toggleClass( 'active', value === 'html' );

		this.embedTextWikitext.$element
			.add( this.embedSizeSwitchWikitext.$element )
			.toggleClass( 'active', value === 'wikitext' );

		// Reset current selection to default when switching the first time
		if ( ! this.isSizeMenuDefaultReset ) {
			this.resetCurrentSizeMenuToDefault();
			this.isSizeMenuDefaultReset = true;
		}

		this.select();
	};

	/**
	 * Reset current menu selection to default item.
	 */
	EP.resetCurrentSizeMenuToDefault = function () {
		this.currentSizeMenu.chooseItem( this.currentDefaultItem );
		// Force select logic to update the selected item bar, otherwise we end up
		// with the wrong label. This is implementation dependent and maybe it should
		// be done via a to flag to OO.ui.SelectWidget.prototype.chooseItem()?
		this.currentSizeMenu.emit( 'select', this.currentDefaultItem );
	};

	/**
	 * Changes the size, takes different actions based on which sort of
	 * embed is currently chosen.
	 *
	 * @param {number} width New width to set
	 * @param {number} height New height to set
	 */
	EP.changeSize = function ( width, height ) {
		var currentItem = this.embedSwitch.getSelectedItem();

		if ( currentItem === null ) {
			return;
		}

		switch ( currentItem.getData() ) {
			case 'html':
				this.updateEmbedHtml( {}, width, height );
				break;
			case 'wikitext':
				this.updateEmbedWikitext( width );
				break;
		}

		this.select();
	};

	/**
	 * Sets the HTML embed text.
	 *
	 * Assumes that the set() method has already been called to update this.embedFileInfo
	 * @param {mw.mmv.model.Thumbnail} thumbnail (can be just an empty object)
	 * @param {number} width New width to set
	 * @param {number} height New height to set
	 */
	EP.updateEmbedHtml = function ( thumbnail, width, height ) {
		var src;

		if ( !this.embedFileInfo ) {
			return;
		}

		src = thumbnail.url || this.embedFileInfo.imageInfo.url;

		// If the image dimension requested are "large", use the current image url
		if ( width > EP.LARGE_IMAGE_WIDTH_THRESHOLD || height > EP.LARGE_IMAGE_HEIGHT_THRESHOLD ) {
			src = this.embedFileInfo.imageInfo.url;
		}

		this.embedTextHtml.setValue(
			this.formatter.getThumbnailHtml( this.embedFileInfo, src, width, height ) );
	};

	/**
	 * Updates the wikitext embed text with a new value for width.
	 *
	 * Assumes that the set method has already been called.
	 * @param {number} width
	 */
	EP.updateEmbedWikitext = function ( width ) {
		if ( !this.embedFileInfo ) {
			return;
		}

		this.embedTextWikitext.setValue(
			this.formatter.getThumbnailWikitextFromEmbedFileInfo( this.embedFileInfo, width )
		);
	};

	/**
	 * Shows the pane.
	 */
	EP.show = function () {
		this.constructor.super.prototype.show.call( this );
		this.select();
	};

	/**
	 * Gets size options for html and wikitext snippets.
	 *
	 * @param {number} width
	 * @param {number} height
	 * @returns {Object}
	 * @returns {Object} return.html Collection of possible image sizes for html snippets
	 * @returns {Object} return.wikitext Collection of possible image sizes for wikitext snippets
	 */
	EP.getSizeOptions = function ( width, height ) {
		var sizes = {};

		sizes.html = this.utils.getPossibleImageSizesForHtml( width, height );
		sizes.wikitext = this.getPossibleImageSizesForWikitext( width, height );

		return sizes;
	};

	/**
	 * Sets the data on the element.
	 *
	 * @param {mw.mmv.model.Image} image
	 * @param {mw.mmv.model.Repo} repo
	 * @param {string} caption
	 */
	EP.set = function ( image, repo, caption ) {
		var embed = this,
			htmlSizeSwitch = this.embedSizeSwitchHtml.getMenu(),
			htmlSizeOptions = htmlSizeSwitch.getItems(),
			wikitextSizeSwitch = this.embedSizeSwitchWikitext.getMenu(),
			wikitextSizeOptions = wikitextSizeSwitch.getItems(),
			sizes = this.getSizeOptions( image.width, image.height );

		this.embedFileInfo = new mw.mmv.model.EmbedFileInfo( image, repo, caption );

		this.utils.updateMenuOptions( sizes.html, htmlSizeOptions );
		this.utils.updateMenuOptions( sizes.wikitext, wikitextSizeOptions );

		// Reset defaults
		this.isSizeMenuDefaultReset = false;
		this.resetCurrentSizeMenuToDefault();

		this.utils.getThumbnailUrlPromise( this.LARGE_IMAGE_WIDTH_THRESHOLD )
			.done( function ( thumbnail ) {
				embed.updateEmbedHtml( thumbnail );
				embed.select();
			} );
	};

	/**
	 * @inheritdoc
	 */
	EP.empty = function () {
		this.embedTextHtml.setValue( '' );
		this.embedTextWikitext.setValue( '' );

		this.embedSizeSwitchHtml.getMenu().hide();
		this.embedSizeSwitchWikitext.getMenu().hide();
	};

	/**
	 * Selects the text in the current textbox by triggering a focus event.
	 */
	EP.select = function () {
		this.$currentMainEmbedText.focus();
	};

	/**
	 * Calculates possible image sizes for wikitext snippets. It returns up to
	 * three possible snippet frame sizes (small, medium, large).
	 *
	 * @param {number} width
	 * @param {number} height
	 * @returns {Object}
	 * @returns { {width: number, height: number} } return.small
	 * @returns { {width: number, height: number} } return.medium
	 * @returns { {width: number, height: number} } return.large
	 */
	EP.getPossibleImageSizesForWikitext = function ( width, height ) {
		var i, bucketName,
			bucketWidth,
			buckets = {
				'small': 300,
				'medium': 400,
				'large': 500
			},
			sizes = {},
			bucketNames = Object.keys( buckets ),
			widthToHeight = height / width;

		for ( i = 0; i < bucketNames.length; i++ ) {
			bucketName = bucketNames[i];
			bucketWidth = buckets[bucketName];

			if ( width > bucketWidth ) {
				sizes[bucketName] = {
					width: bucketWidth,
					height: Math.round( bucketWidth * widthToHeight )
				};
			}
		}

		sizes['default'] = { width: null, height: null };

		return sizes;
	};


	mw.mmv.ui.reuse.Embed = Embed;
}( mediaWiki, jQuery, OO ) );
