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

( function ( mw, $, oo, MLBLightbox ) {
	/**
	 * @class mw.MultiLightbox
	 * @extends mlb.MultiLightbox
	 * @inheritdoc
	 * @constructor
	 * @param {number} initial
	 * @param {Function} InterfaceClass type of interface to use
	 * @param {mw.MultimediaViewer} viewer
	 */
	function MultiLightbox( initial, InterfaceClass, viewer ) {
		this.initializeInterface = function ( InterfaceClass ) {
			InterfaceClass = InterfaceClass || window.LightboxInterface;
			this.iface = new InterfaceClass( viewer );
		};

		MLBLightbox.call( this, initial, InterfaceClass );
	}

	oo.inheritClass( MultiLightbox, MLBLightbox );

	mw.MultiLightbox = MultiLightbox;
}( mediaWiki, jQuery, OO, window.MultiLightbox ) );