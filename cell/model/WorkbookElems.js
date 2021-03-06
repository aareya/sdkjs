﻿/*
 * (c) Copyright Ascensio System SIA 2010-2017
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

"use strict";

(function(window, undefined){

// Import
var CellValueType = AscCommon.CellValueType;
var c_oAscBorderWidth = AscCommon.c_oAscBorderWidth;
var c_oAscBorderStyles = AscCommon.c_oAscBorderStyles;
var FormulaTablePartInfo = AscCommon.FormulaTablePartInfo;
var cBoolLocal = AscCommon.cBoolLocal;
var cErrorOrigin = AscCommon.cErrorOrigin;
var cErrorLocal = AscCommon.cErrorLocal;
var parserHelp = AscCommon.parserHelp;
var oNumFormatCache = AscCommon.oNumFormatCache;
var gc_nMaxDigCountView = AscCommon.gc_nMaxDigCountView;
var gc_nMaxRow0 = AscCommon.gc_nMaxRow0;
var gc_nMaxCol0 = AscCommon.gc_nMaxCol0;
	var History = AscCommon.History;

var UndoRedoDataTypes = AscCommonExcel.UndoRedoDataTypes;
var UndoRedoData_CellSimpleData = AscCommonExcel.UndoRedoData_CellSimpleData;
var UndoRedoData_IndexSimpleProp = AscCommonExcel.UndoRedoData_IndexSimpleProp;

var c_oAscCustomAutoFilter = Asc.c_oAscCustomAutoFilter;
var c_oAscAutoFilterTypes = Asc.c_oAscAutoFilterTypes;
var c_oAscNumFormatType = Asc.c_oAscNumFormatType;

var g_oColorManager = null;
	
var g_nHSLMaxValue = 255;
var g_nColorTextDefault = 1;
var g_nColorHyperlink = 10;
var g_nColorHyperlinkVisited = 11;

var g_oThemeColorsDefaultModsSpreadsheet = [
    [0, -4.9989318521683403E-2, -0.14999847407452621, -0.249977111117893, -0.34998626667073579, -0.499984740745262],
    [0, -9.9978637043366805E-2, -0.249977111117893, -0.499984740745262, -0.749992370372631, -0.89999084444715716],
    [0, 0.79998168889431442, 0.59999389629810485, 0.39997558519241921, -0.249977111117893, -0.499984740745262],
    [0, 0.89999084444715716, 0.749992370372631, 0.499984740745262, 0.249977111117893, 9.9978637043366805E-2],
    [0, 0.499984740745262, 0.34998626667073579, 0.249977111117893, 0.14999847407452621, 4.9989318521683403E-2]];

var map_themeExcel_to_themePresentation = {
	0: 12,
	1: 8,
	2: 13,
	3: 9,
	4: 0,
	5: 1,
	6: 2,
	7: 3,
	8: 4,
	9: 5,
	10: 11,
	11: 10
};
function shiftGetBBox(bbox, bHor)
{
	var bboxGet = null;
	if(bHor)
		bboxGet = Asc.Range(bbox.c1, bbox.r1, gc_nMaxCol0, bbox.r2);
	else
		bboxGet = Asc.Range(bbox.c1, bbox.r1, bbox.c2, gc_nMaxRow0);
	return bboxGet;
}
function shiftSort(a, b, offset)
{
	var nRes = 0;
	if(null == a.to || null == b.to)
	{
		if(null == a.to && null == b.to)
			nRes = 0;
		else if(null == a.to)
			nRes = -1;
		else if(null == b.to)
			nRes = 1;
	}
	else
	{
	    if (0 != offset.offsetRow) {
	        if (offset.offsetRow > 0)
	            nRes = b.to.r1 - a.to.r1;
	        else
	            nRes = a.to.r1 - b.to.r1;
	    }
	    if (0 == nRes && 0 != offset.offsetCol) {
	        if (offset.offsetCol > 0)
	            nRes = b.to.c1 - a.to.c1;
	        else
	            nRes = a.to.c1 - b.to.c1;
	    }
	}
	return nRes;
}
function createRgbColor(r, g, b) {
	return new RgbColor((r << 16) + (g << 8) + b);
}
var g_oRgbColorProperties = {
		rgb : 0
	};
function RgbColor(rgb)
{
	this.Properties = g_oRgbColorProperties;
	this.rgb = rgb;
}
RgbColor.prototype =
{
	clone : function()
	{
		return new RgbColor(this.rgb);
	},
	getType : function()
	{
		return UndoRedoDataTypes.RgbColor;
	},
	getProperties : function()
	{
		return this.Properties;
	},

    isEqual: function(oColor)
    {
        if(!oColor){
            return false;
        }
        if(this.rgb !== oColor.rgb){
            return false;
        }
        return true;
    },

	getProperty : function(nType)
	{
		switch(nType)
		{
		case this.Properties.rgb:return this.rgb;break;
		}
	},
	setProperty : function(nType, value)
	{
		switch(nType)
		{
		case this.Properties.rgb: this.rgb = value;break;
		}
	},
	Write_ToBinary2 : function(oBinaryWriter)
	{
		oBinaryWriter.WriteLong(this.rgb);
	},
	Read_FromBinary2 : function(oBinaryReader)
	{
		this.rgb = oBinaryReader.GetULongLE();
	},
	getRgb : function()
	{
		return this.rgb;
	},
	getR : function()
	{
		return (this.rgb >> 16) & 0xff;
	},
	getG : function()
	{
		return (this.rgb >> 8) & 0xff;
	},
	getB : function()
	{
		return this.rgb & 0xff;
	},
	getA : function () {
		return 1;
	}
};
var g_oThemeColorProperties = {
		rgb: 0,
		theme: 1,
		tint: 2
	};
function ThemeColor()
{
	this.rgb = null;
	this.theme = null;
	this.tint = null;
}
ThemeColor.prototype =
{
	Properties: g_oThemeColorProperties,
	clone : function()
	{
		//ThemeColor must be created by g_oColorManager for correct rebuild
		//no need getThemeColor because it return same object
		return this;
	},
	getType : function()
	{
		return UndoRedoDataTypes.ThemeColor;
	},
	getProperties : function()
	{
		return this.Properties;
	},
	getProperty : function(nType)
	{
		switch(nType)
		{
		case this.Properties.rgb:return this.rgb;break;
		case this.Properties.theme:return this.theme;break;
		case this.Properties.tint:return this.tint;break;
		}
	},
	setProperty : function(nType, value)
	{
		switch(nType)
		{
		case this.Properties.rgb: this.rgb = value;break;
		case this.Properties.theme: this.theme= value;break;
		case this.Properties.tint: this.tint = value;break;
		}
	},
    isEqual: function(oColor)
    {
        if(!oColor){
            return false;
        }
        if(this.theme !== oColor.theme){
            return false;
        }
        if(!AscFormat.fApproxEqual(this.tint, oColor.tint)){
            return false;
        }
        return true;
    },
	Write_ToBinary2 : function(oBinaryWriter)
	{
		oBinaryWriter.WriteByte(this.theme);
		if(null != this.tint)
		{
			oBinaryWriter.WriteByte(true);
			oBinaryWriter.WriteDouble2(this.tint);
		}
		else
		{
			oBinaryWriter.WriteBool(false);
		}
	},
	Read_FromBinary2AndReplace : function(oBinaryReader)
	{
		this.theme = oBinaryReader.GetUChar();
		var bTint = oBinaryReader.GetBool();
		if(bTint)
			this.tint = oBinaryReader.GetDoubleLE();
		return g_oColorManager.getThemeColor(this.theme, this.tint);
	},
	getRgb : function()
	{
		return this.rgb;
	},
	getR : function()
	{
		return (this.rgb >> 16) & 0xff;
	},
	getG : function()
	{
		return (this.rgb >> 8) & 0xff;

	},
	getB : function()
	{
		return this.rgb & 0xff;
	},
	getA : function () {
		return 1;
	},
	rebuild : function(theme)
	{
		var nRes = 0;
		var r = 0;
		var g = 0;
		var b = 0;
		if(null != this.theme && null != theme)
		{
			var oUniColor = theme.themeElements.clrScheme.colors[map_themeExcel_to_themePresentation[this.theme]];
			if(null != oUniColor)
			{
				var rgba = oUniColor.color.RGBA;
				if(null != rgba)
				{
					r = rgba.R;
					g = rgba.G;
					b = rgba.B;
				}
			}
			if(null != this.tint && 0 != this.tint)
			{
				var oCColorModifiers = new AscFormat.CColorModifiers();
				var HSL = {H: 0, S: 0, L: 0};
				oCColorModifiers.RGB2HSL(r, g, b, HSL);
				if (this.tint < 0)
					HSL.L = HSL.L * (1 + this.tint);
				else
					HSL.L = HSL.L * (1 - this.tint) + (g_nHSLMaxValue - g_nHSLMaxValue * (1 - this.tint));
				HSL.L >>= 0;
				var RGB = {R: 0, G: 0, B: 0};
				oCColorModifiers.HSL2RGB(HSL, RGB);
				r = RGB.R;
				g = RGB.G;
				b = RGB.B;
			}
			nRes |= b;
			nRes |= g << 8;
			nRes |= r << 16;
		}
		this.rgb = nRes;
	}
};
function CorrectAscColor(asc_color)
{
	if (null == asc_color)
		return null;

	var ret = null;

	var _type = asc_color.asc_getType();
	switch (_type)
	{
		case Asc.c_oAscColor.COLOR_TYPE_SCHEME:
		{
			// тут выставляется ТОЛЬКО из меню. поэтому:
			var _index = asc_color.asc_getValue() >> 0;
			var _id = (_index / 6) >> 0;
			var _pos = _index - _id * 6;
			var basecolor = g_oColorManager.getThemeColor(_id);
			var aTints = g_oThemeColorsDefaultModsSpreadsheet[AscCommon.GetDefaultColorModsIndex(basecolor.getR(), basecolor.getG(), basecolor.getB())];
			var tint = aTints[_pos];
			ret = g_oColorManager.getThemeColor(_id, tint);
			break;
		}
		default:
		{
			ret = createRgbColor(asc_color.asc_getR(), asc_color.asc_getG(), asc_color.asc_getB());
		}
	}
	return ret;
}
function ColorManager()
{
	this.theme = null;
	this.aColors = new Array(12);
}
ColorManager.prototype =
{
	isEqual : function(color1, color2)
	{
		var bRes = false;
		if(null == color1 && null == color2)
			bRes = true;
		else if(null != color1 && null != color2)
		{
			if((color1 instanceof ThemeColor && color2 instanceof ThemeColor) || (color1 instanceof RgbColor && color2 instanceof RgbColor))
				bRes =  color1.getRgb() == color2.getRgb();
		}
		return bRes;
	},
	setTheme : function(theme)
	{
		this.theme = theme;
		this.rebuildColors();
	},
	getThemeColor : function(theme, tint)
	{
		if(null == tint)
			tint = null;
		var oColorObj = this.aColors[theme];
		if(null == oColorObj)
		{
			oColorObj = {};
			this.aColors[theme] = oColorObj;
		}
		var oThemeColor = oColorObj[tint];
		if(null == oThemeColor)
		{
			oThemeColor = new ThemeColor();
			oThemeColor.theme = theme;
			oThemeColor.tint = tint;
			if(null != this.theme)
				oThemeColor.rebuild(this.theme);
			oColorObj[tint] = oThemeColor;
		}
		return oThemeColor;
	},
	rebuildColors : function()
	{
		if(null != this.theme)
		{
			for(var i = 0, length = this.aColors.length; i < length; ++i)
			{
				var oColorObj = this.aColors[i];
				for(var j in oColorObj)
				{
					var oThemeColor = oColorObj[j];
					oThemeColor.rebuild(this.theme);
				}
			}
		}
	}
};
g_oColorManager = new ColorManager();

	var g_oDefaultFormat = {
		XfId: null,
		Font: null,
		Fill: null,
		Num: null,
		Border: null,
		Align: null,
		FillAbs: null,
		NumAbs: null,
		BorderAbs: null,
		AlignAbs: null,
		ColorAuto: new RgbColor(0)
	};

	/** @constructor */
	function Fragment(val) {
		this.text = null;
		this.format = null;
		this.sFormula = null;
		this.sId = null;
		if (null != val) {
			this.set(val);
		}
	}

	Fragment.prototype.clone = function () {
		return new Fragment(this);
	};
	Fragment.prototype.set = function (oVal) {
		if (null != oVal.text) {
			this.text = oVal.text;
		}
		if (null != oVal.format) {
			this.format = oVal.format;
		}
		if (null != oVal.sFormula) {
			this.sFormula = oVal.sFormula;
		}
		if (null != oVal.sId) {
			this.sId = oVal.sId;
		}
	};

var g_oFontProperties = {
		fn: 0,
		scheme: 1,
		fs: 2,
		b: 3,
		i: 4,
		u: 5,
		s: 6,
		c: 7,
		va: 8
	};

	/** @constructor */
	function Font() {
		this.fn = null;
		this.scheme = null;
		this.fs = null;
		this.b = null;
		this.i = null;
		this.u = null;
		this.s = null;
		this.c = null;
		this.va = null;
		this.skip = null;
		this.repeat = null;
	}
	Font.prototype.Properties = g_oFontProperties;
	Font.prototype.assign = function(font) {
		this.fn = font.fn;
		this.scheme = font.scheme;
		this.fs = font.fs;
		this.b = font.b;
		this.i = font.i;
		this.u = font.u;
		this.s = font.s;
		this.c = font.c;
		this.va = font.va;
		this.skip = font.skip;
		this.repeat = font.repeat;
	};
	Font.prototype.assignFromObject = function(font) {
		if (null != font.fn) {
			this.setName(font.fn);
		}
		if (null != font.scheme) {
			this.setScheme(font.scheme);
		}
		if (null != font.fs) {
			this.setSize(font.fs);
		}
		if (null != font.b) {
			this.setBold(font.b);
		}
		if (null != font.i) {
			this.setItalic(font.i);
		}
		if (null != font.u) {
			this.setUnderline(font.u);
		}
		if (null != font.s) {
			this.setStrikeout(font.s);
		}
		if (null != font.c) {
			this.setColor(font.c);
		}
		if (null != font.va) {
			this.setVerticalAlign(font.va);
		}
		if (null != font.skip) {
			this.setSkip(font.skip);
		}
		if (null != font.repeat) {
			this.setRepeat(font.repeat);
		}
	};
	Font.prototype.merge = function (font, isTable) {
		var oRes = new Font();
		oRes.fn = this.fn || font.fn;
		oRes.scheme = this.scheme || font.scheme;
		oRes.fs = this.fs || font.fs;
		oRes.b = this.b || font.b;
		oRes.i = this.i || font.i;
		oRes.s = this.s || font.s;
		oRes.u = this.u || font.u;
		//заглушка excel при merge стилей игнорирует default цвет
		if (isTable && this.c && this.c.isEqual(g_oDefaultFormat.Font.c)) {
			oRes.c = font.c || this.c;
		} else {
			oRes.c = this.c || font.c;
		}
		oRes.va = this.va || font.va;
		oRes.skip = this.skip || font.skip;
		oRes.repeat = this.repeat || font.repeat;
		return oRes;
	};
	Font.prototype.getRgbOrNull = function () {
		var nRes = null;
		if (null != this.c) {
			nRes = this.c.getRgb();
		}
		return nRes;
	};
	Font.prototype.isEqual = function (font) {
		var bRes = this.fs == font.fs && this.b == font.b && this.i == font.i && this.u == font.u && this.s == font.s &&
			g_oColorManager.isEqual(this.c, font.c) && this.va == font.va && this.skip == font.skip &&
			this.repeat == font.repeat;
		if (bRes) {
			var schemeThis = this.getScheme();
			var schemeOther = font.getScheme();
			if (Asc.EFontScheme.fontschemeNone == schemeThis && Asc.EFontScheme.fontschemeNone == schemeOther) {
				bRes = this.fn == font.fn;
			} else if (Asc.EFontScheme.fontschemeNone != schemeThis &&
				Asc.EFontScheme.fontschemeNone != schemeOther) {
				bRes = schemeThis == schemeOther;
			} else {
				bRes = false;
			}
		}
		return bRes;
	};
	Font.prototype.clone = function () {
		var font = new Font();
		font.assign(this);
		return font;
	};
	Font.prototype.intersect = function (oFont, oDefVal) {
		if (this.fn != oFont.fn) {
			this.fn = oDefVal.fn;
		}
		if (this.scheme != oFont.scheme) {
			this.scheme = oDefVal.scheme;
		}
		if (this.fs != oFont.fs) {
			this.fs = oDefVal.fs;
		}
		if (this.b != oFont.b) {
			this.b = oDefVal.b;
		}
		if (this.i != oFont.i) {
			this.i = oDefVal.i;
		}
		if (this.u != oFont.u) {
			this.u = oDefVal.u;
		}
		if (this.s != oFont.s) {
			this.s = oDefVal.s;
		}
		if (false == g_oColorManager.isEqual(this.c, oFont.c)) {
			this.c = oDefVal.c;
		}
		if (this.va != oFont.va) {
			this.va = oDefVal.va;
		}
		if (this.skip != oFont.skip) {
			this.skip = oDefVal.skip;
		}
		if (this.repeat != oFont.repeat) {
			this.repeat = oDefVal.repeat;
		}
	};
	Font.prototype.getName = function () {
		return this.fn || g_oDefaultFormat.Font.fn;
	};
	Font.prototype.setName = function (val) {
		return this.fn = val;
	};
	Font.prototype.getScheme = function () {
		return this.scheme || Asc.EFontScheme.fontschemeNone;
	};
	Font.prototype.setScheme = function(val) {
		return (null != val && Asc.EFontScheme.fontschemeNone != val) ? this.scheme = val : this.scheme = null;
	};
	Font.prototype.getSize = function () {
		return this.fs || g_oDefaultFormat.Font.fs;
	};
	Font.prototype.setSize = function(val) {
		return this.fs = val;
	};
	Font.prototype.getBold = function () {
		return !!this.b;
	};
	Font.prototype.setBold = function(val) {
		return val ? this.b = true : this.b = null;
	};
	Font.prototype.getItalic = function () {
		return !!this.i;
	};
	Font.prototype.setItalic = function(val) {
		return val ? this.i = true : this.i = null;
	};
	Font.prototype.getUnderline = function () {
		return null != this.u ? this.u : Asc.EUnderline.underlineNone;
	};
	Font.prototype.setUnderline = function(val) {
		return (null != val && Asc.EUnderline.underlineNone != val) ? this.u = val : this.u = null;
	};
	Font.prototype.getStrikeout = function () {
		return !!this.s;
	};
	Font.prototype.setStrikeout = function(val) {
		return val ? this.s = true : this.s = null;
	};
	Font.prototype.getColor = function () {
		return this.c || g_oDefaultFormat.ColorAuto;
	};
	Font.prototype.setColor = function(val) {
		return this.c = val;
	};
	Font.prototype.getVerticalAlign = function () {
		return null != this.va ? this.va : AscCommon.vertalign_Baseline;
	};
	Font.prototype.setVerticalAlign = function(val) {
		return (null != val && AscCommon.vertalign_Baseline != val) ? this.va = val : this.va = null;
	};
	Font.prototype.getSkip = function () {
		return !!this.skip;
	};
	Font.prototype.setSkip = function(val) {
		return val ? this.skip = true : this.skip = null;
	};
	Font.prototype.getRepeat = function () {
		return !!this.repeat;
	};
	Font.prototype.setRepeat = function (val) {
		return val ? this.repeat = true : this.repeat = null;
	};
	Font.prototype.getType = function () {
		return UndoRedoDataTypes.StyleFont;
	};
	Font.prototype.getProperties = function () {
		return this.Properties;
	};
	Font.prototype.getProperty = function (nType) {
		switch (nType) {
			case this.Properties.fn:
				return this.fn;
				break;
			case this.Properties.scheme:
				return this.scheme;
				break;
			case this.Properties.fs:
				return this.fs;
				break;
			case this.Properties.b:
				return this.b;
				break;
			case this.Properties.i:
				return this.i;
				break;
			case this.Properties.u:
				return this.u;
				break;
			case this.Properties.s:
				return this.s;
				break;
			case this.Properties.c:
				return this.c;
				break;
			case this.Properties.va:
				return this.va;
				break;
		}
	};
	Font.prototype.setProperty = function (nType, value) {
		switch (nType) {
			case this.Properties.fn:
				this.fn = value;
				break;
			case this.Properties.scheme:
				this.scheme = value;
				break;
			case this.Properties.fs:
				this.fs = value;
				break;
			case this.Properties.b:
				this.b = value;
				break;
			case this.Properties.i:
				this.i = value;
				break;
			case this.Properties.u:
				this.u = value;
				break;
			case this.Properties.s:
				this.s = value;
				break;
			case this.Properties.c:
				this.c = value;
				break;
			case this.Properties.va:
				this.va = value;
				break;
		}
	};
var g_oFillProperties = {
		bg: 0
	};
/** @constructor */
function Fill(val)
{
	if(null == val)
		val = g_oDefaultFormat.FillAbs;
	this.Properties = g_oFillProperties;
	this.bg = val.bg;
}
Fill.prototype =
{
	_mergeProperty : function(first, second, def)
	{
		if(def != first)
			return first;
		else
			return second;
	},
	merge : function(fill)
	{
		var oRes = new Fill();
		oRes.bg = this._mergeProperty(this.bg, fill.bg, g_oDefaultFormat.Fill.bg);
		return oRes;
	},
	getRgbOrNull : function()
	{
		var nRes = null;
		if(null != this.bg)
			nRes = this.bg.getRgb();
		return nRes;
	},
	getDif : function(val)
	{
		var oRes = new Fill(this);
		var bEmpty = true;
		if(g_oColorManager.isEqual(this.bg, val.bg))
			oRes.bg =  null;
		else
			bEmpty = false;
		if(bEmpty)
			oRes = null;
		return oRes;
	},
	isEqual : function(fill)
	{
		return g_oColorManager.isEqual(this.bg, fill.bg);
	},
    clone : function()
    {
        return new Fill(this);
    },
	getType : function()
	{
		return UndoRedoDataTypes.StyleFill;
	},
	getProperties : function()
	{
		return this.Properties;
	},
	getProperty : function(nType)
	{
		switch(nType)
		{
			case this.Properties.bg: return this.bg;break;
		}
	},
	setProperty : function(nType, value)
	{
		switch(nType)
		{
			case this.Properties.bg: this.bg = value;break;
		}
	}
};
	var g_oBorderPropProperties = {
		s: 0, c: 1
	};

	function BorderProp() {
		this.Properties = g_oBorderPropProperties;
		this.s = c_oAscBorderStyles.None;
		this.w = c_oAscBorderWidth.None;
		this.c = g_oColorManager.getThemeColor(1);
	}

	BorderProp.prototype.setStyle = function (style) {
		this.s = style;
		switch (this.s) {
			case c_oAscBorderStyles.Thin:
			case c_oAscBorderStyles.DashDot:
			case c_oAscBorderStyles.DashDotDot:
			case c_oAscBorderStyles.Dashed:
			case c_oAscBorderStyles.Dotted:
			case c_oAscBorderStyles.Hair:
				this.w = c_oAscBorderWidth.Thin;
				break;
			case c_oAscBorderStyles.Medium:
			case c_oAscBorderStyles.MediumDashDot:
			case c_oAscBorderStyles.MediumDashDotDot:
			case c_oAscBorderStyles.MediumDashed:
			case c_oAscBorderStyles.SlantDashDot:
				this.w = c_oAscBorderWidth.Medium;
				break;
			case c_oAscBorderStyles.Thick:
			case c_oAscBorderStyles.Double:
				this.w = c_oAscBorderWidth.Thick;
				break;
			default:
				this.w = c_oAscBorderWidth.None;
				break;
		}
	};
	BorderProp.prototype.getDashSegments = function () {
		var res;
		switch (this.s) {
			case c_oAscBorderStyles.Hair:
				res = [1, 1];
				break;
			case c_oAscBorderStyles.Dotted:
				res = [2, 2];
				break;
			case c_oAscBorderStyles.DashDotDot:
			case c_oAscBorderStyles.MediumDashDotDot:
				res = [3, 3, 3, 3, 9, 3];
				break;
			case c_oAscBorderStyles.DashDot:
			case c_oAscBorderStyles.MediumDashDot:
			case c_oAscBorderStyles.SlantDashDot:
				res = [3, 3, 9, 3];
				break;
			case c_oAscBorderStyles.Dashed:
				res = [3, 1];
				break;
			case c_oAscBorderStyles.MediumDashed:
				res = [9, 3];
				break;
			case c_oAscBorderStyles.Thin:
			case c_oAscBorderStyles.Medium:
			case c_oAscBorderStyles.Thick:
			case c_oAscBorderStyles.Double:
			default:
				res = [];
				break;
		}
		return res;
	};
	BorderProp.prototype.getRgbOrNull = function () {
		var nRes = null;
		if (null != this.c) {
			nRes = this.c.getRgb();
		}
		return nRes;
	};
	BorderProp.prototype.isEmpty = function () {
		return c_oAscBorderStyles.None === this.s;
	};
	BorderProp.prototype.isEqual = function (val) {
		return this.s === val.s && g_oColorManager.isEqual(this.c, val.c);
	};
	BorderProp.prototype.clone = function () {
		var res = new BorderProp();
		res.merge(this);
		return res;
	};
	BorderProp.prototype.merge = function (oBorderProp) {
		if (null != oBorderProp.s && c_oAscBorderStyles.None !== oBorderProp.s) {
			this.s = oBorderProp.s;
			this.w = oBorderProp.w;
			if (null != oBorderProp.c) {
				this.c = oBorderProp.c;
			}
		}
	};
	BorderProp.prototype.getType = function () {
		return UndoRedoDataTypes.StyleBorderProp;
	};
	BorderProp.prototype.getProperties = function () {
		return this.Properties;
	};
	BorderProp.prototype.getProperty = function (nType) {
		switch (nType) {
			case this.Properties.s:
				return this.s;
				break;
			case this.Properties.c:
				return this.c;
				break;
		}
	};
	BorderProp.prototype.setProperty = function (nType, value) {
		switch (nType) {
			case this.Properties.s:
				this.setStyle(value);
				break;
			case this.Properties.c:
				this.c = value;
				break;
		}
	};
var g_oBorderProperties = {
		l: 0,
		t: 1,
		r: 2,
		b: 3,
		d: 4,
		ih: 5,
		iv: 6,
		dd: 7,
		du: 8
	};

	/** @constructor */
	function Border(val) {
		if (null == val) {
			val = g_oDefaultFormat.BorderAbs;
		}
		this.Properties = g_oBorderProperties;
		this.l = val.l.clone();
		this.t = val.t.clone();
		this.r = val.r.clone();
		this.b = val.b.clone();
		this.d = val.d.clone();
		this.ih = val.ih.clone();
		this.iv = val.iv.clone();
		this.dd = val.dd;
		this.du = val.du;
	}

	Border.prototype._mergeProperty = function (first, second, def) {
		if ((null != def.isEqual && false == def.isEqual(first)) || (null == def.isEqual && def != first)) {
			return first;
		} else {
			return second;
		}
	};
	Border.prototype.merge = function (border) {
		var defaultBorder = g_oDefaultFormat.Border;
		var oRes = new Border();
		oRes.l = this._mergeProperty(this.l, border.l, defaultBorder.l).clone();
		oRes.t = this._mergeProperty(this.t, border.t, defaultBorder.t).clone();
		oRes.r = this._mergeProperty(this.r, border.r, defaultBorder.r).clone();
		oRes.b = this._mergeProperty(this.b, border.b, defaultBorder.b).clone();
		oRes.d = this._mergeProperty(this.d, border.d, defaultBorder.d).clone();
		oRes.ih = this._mergeProperty(this.ih, border.ih, defaultBorder.ih).clone();
		oRes.iv = this._mergeProperty(this.iv, border.iv, defaultBorder.iv).clone();
		oRes.dd = this._mergeProperty(this.dd, border.dd, defaultBorder.dd);
		oRes.du = this._mergeProperty(this.du, border.du, defaultBorder.du);
		return oRes;
	};
	Border.prototype.getDif = function (val) {
		var oRes = new Border(this);
		var bEmpty = true;
		if (true == this.l.isEqual(val.l)) {
			oRes.l = null;
		} else {
			bEmpty = false;
		}
		if (true == this.t.isEqual(val.t)) {
			oRes.t = null;
		} else {
			bEmpty = false;
		}
		if (true == this.r.isEqual(val.r)) {
			oRes.r = null;
		} else {
			bEmpty = false;
		}
		if (true == this.b.isEqual(val.b)) {
			oRes.b = null;
		} else {
			bEmpty = false;
		}
		if (true == this.d.isEqual(val.d)) {
			oRes.d = null;
		}
		if (true == this.ih.isEqual(val.ih)) {
			oRes.ih = null;
		} else {
			bEmpty = false;
		}
		if (true == this.iv.isEqual(val.iv)) {
			oRes.iv = null;
		} else {
			bEmpty = false;
		}
		if (this.dd == val.dd) {
			oRes.dd = null;
		} else {
			bEmpty = false;
		}
		if (this.du == val.du) {
			oRes.du = null;
		} else {
			bEmpty = false;
		}
		if (bEmpty) {
			oRes = null;
		}
		return oRes;
	};
	Border.prototype.isEqual = function (val) {
		return this.l.isEqual(val.l) && this.t.isEqual(val.t) && this.r.isEqual(val.r) && this.b.isEqual(val.b) &&
			this.d.isEqual(val.d) && this.ih.isEqual(val.ih) && this.iv.isEqual(val.iv) && this.dd == val.dd &&
			this.du == val.du;
	};
	Border.prototype.clone = function () {
		return new Border(this);
	};
	Border.prototype.clean = function () {
		var defaultBorder = g_oDefaultFormat.Border;
		this.l = defaultBorder.l.clone();
		this.t = defaultBorder.t.clone();
		this.r = defaultBorder.r.clone();
		this.b = defaultBorder.b.clone();
		this.d = defaultBorder.d.clone();
		this.ih = defaultBorder.ih.clone();
		this.iv = defaultBorder.iv.clone();
		this.dd = defaultBorder.dd;
		this.du = defaultBorder.du;
	};
	Border.prototype.mergeInner = function (border) {
		if (border) {
			if (border.l) {
				this.l.merge(border.l);
			}
			if (border.t) {
				this.t.merge(border.t);
			}
			if (border.r) {
				this.r.merge(border.r);
			}
			if (border.b) {
				this.b.merge(border.b);
			}
			if (border.d) {
				this.d.merge(border.d);
			}
			if (border.ih) {
				this.ih.merge(border.ih);
			}
			if (border.iv) {
				this.iv.merge(border.iv);
			}
			if (null != border.dd) {
				this.dd = this.dd || border.dd;
			}
			if (null != border.du) {
				this.du = this.du || border.du;
			}
		}
	};
	Border.prototype.getType = function () {
		return UndoRedoDataTypes.StyleBorder;
	};
	Border.prototype.getProperties = function () {
		return this.Properties;
	};
	Border.prototype.getProperty = function (nType) {
		switch (nType) {
			case this.Properties.l:
				return this.l;
				break;
			case this.Properties.t:
				return this.t;
				break;
			case this.Properties.r:
				return this.r;
				break;
			case this.Properties.b:
				return this.b;
				break;
			case this.Properties.d:
				return this.d;
				break;
			case this.Properties.ih:
				return this.ih;
				break;
			case this.Properties.iv:
				return this.iv;
				break;
			case this.Properties.dd:
				return this.dd;
				break;
			case this.Properties.du:
				return this.du;
				break;
		}
	};
	Border.prototype.setProperty = function (nType, value) {
		switch (nType) {
			case this.Properties.l:
				this.l = value;
				break;
			case this.Properties.t:
				this.t = value;
				break;
			case this.Properties.r:
				this.r = value;
				break;
			case this.Properties.b:
				this.b = value;
				break;
			case this.Properties.d:
				this.d = value;
				break;
			case this.Properties.ih:
				this.ih = value;
				break;
			case this.Properties.iv:
				this.iv = value;
				break;
			case this.Properties.dd:
				this.dd = value;
				break;
			case this.Properties.du:
				this.du = value;
				break;
		}
	};
	Border.prototype.notEmpty = function () {
		return (this.l && c_oAscBorderStyles.None !== this.l.s) || (this.r && c_oAscBorderStyles.None !== this.r.s) ||
			(this.t && c_oAscBorderStyles.None !== this.t.s) || (this.b && c_oAscBorderStyles.None !== this.b.s) ||
			(this.dd && c_oAscBorderStyles.None !== this.dd.s) || (this.du && c_oAscBorderStyles.None !== this.du.s);
	};
var g_oNumProperties = {
		f: 0,
		id: 1
	};
/** @constructor */
function Num(val)
{
	if(null == val)
		val = g_oDefaultFormat.NumAbs;
	this.Properties = g_oNumProperties;
	this.f = val.f;
  this.id = val.id;
}
Num.prototype =
{
  setFormat: function(f, opt_id) {
    this.f = f;
    this.id = opt_id;
  },
  getFormat: function() {
    return (null != this.id) ? (AscCommon.getFormatByStandardId(this.id) || this.f) : this.f;
  },
  _mergeProperty : function(first, second, def)
  {
    if(def != first)
      return first;
    else
      return second;
  },
	merge : function(num)
	{
		var oRes = new Num();
    oRes.f = this._mergeProperty(this.f, num.f, g_oDefaultFormat.Num.f);
    oRes.id = this._mergeProperty(this.id, num.id, g_oDefaultFormat.Num.id);
		return oRes;
	},
  getDif: function(val) {
    var oRes = new Num(this);
    var bEmpty = true;
    if (this.f == val.f) {
      oRes.f = null;
    } else {
      bEmpty = false;
    }
    if (this.id == val.id) {
      oRes.id = null;
    } else {
      bEmpty = false;
    }
    if (bEmpty) {
      oRes = null;
    }
    return oRes;
  },
  isEqual: function(val) {
    if (null != this.id && null != val.id) {
      return this.id == val.id;
    } else if (null != this.id || null != val.id) {
      return false;
    } else {
      return this.f == val.f;
    }
  },
    clone : function()
    {
        return new Num(this);
    },
	getType : function()
	{
		return UndoRedoDataTypes.StyleNum;
	},
	getProperties : function()
	{
		return this.Properties;
	},
	getProperty : function(nType)
	{
		switch(nType)
		{
			case this.Properties.f: return this.f;break;
			case this.Properties.id: return this.id;break;
		}
	},
	setProperty : function(nType, value)
	{
		switch(nType)
		{
			case this.Properties.f: this.f = value;break;
			case this.Properties.id: this.id = value;break;
		}
	}
};
var g_oCellXfsProperties = {
		border: 0,
		fill: 1,
		font: 2,
		num: 3,
		align: 4,
		QuotePrefix: 5,
		XfId: 6
	};
/** @constructor */
function CellXfs() {
	this.Properties = g_oCellXfsProperties;
    this.border = null;
    this.fill = null;
    this.font = null;
    this.num = null;
    this.align = null;
	this.QuotePrefix = null;
	this.XfId = null;
    // Является ли стиль ссылкой (При открытии все стили будут ссылками. Поэтому при смене свойств нужно делать копию)
    this.isReference = false;
}
CellXfs.prototype =
{
	_mergeProperty : function(first, second, isTable)
	{
		var res = null;
		if(null != first || null != second)
		{
			if(null == first)
				res = second;
			else if(null == second)
				res = first;
			else
			{
				if(null != first.merge)
					res = first.merge(second, isTable);
				else
					res = first;
			}
		}
		return res;
	},
	merge : function(xfs, isTable)
	{
		var oRes = new CellXfs();
		oRes.border = this._mergeProperty(this.border, xfs.border);
		oRes.fill = this._mergeProperty(this.fill, xfs.fill);
		oRes.font = this._mergeProperty(this.font, xfs.font, isTable);
		oRes.num = this._mergeProperty(this.num, xfs.num);
		oRes.align = this._mergeProperty(this.align, xfs.align);
		oRes.QuotePrefix = this._mergeProperty(this.QuotePrefix, xfs.QuotePrefix);
		oRes.XfId = this._mergeProperty(this.XfId, xfs.XfId);
		return oRes;
	},
    clone : function()
    {
        var res = new CellXfs();
        if(null != this.border)
            res.border = this.border.clone();
        if(null != this.fill)
            res.fill = this.fill.clone();
        if(null != this.font)
            res.font = this.font.clone();
        if(null != this.num)
            res.num = this.num.clone();
        if(null != this.align)
            res.align = this.align.clone();
        if(null != this.QuotePrefix)
            res.QuotePrefix = this.QuotePrefix;
		if (null !== this.XfId)
			res.XfId = this.XfId;
        return res;
    },
	isEqual : function(xfs)
	{
		if(false == ((null == this.border && null == xfs.border) || (null != this.border && null != xfs.border && this.border.isEqual(xfs.border))))
			return false;
		if(false == ((null == this.fill && null == xfs.fill) || (null != this.fill && null != xfs.fill && this.fill.isEqual(xfs.fill))))
			return false;
		if(false == ((null == this.font && null == xfs.font) || (null != this.font && null != xfs.font && this.font.isEqual(xfs.font))))
			return false;
		if(false == ((null == this.num && null == xfs.num) || (null != this.num && null != xfs.num && this.num.isEqual(xfs.num))))
			return false;
		if(false == ((null == this.align && null == xfs.align) || (null != this.align && null != xfs.align && this.align.isEqual(xfs.align))))
			return false;
		if(this.QuotePrefix != xfs.QuotePrefix)
			return false;
		if (this.XfId != xfs.XfId)
			return false;
		return true;
	},
	getType : function()
	{
		return UndoRedoDataTypes.StyleXfs;
	},
	getProperties : function()
	{
		return this.Properties;
	},
	getProperty : function(nType)
	{
		switch(nType)
		{
			case this.Properties.border: return this.border;break;
			case this.Properties.fill: return this.fill;break;
			case this.Properties.font: return this.font;break;
			case this.Properties.num: return this.num;break;
			case this.Properties.align: return this.align;break;
			case this.Properties.QuotePrefix: return this.QuotePrefix;break;
			case this.Properties.XfId: return this.XfId; break;
		}
	},
	setProperty : function(nType, value)
	{
		switch(nType)
		{
			case this.Properties.border: this.border = value;break;
			case this.Properties.fill: this.fill = value;break;
			case this.Properties.font: this.font = value;break;
			case this.Properties.num: this.num = value;break;
			case this.Properties.align: this.align = value;break;
			case this.Properties.QuotePrefix: this.QuotePrefix = value;break;
			case this.Properties.XfId: this.XfId = value; break;
		}
	}
};
var g_oAlignProperties = {
		hor: 0,
		indent: 1,
		RelativeIndent: 2,
		shrink: 3,
		angle: 4,
		ver: 5,
		wrap: 6
	};
/** @constructor */
function Align(val)
{
	if(null == val)
		val = g_oDefaultFormat.AlignAbs;
	this.Properties = g_oAlignProperties;
	this.hor = val.hor;
	this.indent = val.indent;
	this.RelativeIndent = val.RelativeIndent;
	this.shrink = val.shrink;
	this.angle = val.angle;
	this.ver = val.ver;
	this.wrap = val.wrap;
}
Align.prototype =
{
	_mergeProperty : function(first, second, def)
	{
		if (def != first)
			return first;
		else
			return second;
	},
	merge : function(border)
	{
		var defaultAlign = g_oDefaultFormat.Align;
		var oRes = new Align();
		oRes.hor = this._mergeProperty(this.hor, border.hor, defaultAlign.hor);
		oRes.indent = this._mergeProperty(this.indent, border.indent, defaultAlign.indent);
		oRes.RelativeIndent = this._mergeProperty(this.RelativeIndent, border.RelativeIndent, defaultAlign.RelativeIndent);
		oRes.shrink = this._mergeProperty(this.shrink, border.shrink, defaultAlign.shrink);
		oRes.angle = this._mergeProperty(this.angle, border.angle, defaultAlign.angle);
		oRes.ver = this._mergeProperty(this.ver, border.ver, defaultAlign.ver);
		oRes.wrap = this._mergeProperty(this.wrap, border.wrap, defaultAlign.wrap);
		return oRes;
	},
	getDif : function(val)
	{
		var oRes = new Align(this);
		var bEmpty = true;
		if(this.hor == val.hor)
			oRes.hor =  null;
		else
			bEmpty = false;
		if(this.indent == val.indent)
			oRes.indent =  null;
		else
			bEmpty = false;
		if(this.RelativeIndent == val.RelativeIndent)
			oRes.RelativeIndent =  null;
		else
			bEmpty = false;
		if(this.shrink == val.shrink)
			oRes.shrink =  null;
		else
			bEmpty = false;
		if(this.angle == val.angle)
			oRes.angle =  null;
		else
			bEmpty = false;
		if(this.ver == val.ver)
			oRes.ver =  null;
		else
			bEmpty = false;
		if(this.wrap == val.wrap)
			oRes.wrap =  null;
		else
			bEmpty = false;
		if(bEmpty)
			oRes = null;
		return oRes;
	},
	isEqual : function(val)
	{
		return this.hor == val.hor && this.indent == val.indent && this.RelativeIndent == val.RelativeIndent && this.shrink == val.shrink &&
				this.angle == val.angle && this.ver == val.ver && this.wrap == val.wrap;
	},
    clone : function()
    {
        return new Align(this);
    },
	getType : function()
	{
		return UndoRedoDataTypes.StyleAlign;
	},
	getProperties : function()
	{
		return this.Properties;
	},
	getProperty : function(nType)
	{
		switch(nType)
		{
			case this.Properties.hor: return this.hor;break;
			case this.Properties.indent: return this.indent;break;
			case this.Properties.RelativeIndent: return this.RelativeIndent;break;
			case this.Properties.shrink: return this.shrink;break;
			case this.Properties.angle: return this.angle;break;
			case this.Properties.ver: return this.ver;break;
			case this.Properties.wrap: return this.wrap;break;
		}
	},
	setProperty : function(nType, value)
	{
		switch(nType)
		{
			case this.Properties.hor: this.hor = value;break;
			case this.Properties.indent: this.indent = value;break;
			case this.Properties.RelativeIndent: this.RelativeIndent = value;break;
			case this.Properties.shrink: this.shrink = value;break;
			case this.Properties.angle: this.angle = value;break;
			case this.Properties.ver: this.ver = value;break;
			case this.Properties.wrap: this.wrap = value;break;
		}
	}
};
/** @constructor */
function CCellStyles() {
	this.CustomStyles = [];
	this.DefaultStyles = [];
	// ToDo нужно все компоновать в общий список стилей (для того, чтобы не было проблем с добавлением стилей и отсутствия имени стиля)
	this.AllStyles = {};
}
CCellStyles.prototype.generateFontMap = function (oFontMap) {
	this._generateFontMap(oFontMap, this.DefaultStyles);
	this._generateFontMap(oFontMap, this.CustomStyles);
};
CCellStyles.prototype._generateFontMap = function (oFontMap, aStyles) {
	var i, length, oStyle;
	for (i = 0, length = aStyles.length; i < length; ++i) {
		oStyle = aStyles[i];
		if (null != oStyle.xfs && null != oStyle.xfs.font)
			oFontMap[oStyle.xfs.font.getName()] = 1;
	}
};
/**
 * Возвращает колличество стилей без учета скрытых
 */
CCellStyles.prototype.getDefaultStylesCount = function () {
	var nCount = this.DefaultStyles.length;
	for (var i = 0, length = nCount; i < length; ++i) {
		if (this.DefaultStyles[i].Hidden)
			--nCount;
	}
	return nCount;
};
/**
 * Возвращает колличество стилей без учета скрытых и стандартных
 */
CCellStyles.prototype.getCustomStylesCount = function () {
	var nCount = this.CustomStyles.length;
	for (var i = 0, length = nCount; i < length; ++i) {
		if (this.CustomStyles[i].Hidden || null != this.CustomStyles[i].BuiltinId)
			--nCount;
	}
	return nCount;
};
CCellStyles.prototype.getStyleByXfId = function (oXfId) {
	for (var i = 0, length = this.CustomStyles.length; i < length; ++i) {
		if (oXfId === this.CustomStyles[i].XfId) {
			return this.CustomStyles[i];
		}
	}

	return null;
};
CCellStyles.prototype.getStyleNameByXfId = function (oXfId) {
	var styleName = null;
	if (null === oXfId)
		return styleName;

	var style = null;
	for (var i = 0, length = this.CustomStyles.length; i < length; ++i) {
		style = this.CustomStyles[i];
		if (oXfId === style.XfId) {
			if (null !== style.BuiltinId) {
				styleName = this.getDefaultStyleNameByBuiltinId(style.BuiltinId);
				if (null === styleName)
					styleName = style.Name;
				break;
			} else {
				styleName = style.Name;
				break;
			}
		}
	}

	return styleName;
};
CCellStyles.prototype.getDefaultStyleNameByBuiltinId = function (oBuiltinId) {
	var style = null;
	for (var i = 0, length = this.DefaultStyles.length; i < length; ++i) {
		style = this.DefaultStyles[i];
		if (style.BuiltinId === oBuiltinId)
			return style.Name;
	}
	return null;
};
CCellStyles.prototype.getCustomStyleByBuiltinId = function (oBuiltinId) {
	var style = null;
	for (var i = 0, length = this.CustomStyles.length; i < length; ++i) {
		style = this.CustomStyles[i];
		if (style.BuiltinId === oBuiltinId)
			return style;
	}
	return null;
};
CCellStyles.prototype._prepareCellStyle = function (name) {
	var defaultStyle = null;
	var style = null;
	var i, length;
	var maxXfId = -1;
	// Проверим, есть ли в default
	for (i = 0, length = this.DefaultStyles.length; i < length; ++i) {
		if (name === this.DefaultStyles[i].Name) {
			defaultStyle = this.DefaultStyles[i];
			break;
		}
	}
	// Если есть в default, ищем в custom по builtinId. Если нет, то по имени
	if (defaultStyle) {
		for (i = 0, length = this.CustomStyles.length; i < length; ++i) {
			if (defaultStyle.BuiltinId === this.CustomStyles[i].BuiltinId) {
				style = this.CustomStyles[i];
				break;
			}
			maxXfId = Math.max(maxXfId, this.CustomStyles[i].XfId);
		}
	} else {
		for (i = 0, length = this.CustomStyles.length; i < length; ++i) {
			if (name === this.CustomStyles[i].Name) {
				style = this.CustomStyles[i];
				break;
			}
			maxXfId = Math.max(maxXfId, this.CustomStyles[i].XfId);
		}
	}

	// Если нашли, то возвращаем XfId
	if (style)
		return style.XfId;

	if (defaultStyle) {
		this.CustomStyles[i] = defaultStyle.clone();
		this.CustomStyles[i].XfId = ++maxXfId;
		return this.CustomStyles[i].XfId;
	}
	return g_oDefaultFormat.XfId;
};
/** @constructor */
function CCellStyle() {
	this.BuiltinId = null;
	this.CustomBuiltin = null;
	this.Hidden = null;
	this.ILevel = null;
	this.Name = null;
	this.XfId = null;

	this.xfs = null;

	this.ApplyBorder = true;
	this.ApplyFill = true;
	this.ApplyFont = true;
	this.ApplyNumberFormat = true;
}
CCellStyle.prototype.clone = function () {
	var oNewStyle = new CCellStyle();
	oNewStyle.BuiltinId = this.BuiltinId;
	oNewStyle.CustomBuiltin = this.CustomBuiltin;
	oNewStyle.Hidden = this.Hidden;
	oNewStyle.ILevel = this.ILevel;
	oNewStyle.Name = this.Name;

	oNewStyle.ApplyBorder = this.ApplyBorder;
	oNewStyle.ApplyFill = this.ApplyFill;
	oNewStyle.ApplyFont = this.ApplyFont;
	oNewStyle.ApplyNumberFormat = this.ApplyNumberFormat;

	oNewStyle.xfs = this.xfs.clone();
	return oNewStyle;
};
CCellStyle.prototype.getFill = function () {
	if (null != this.xfs && null != this.xfs.fill)
		return this.xfs.fill.bg;

	return g_oDefaultFormat.Fill.bg;
};
CCellStyle.prototype.getFontColor = function () {
	if (null != this.xfs && null != this.xfs.font)
		return this.xfs.font.getColor();

	return g_oDefaultFormat.Font.c;
};
CCellStyle.prototype.getFont = function () {
	if (null != this.xfs && null != this.xfs.font)
		return this.xfs.font;
	return g_oDefaultFormat.Font;
};
CCellStyle.prototype.getBorder = function () {
	if (null != this.xfs && null != this.xfs.border)
		return this.xfs.border;
	return g_oDefaultFormat.Border;
};
CCellStyle.prototype.getNumFormatStr = function () {
	if(null != this.xfs && null != this.xfs.num)
		return this.xfs.num.getFormat();
	return g_oDefaultFormat.Num.getFormat();
};
/** @constructor */
function StyleManager(){
	//стиль ячейки по умолчанию, может содержать не все свойства
	this.oDefaultXfs = new CellXfs();
}
StyleManager.prototype =
{
	init: function(oDefaultXfs, wb) {
		//font
		if (!oDefaultXfs.font) {
			oDefaultXfs.font = new AscCommonExcel.Font();
		}
		if (!oDefaultXfs.font.scheme) {
			oDefaultXfs.font.scheme = Asc.EFontScheme.fontschemeMinor;
		}
		if (!oDefaultXfs.font.fn) {
			var sThemeFont = null;
			if (null != wb.theme.themeElements && null != wb.theme.themeElements.fontScheme) {
				if (Asc.EFontScheme.fontschemeMinor == oDefaultXfs.font.scheme && wb.theme.themeElements.fontScheme.minorFont) {
					sThemeFont = wb.theme.themeElements.fontScheme.minorFont.latin;
				} else if (Asc.EFontScheme.fontschemeMajor == oDefaultXfs.font.scheme && wb.theme.themeElements.fontScheme.majorFont) {
					sThemeFont = wb.theme.themeElements.fontScheme.majorFont.latin;
				}
			}
			oDefaultXfs.font.fn = sThemeFont ? sThemeFont : "Calibri";
		}
		if (!oDefaultXfs.font.fs) {
			oDefaultXfs.font.fs = 11;
		}
		if (!oDefaultXfs.font.c) {
			oDefaultXfs.font.c = AscCommonExcel.g_oColorManager.getThemeColor(AscCommonExcel.g_nColorTextDefault);
		}
		g_oDefaultFormat.Font = oDefaultXfs.font;
		if(null != oDefaultXfs.fill)
			g_oDefaultFormat.Fill = oDefaultXfs.fill.clone();
		if(null != oDefaultXfs.border)
			g_oDefaultFormat.Border = oDefaultXfs.border.clone();
		if(null != oDefaultXfs.num)
			g_oDefaultFormat.Num = oDefaultXfs.num.clone();
		if(null != oDefaultXfs.align)
			g_oDefaultFormat.Align = oDefaultXfs.align.clone();
		if (null !== oDefaultXfs.XfId) {
			this.oDefaultXfs.XfId = oDefaultXfs.XfId;
			g_oDefaultFormat.XfId = oDefaultXfs.XfId;
		}
		this.oDefaultXfs = oDefaultXfs;
	},
    _prepareSetReference : function (oItemWithXfs)
    {
        // При открытии все стили будут ссылками. Поэтому при смене свойств нужно делать копию
        if (oItemWithXfs.xfs.isReference)
            oItemWithXfs.xfs = oItemWithXfs.xfs.clone();
        return oItemWithXfs.xfs;
    },
    _prepareSet : function(oItemWithXfs)
	{
		if(null == oItemWithXfs.xfs)
		{
			if(oItemWithXfs.getDefaultXfs)
				oItemWithXfs.xfs = oItemWithXfs.getDefaultXfs();
			if(null == oItemWithXfs.xfs)
				oItemWithXfs.xfs = this.oDefaultXfs.clone();
		} else
            this._prepareSetReference(oItemWithXfs);
        return oItemWithXfs.xfs;
	},
    _prepareSetFont : function(oItemWithXfs)
	{
		var xfs = this._prepareSet(oItemWithXfs);
		if(null == xfs.font)
			xfs.font = g_oDefaultFormat.Font.clone();
        return xfs;
	},
    _prepareSetAlign : function(oItemWithXfs)
	{
        var xfs = this._prepareSet(oItemWithXfs);
		if(null == xfs.align)
			xfs.align = g_oDefaultFormat.Align.clone();
        return xfs;
	},
	_prepareSetCellStyle : function (oItemWithXfs) {
		return this._prepareSet(oItemWithXfs);
	},
	setCellStyle : function(oItemWithXfs, val)
	{
		// ToDo add code
		var xfs = oItemWithXfs.xfs;
		var oRes = {newVal: val, oldVal: null};
		if(null != xfs && null != xfs.XfId)
			oRes.oldVal = xfs.XfId;
		else
			oRes.oldVal = g_oDefaultFormat.XfId;
		if(null == val) {
			if(null != xfs) {
			    xfs = this._prepareSetReference(oItemWithXfs);
				xfs.XfId = g_oDefaultFormat.XfId;
            }
		} else {
			xfs = this._prepareSetCellStyle(oItemWithXfs);
			xfs.XfId = val;
		}
		return oRes;
	},
	setNum : function(oItemWithXfs, val)
	{
		var xfs = oItemWithXfs.xfs;
		var oRes = {newVal: val, oldVal: null};
		if(null != xfs && null != xfs.num)
			oRes.oldVal = xfs.num;
		else
			oRes.oldVal = null;
		if(null == val)
		{
			if(null != xfs) {
				xfs = this._prepareSetReference(oItemWithXfs);
				xfs.num = null;
			}
		}
		else
		{
			xfs = this._prepareSet(oItemWithXfs);
			xfs.num = val.clone();
		}
		return oRes;
	},
	setFont : function(oItemWithXfs, val, oHistoryObj, nHistoryId, sSheetId, oRange)
    {
        var xfs = oItemWithXfs.xfs;
        var oRes = {newVal: val, oldVal: null};
        if(null != xfs && null != xfs.font)
            oRes.oldVal = xfs.font;
		else
			oRes.oldVal = null;
        if(null == val)
        {
            if(null != xfs) {
                xfs = this._prepareSetReference(oItemWithXfs);
                xfs.font = null;
            }
        }
        else
        {
            xfs = this._prepareSetFont(oItemWithXfs);
            xfs.font = val.clone();
        }
		return oRes;
	},
	setFontname : function(oItemWithXfs, val)
	{
        var xfs = oItemWithXfs.xfs;
        var oRes = {newVal: val, oldVal: null};
        if(null != xfs && null != xfs.font)
            oRes.oldVal = xfs.font.fn;
		else
			oRes.oldVal = null;
		//todo undo для scheme
		var isSetNull = (null == val);
		if (!isSetNull || (null != xfs && null != xfs.font)) {
			if (isSetNull) {
				xfs = this._prepareSetReference(oItemWithXfs);
			} else {
				xfs = this._prepareSetFont(oItemWithXfs);
			}
			xfs.font.setName(val);
			xfs.font.setScheme(null);
		}
		return oRes;
	},
	setFontsize : function(oItemWithXfs, val)
	{
        var xfs = oItemWithXfs.xfs;
        var oRes = {newVal: val, oldVal: null};
        if(null != xfs && null != xfs.font)
            oRes.oldVal = xfs.font.fs;
		else
			oRes.oldVal = null;
		var isSetNull = (null == val);
		if (!isSetNull || (null != xfs && null != xfs.font)) {
			if (isSetNull) {
				xfs = this._prepareSetReference(oItemWithXfs);
			} else {
				xfs = this._prepareSetFont(oItemWithXfs);
			}
			xfs.font.setSize(val);
		}
		return oRes;
	},
	setFontcolor : function(oItemWithXfs, val)
	{
        var xfs = oItemWithXfs.xfs;
        var oRes = {newVal: val, oldVal: null};
        if(null != xfs && null != xfs.font)
            oRes.oldVal = xfs.font.c;
		else
			oRes.oldVal = null;
		var isSetNull = (null == val);
		if (!isSetNull || (null != xfs && null != xfs.font)) {
			if (isSetNull) {
				xfs = this._prepareSetReference(oItemWithXfs);
			} else {
				xfs = this._prepareSetFont(oItemWithXfs);
			}
			xfs.font.setColor(val);
		}
		return oRes;
	},
	setBold : function(oItemWithXfs, val)
	{
        var xfs = oItemWithXfs.xfs;
        var oRes = {newVal: val, oldVal: null};
        if(null != xfs && null != xfs.font)
            oRes.oldVal = xfs.font.b;
		else
			oRes.oldVal = null;
		var isSetNull = (null == val || false == val);
		if (!isSetNull || (null != xfs && null != xfs.font)) {
			if (isSetNull) {
				xfs = this._prepareSetReference(oItemWithXfs);
			} else {
				xfs = this._prepareSetFont(oItemWithXfs);
			}
			xfs.font.setBold(val);
		}
		return oRes;
	},
	setItalic : function(oItemWithXfs, val)
	{
        var xfs = oItemWithXfs.xfs;
        var oRes = {newVal: val, oldVal: null};
        if(null != xfs && null != xfs.font)
            oRes.oldVal = xfs.font.i;
		else
			oRes.oldVal = null;
		var isSetNull = (null == val || false == val);
		if (!isSetNull || (null != xfs && null != xfs.font)) {
			if (isSetNull) {
				xfs = this._prepareSetReference(oItemWithXfs);
			} else {
				xfs = this._prepareSetFont(oItemWithXfs);
			}
			xfs.font.setItalic(val);
		}
		return oRes;
	},
	setUnderline : function(oItemWithXfs, val)
	{
        var xfs = oItemWithXfs.xfs;
        var oRes = {newVal: val, oldVal: null};
        if(null != xfs && null != xfs.font)
            oRes.oldVal = xfs.font.u;
		else
			oRes.oldVal = null;
		var isSetNull = (null == val || Asc.EUnderline.underlineNone == val);
		if (!isSetNull || (null != xfs && null != xfs.font)) {
			if (isSetNull) {
				xfs = this._prepareSetReference(oItemWithXfs);
			} else {
				xfs = this._prepareSetFont(oItemWithXfs);
			}
			xfs.font.setUnderline(val);
		}
		return oRes;
	},
	setStrikeout : function(oItemWithXfs, val)
	{
        var xfs = oItemWithXfs.xfs;
        var oRes = {newVal: val, oldVal: null};
        if(null != xfs && null != xfs.font)
            oRes.oldVal = xfs.font.s;
		else
			oRes.oldVal = null;
		var isSetNull = (null == val || false == val);
		if (!isSetNull || (null != xfs && null != xfs.font)) {
			if (isSetNull) {
				xfs = this._prepareSetReference(oItemWithXfs);
			} else {
				xfs = this._prepareSetFont(oItemWithXfs);
			}
			xfs.font.setStrikeout(val);
		}
		return oRes;
	},
	setFontAlign : function(oItemWithXfs, val)
	{
        var xfs = oItemWithXfs.xfs;
        var oRes = {newVal: val, oldVal: null};
        if(null != xfs && null != xfs.font)
            oRes.oldVal = xfs.font.va;
		else
			oRes.oldVal = null;
		var isSetNull = (null == val || AscCommon.vertalign_Baseline == val);
		if (!isSetNull || (null != xfs && null != xfs.font)) {
			if (isSetNull) {
				xfs = this._prepareSetReference(oItemWithXfs);
			} else {
				xfs = this._prepareSetFont(oItemWithXfs);
			}
			xfs.font.setVerticalAlign(val);
		}
		return oRes;
	},
	setAlignVertical : function(oItemWithXfs, val)
	{
        var xfs = oItemWithXfs.xfs;
        var oRes = {newVal: val, oldVal: null};
        if(null != xfs && null != xfs.align)
            oRes.oldVal = xfs.align.ver;
		else
			oRes.oldVal = g_oDefaultFormat.Align.ver;
        if(null == val)
        {
            if(null != xfs && null != xfs.align) {
                xfs = this._prepareSetReference(oItemWithXfs);
                xfs.align.ver = g_oDefaultFormat.Align.ver;
            }
        }
        else
        {
            xfs = this._prepareSetAlign(oItemWithXfs);
            xfs.align.ver = val;
        }
		return oRes;
	},
	setAlignHorizontal : function(oItemWithXfs, val)
	{
        var xfs = oItemWithXfs.xfs;
        var oRes = {newVal: val, oldVal: null};
        if(null != xfs && null != xfs.align)
            oRes.oldVal = xfs.align.hor;
		else
			oRes.oldVal = g_oDefaultFormat.Align.hor;
        if(null == val)
        {
            if(null != xfs && null != xfs.align) {
                xfs = this._prepareSetReference(oItemWithXfs);
                xfs.align.hor = g_oDefaultFormat.Align.hor;
            }
        }
        else
        {
            xfs = this._prepareSetAlign(oItemWithXfs);
            xfs.align.hor = val;
        }
		return oRes;
	},
	setFill : function(oItemWithXfs, val)
	{
        var xfs = oItemWithXfs.xfs;
        var oRes = {newVal: val, oldVal: null};
        if(null != xfs && null != xfs.fill)
            oRes.oldVal = xfs.fill.bg;
		else
			oRes.oldVal = g_oDefaultFormat.Fill.bg;
        if(null == val)
        {
            if(null != xfs && null != xfs.fill) {
                xfs = this._prepareSetReference(oItemWithXfs);
                xfs.fill.bg = g_oDefaultFormat.Fill.bg;
            }
        }
        else
        {
            xfs = this._prepareSet(oItemWithXfs);
			if(null == xfs.fill)
                xfs.fill = g_oDefaultFormat.Fill.clone();
            xfs.fill.bg = val;
        }
		return oRes;
	},
	setBorder : function(oItemWithXfs, val)
	{
        var xfs = oItemWithXfs.xfs;
        var oRes = {newVal: val, oldVal: null};
        if(null != xfs && null != xfs.border)
            oRes.oldVal = xfs.border;
		else
			oRes.oldVal = g_oDefaultFormat.Border;
        if(null == val)
        {
            if(null != xfs && null != xfs.border) {
                xfs = this._prepareSetReference(oItemWithXfs);
                xfs.border = val;
            }
        }
        else
        {
            xfs = this._prepareSet(oItemWithXfs);
            xfs.border = val;
        }
		return oRes;
	},
	setShrinkToFit : function(oItemWithXfs, val)
	{
        var xfs = oItemWithXfs.xfs;
        var oRes = {newVal: val, oldVal: null};
        if(null != xfs && null != xfs.align)
            oRes.oldVal = xfs.align.shrink;
		else
			oRes.oldVal = g_oDefaultFormat.Align.shrink;
        if(null == val)
        {
            if(null != xfs && null != xfs.align) {
                xfs = this._prepareSetReference(oItemWithXfs);
                xfs.align.shrink = g_oDefaultFormat.Align.shrink;
            }
        }
        else
        {
            xfs = this._prepareSetAlign(oItemWithXfs);
            xfs.align.shrink = val;
        }
		return oRes;
	},
	setWrap : function(oItemWithXfs, val)
	{
        var xfs = oItemWithXfs.xfs;
        var oRes = {newVal: val, oldVal: null};
        if(null != xfs && null != xfs.align)
            oRes.oldVal = xfs.align.wrap;
		else
			oRes.oldVal = g_oDefaultFormat.Align.wrap;
        if(null == val)
        {
            if(null != xfs && null != xfs.align) {
                xfs = this._prepareSetReference(oItemWithXfs);
                xfs.align.wrap = g_oDefaultFormat.Align.wrap;
            }
        }
        else
        {
            xfs = this._prepareSetAlign(oItemWithXfs);
            xfs.align.wrap = val;
        }
		return oRes;
	},
	setQuotePrefix : function(oItemWithXfs, val)
	{
        var xfs = oItemWithXfs.xfs;
        var oRes = {newVal: val, oldVal: null};
        if(null != xfs && null != xfs.QuotePrefix)
            oRes.oldVal = xfs.QuotePrefix;
        if(null == val)
        {
            if(null != xfs) {
                xfs = this._prepareSetReference(oItemWithXfs);
                xfs.QuotePrefix = val;
            }
        }
        else
        {
            xfs = this._prepareSet(oItemWithXfs);
            xfs.QuotePrefix = val;
        }
		return oRes;
	},
    setAngle : function(oItemWithXfs, val)
    {
        var xfs = oItemWithXfs.xfs;
		var oRes = {newVal: val, oldVal: null};
		val = AscCommonExcel.angleInterfaceToFormat(val);
        if(null != xfs && null != xfs.align)
            oRes.oldVal = AscCommonExcel.angleFormatToInterface2(xfs.align.angle);
		else
			oRes.oldVal = AscCommonExcel.angleFormatToInterface2(g_oDefaultFormat.Align.angle);
        if(null == val)
        {
            if(null != xfs && null != xfs.align) {
                xfs = this._prepareSetReference(oItemWithXfs);
                xfs.align.angle = g_oDefaultFormat.Align.angle;
            }
        }
        else
        {
            xfs = this._prepareSetAlign(oItemWithXfs);
            xfs.align.angle = val;
        }
        return oRes;
    },
	setVerticalText : function(oItemWithXfs, val)
    {
		if(true == val)
			return this.setAngle(oItemWithXfs, AscCommonExcel.g_nVerticalTextAngle);
		else
			return this.setAngle(oItemWithXfs, 0);
    }
};
var g_oHyperlinkProperties = {
		Ref: 0,
		Location: 1,
		Hyperlink: 2,
		Tooltip: 3
	};
/** @constructor */
function Hyperlink () {
	this.Properties = g_oHyperlinkProperties;
    this.Ref = null;
    this.Hyperlink = null;
    this.Tooltip = null;
	// Составные части Location
	this.Location = null;
	this.LocationSheet = null;
	this.LocationRange = null;
	this.bUpdateLocation = false;
	
	this.bVisited = false;
}
Hyperlink.prototype = {
	clone : function (oNewWs) {
		var oNewHyp = new Hyperlink();
		if (null !== this.Ref)
			oNewHyp.Ref = this.Ref.clone(oNewWs);
		if (null !== this.getLocation())
			oNewHyp.setLocation(this.getLocation());
		if (null !== this.LocationSheet)
			oNewHyp.LocationSheet = this.LocationSheet;
		if (null !== this.LocationRange)
			oNewHyp.LocationRange = this.LocationRange;
		if (null !== this.Hyperlink)
			oNewHyp.Hyperlink = this.Hyperlink;
		if (null !== this.Tooltip)
			oNewHyp.Tooltip = this.Tooltip;
		if (null !== this.bVisited)
			oNewHyp.bVisited = this.bVisited;
		return oNewHyp;
	},
	isEqual : function (obj) {
		var bRes = (this.getLocation() == obj.getLocation() && this.Hyperlink == obj.Hyperlink && this.Tooltip == obj.Tooltip);
		if (bRes) {
			var oBBoxRef = this.Ref.getBBox0();
			var oBBoxObj = obj.Ref.getBBox0();
			bRes = (oBBoxRef.r1 == oBBoxObj.r1 && oBBoxRef.c1 == oBBoxObj.c1 && oBBoxRef.r2 == oBBoxObj.r2 && oBBoxRef.c2 == oBBoxObj.c2);
		}
		return bRes;
	},
	isValid : function () {
		return null != this.Ref && (null != this.getLocation() || null != this.Hyperlink);
	},
	setLocationSheet : function (LocationSheet) {
		this.LocationSheet = LocationSheet;
		this.bUpdateLocation = true;
	},
	setLocationRange : function (LocationRange) {
		this.LocationRange = LocationRange;
		this.bUpdateLocation = true;
	},
	setLocation : function (Location) {
		this.bUpdateLocation = false;
		this.Location = Location;
		this.LocationSheet = this.LocationRange = null;

		if (null !== this.Location) {
			var result = parserHelp.parse3DRef(this.Location);
			if (null !== result) {
				this.LocationSheet = result.sheet;
				this.LocationRange = result.range;
			}
		}
	},
	getLocation : function () {
		if (this.bUpdateLocation)
			this._updateLocation();
		return this.Location;
	},
	_updateLocation : function () {
		this.bUpdateLocation = false;
		if (null === this.LocationSheet || null === this.LocationRange)
			this.Location = null;
		else
			this.Location = parserHelp.get3DRef(this.LocationSheet, this.LocationRange);
	},
	setVisited : function (bVisited) {
		this.bVisited = bVisited;
		if (this.Ref)
			this.Ref.cleanCache();
	},
	getVisited : function () {
		return this.bVisited;
	},
	getHyperlinkType : function () {
		return null !== this.Hyperlink ? Asc.c_oAscHyperlinkType.WebLink : Asc.c_oAscHyperlinkType.RangeLink;
	},
	getType : function () {
		return UndoRedoDataTypes.Hyperlink;
	},
	getProperties : function () {
		return this.Properties;
	},
	getProperty : function (nType) {
		switch (nType) {
			case this.Properties.Ref: return parserHelp.get3DRef(this.Ref.worksheet.getName(), this.Ref.getName()); break;
			case this.Properties.Location: return this.getLocation();break;
			case this.Properties.Hyperlink: return this.Hyperlink;break;
			case this.Properties.Tooltip: return this.Tooltip;break;
		}
	},
	setProperty : function (nType, value) {
		switch (nType) {
			case this.Properties.Ref:
				//todo обработать нули
				var oRefParsed = parserHelp.parse3DRef(value);
				if (null !== oRefParsed) {
					// Получаем sheet по имени
					var ws = window["Asc"]["editor"].wbModel.getWorksheetByName (oRefParsed.sheet);
					if (ws)
						this.Ref = ws.getRange2(oRefParsed.range);
				}
			break;
			case this.Properties.Location: this.setLocation(value);break;
			case this.Properties.Hyperlink: this.Hyperlink = value;break;
			case this.Properties.Tooltip: this.Tooltip = value;break;
		}
	},
	applyCollaborative : function (nSheetId, collaborativeEditing) {
		var bbox = this.Ref.getBBox0();
		var OffsetFirst = {offsetCol:0, offsetRow:0};
		var OffsetLast = {offsetCol:0, offsetRow:0};
		OffsetFirst.offsetRow = collaborativeEditing.getLockMeRow2(nSheetId, bbox.r1) - bbox.r1;
		OffsetFirst.offsetCol = collaborativeEditing.getLockMeColumn2(nSheetId, bbox.c1) - bbox.c1;
		OffsetLast.offsetRow = collaborativeEditing.getLockMeRow2(nSheetId, bbox.r2) - bbox.r2;
		OffsetLast.offsetCol = collaborativeEditing.getLockMeColumn2(nSheetId, bbox.c2) - bbox.c2;
		this.Ref.setOffsetFirst(OffsetFirst);
		this.Ref.setOffsetLast(OffsetLast);
	}
};
/** @constructor */
function SheetFormatPr(){
	this.nBaseColWidth = null;
	this.dDefaultColWidth = null;
	this.oAllRow = null;
}
SheetFormatPr.prototype = {
	clone : function(){
		var oRes = new SheetFormatPr();
		oRes.nBaseColWidth = this.nBaseColWidth;
		oRes.dDefaultColWidth = this.dDefaultColWidth;
		if(null != this.oAllRow)
			oRes.oAllRow = this.oAllRow.clone();
		return oRes;
	}
};
/** @constructor */
function Col(worksheet, index)
{
	this.ws = worksheet;
	this.index = index;
    this.BestFit = null;
    this.hd = null;
    this.CustomWidth = null;
    this.width = null;
    this.xfs = null;
}
Col.prototype =
{
	moveHor : function(nDif)
	{
		this.index += nDif;
	},
	isEqual : function(obj)
	{
		var bRes = this.BestFit == obj.BestFit && this.hd == obj.hd && this.width == obj.width && this.CustomWidth == obj.CustomWidth;
		if(bRes)
		{
			if(null != this.xfs && null != obj.xfs)
				bRes = this.xfs.isEqual(obj.xfs);
			else if(null != this.xfs || null != obj.xfs)
				bRes = false;
		}
		return bRes;
	},
	isEmpty : function()
	{
		return null == this.BestFit && null == this.hd && null == this.width && null == this.xfs && null == this.CustomWidth;
	},
	Remove : function()
	{
		this.ws._removeCol(this.index);
	},
	clone : function(oNewWs)
    {
        if(!oNewWs)
            oNewWs = this.ws;
        var oNewCol = new Col(oNewWs, this.index);
        if(null != this.BestFit)
            oNewCol.BestFit = this.BestFit;
        if(null != this.hd)
            oNewCol.hd = this.hd;
        if(null != this.width)
            oNewCol.width = this.width;
		if(null != this.CustomWidth)
            oNewCol.CustomWidth = this.CustomWidth;
        if(null != this.xfs)
            oNewCol.xfs = this.xfs.clone();
        return oNewCol;
    },
	getWidthProp : function()
	{
		return new AscCommonExcel.UndoRedoData_ColProp(this);
	},
	setWidthProp : function(prop)
	{
		if(null != prop)
		{
			if(null != prop.width)
				this.width = prop.width;
			else
				this.width = null;
			if(null != prop.hd)
				this.hd = prop.hd;
			else
				this.hd = null;
			if(null != prop.CustomWidth)
				this.CustomWidth = prop.CustomWidth;
			else
				this.CustomWidth = null;
			if(null != prop.BestFit)
				this.BestFit = prop.BestFit;
			else
				this.BestFit = null;
		}
	},
	getStyle : function()
	{
		return this.xfs;
	},
	_getUpdateRange: function () {
	    if (AscCommonExcel.g_nAllColIndex == this.index)
	        return new Asc.Range(0, 0, gc_nMaxCol0, gc_nMaxRow0);
	    else
	        return new Asc.Range(this.index, 0, this.index, gc_nMaxRow0);
	},
	setStyle : function(xfs)
	{
		var oldVal = this.xfs;
		var newVal = null;
		this.xfs = null;
		if(null != xfs)
		{
			this.xfs = xfs.clone();
			newVal = xfs;
		}
		if(History.Is_On() && false == ((null == oldVal && null == newVal) || (null != oldVal && null != newVal && true == oldVal.isEqual(newVal))))
		{
			if(null != oldVal)
				oldVal = oldVal.clone();
			if(null != newVal)
				newVal = newVal.clone();
			History.Add(AscCommonExcel.g_oUndoRedoCol, AscCH.historyitem_RowCol_SetStyle, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, false, oldVal, newVal));
		}
	},
	setCellStyle : function(val)
	{
		var newVal = this.ws.workbook.CellStyles._prepareCellStyle(val);
		var oRes = this.ws.workbook.oStyleManager.setCellStyle(this, newVal);
		if(History.Is_On() && oRes.oldVal != oRes.newVal) {
			var oldStyleName = this.ws.workbook.CellStyles.getStyleNameByXfId(oRes.oldVal);
			History.Add(AscCommonExcel.g_oUndoRedoCol, AscCH.historyitem_RowCol_SetCellStyle, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, false, oldStyleName, val));

			// Выставляем стиль
			var oStyle = this.ws.workbook.CellStyles.getStyleByXfId(oRes.newVal);
			if (oStyle.ApplyFont)
				this.setFont(oStyle.getFont());
			if (oStyle.ApplyFill)
				this.setFill(oStyle.getFill());
			if (oStyle.ApplyBorder)
				this.setBorder(oStyle.getBorder());
			if (oStyle.ApplyNumberFormat)
				this.setNumFormat(oStyle.getNumFormatStr());
		}
	},
	setNumFormat : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setNum(this, new Num({f:val}));
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoCol, AscCH.historyitem_RowCol_Num, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, false, oRes.oldVal, oRes.newVal));
	},
	setNum : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setNum(this, val);
		if(History.Is_On() && oRes.oldVal != oRes.newVal)
			History.Add(AscCommonExcel.g_oUndoRedoCol, AscCH.historyitem_RowCol_Num, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, false, oRes.oldVal, oRes.newVal));
	},
	setFont : function(val)
    {
		var oRes = this.ws.workbook.oStyleManager.setFont(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
		{
			var oldVal = null;
			if(null != oRes.oldVal)
				oldVal = oRes.oldVal.clone();
			var newVal = null;
			if(null != oRes.newVal)
				newVal = oRes.newVal.clone();
            History.Add(AscCommonExcel.g_oUndoRedoCol, AscCH.historyitem_RowCol_SetFont, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, false, oldVal, newVal));
		}
	},
	setFontname : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setFontname(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoCol, AscCH.historyitem_RowCol_Fontname, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, false, oRes.oldVal, oRes.newVal));
	},
	setFontsize : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setFontsize(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoCol, AscCH.historyitem_RowCol_Fontsize, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, false, oRes.oldVal, oRes.newVal));
	},
	setFontcolor : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setFontcolor(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoCol, AscCH.historyitem_RowCol_Fontcolor, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, false, oRes.oldVal, oRes.newVal));
	},
	setBold : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setBold(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoCol, AscCH.historyitem_RowCol_Bold, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, false, oRes.oldVal, oRes.newVal));
	},
	setItalic : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setItalic(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoCol, AscCH.historyitem_RowCol_Italic, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, false, oRes.oldVal, oRes.newVal));
	},
	setUnderline : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setUnderline(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoCol, AscCH.historyitem_RowCol_Underline, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, false, oRes.oldVal, oRes.newVal));
	},
	setStrikeout : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setStrikeout(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoCol, AscCH.historyitem_RowCol_Strikeout, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, false, oRes.oldVal, oRes.newVal));
	},
	setFontAlign : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setFontAlign(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoCol, AscCH.historyitem_RowCol_FontAlign, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, false, oRes.oldVal, oRes.newVal));
	},
	setAlignVertical : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setAlignVertical(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoCol, AscCH.historyitem_RowCol_AlignVertical, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, false, oRes.oldVal, oRes.newVal));
	},
	setAlignHorizontal : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setAlignHorizontal(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoCol, AscCH.historyitem_RowCol_AlignHorizontal, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, false, oRes.oldVal, oRes.newVal));
	},
	setFill : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setFill(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoCol, AscCH.historyitem_RowCol_Fill, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, false, oRes.oldVal, oRes.newVal));
	},
	setBorder : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setBorder(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
		{
			var oldVal = null;
			if(null != oRes.oldVal)
				oldVal = oRes.oldVal.clone();
			var newVal = null;
			if(null != oRes.newVal)
				newVal = oRes.newVal.clone();
            History.Add(AscCommonExcel.g_oUndoRedoCol, AscCH.historyitem_RowCol_Border, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, false, oldVal, newVal));
		}
	},
	setShrinkToFit : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setShrinkToFit(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoCol, AscCH.historyitem_RowCol_ShrinkToFit, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, false, oRes.oldVal, oRes.newVal));
	},
	setWrap : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setWrap(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoCol, AscCH.historyitem_RowCol_Wrap, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, false, oRes.oldVal, oRes.newVal));
	},
    setAngle : function(val)
    {
        var oRes = this.ws.workbook.oStyleManager.setAngle(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoCol, AscCH.historyitem_RowCol_Angle, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, false, oRes.oldVal, oRes.newVal));
    },
	setVerticalText : function(val)
	{
        var oRes = this.ws.workbook.oStyleManager.setVerticalText(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoCol, AscCH.historyitem_RowCol_Angle, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, false, oRes.oldVal, oRes.newVal));
	}
};
var g_nRowFlag_empty = 0;
var g_nRowFlag_hd = 1;
var g_nRowFlag_CustomHeight = 2;
var g_nRowFlag_CalcHeight = 4;
/**
 * @constructor
 */
function Row(worksheet)
{
	this.ws = worksheet;
	this.c = {};
	this.index = null;
    this.xfs = null;
    this.h = null;
	this.flags = g_nRowFlag_empty;
}
Row.prototype =
{
	getCells : function () {
		return this.c;
	},
	create : function(row)
	{
		this.index = row - 1;
		this.xfs = null;
	},
	moveVer : function(nDif)
	{
		this.index += nDif;
	},
	isEmpty : function()
	{
		if(!this.isEmptyProp())
			return false;
		var bEmptyCells = true;
		for(var i in this.c)
		{
			bEmptyCells = false;
			break;
		}
		if(false == bEmptyCells)
			return false;
		return true;
	},
	isEmptyProp : function()
	{
		return null == this.xfs && null == this.h && g_nRowFlag_empty == this.flags;
	},
	Remove : function()
	{
		this.ws._removeRow(this.index);
	},
	clone : function(oNewWs, renameParams)
	{
        if(!oNewWs)
            oNewWs = this.ws;
        var oNewRow = new Row(oNewWs);
		oNewRow.index = this.index;
		oNewRow.flags = this.flags;
		if(null != this.xfs)
			oNewRow.xfs = this.xfs.clone();
		if(null != this.h)
			oNewRow.h = this.h;
		for(var i in this.c)
			oNewRow.c[i] = this.c[i].clone(oNewWs, renameParams);
		return oNewRow;
	},
	getDefaultXfs : function()
	{
		var oRes = null;
		if(null != this.ws.oAllCol && null != this.ws.oAllCol.xfs)
			oRes = this.ws.oAllCol.xfs.clone();
		return oRes;
	},
	getHeightProp : function()
	{
		return new AscCommonExcel.UndoRedoData_RowProp(this);
	},
	setHeightProp : function(prop)
	{
		if(null != prop)
		{
			if(null != prop.h)
				this.h = prop.h;
			else
				this.h = null;
			if(true == prop.hd)
				this.flags |= g_nRowFlag_hd;
			else
				this.flags &= ~g_nRowFlag_hd;
			if(true == prop.CustomHeight)
				this.flags |= g_nRowFlag_CustomHeight;
			else
				this.flags &= ~g_nRowFlag_CustomHeight;
		}
	},
	copyProperty : function(otherRow)
	{
		if(null != otherRow.xfs)
			this.xfs = otherRow.xfs.clone();
		else
			this.xfs = null;
		this.h = otherRow.h;
		this.flags = otherRow.flags;
	},
	getStyle : function()
	{
		return this.xfs;
	},
	_getUpdateRange: function () {
	    if (AscCommonExcel.g_nAllRowIndex == this.index)
	        return new Asc.Range(0, 0, gc_nMaxCol0, gc_nMaxRow0);
	    else
	        return new Asc.Range(0, this.index, gc_nMaxCol0, this.index);
	},
	setStyle : function(xfs)
	{
		var oldVal = this.xfs;
		var newVal = null;
		this.xfs = null;
		if(null != xfs)
		{
			this.xfs = xfs.clone();
			newVal = xfs;
		}
		if(History.Is_On() && false == ((null == oldVal && null == newVal) || (null != oldVal && null != newVal && true == oldVal.isEqual(newVal))))
		{
			if(null != oldVal)
				oldVal = oldVal.clone();
			if(null != newVal)
				newVal = newVal.clone();
			History.Add(AscCommonExcel.g_oUndoRedoRow, AscCH.historyitem_RowCol_SetStyle, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, true, oldVal, newVal));
		}
	},
	setCellStyle : function(val)
	{
		var newVal = this.ws.workbook.CellStyles._prepareCellStyle(val);
		var oRes = this.ws.workbook.oStyleManager.setCellStyle(this, newVal);
		if(History.Is_On() && oRes.oldVal != oRes.newVal) {
			var oldStyleName = this.ws.workbook.CellStyles.getStyleNameByXfId(oRes.oldVal);
			History.Add(AscCommonExcel.g_oUndoRedoRow, AscCH.historyitem_RowCol_SetCellStyle, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, true, oldStyleName, val));

			// Выставляем стиль
			var oStyle = this.ws.workbook.CellStyles.getStyleByXfId(oRes.newVal);
			if (oStyle.ApplyFont)
				this.setFont(oStyle.getFont());
			if (oStyle.ApplyFill)
				this.setFill(oStyle.getFill());
			if (oStyle.ApplyBorder)
				this.setBorder(oStyle.getBorder());
			if (oStyle.ApplyNumberFormat)
				this.setNumFormat(oStyle.getNumFormatStr());
		}
	},
	setNumFormat : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setNum(this, new Num({f:val}));
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoRow, AscCH.historyitem_RowCol_Num, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, true, oRes.oldVal, oRes.newVal));
	},
	setNum : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setNum(this, val);
		if(History.Is_On() && oRes.oldVal != oRes.newVal)
			History.Add(AscCommonExcel.g_oUndoRedoRow, AscCH.historyitem_RowCol_Num, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, true, oRes.oldVal, oRes.newVal));
	},
	setFont : function(val)
    {
		var oRes = this.ws.workbook.oStyleManager.setFont(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
		{
			var oldVal = null;
			if(null != oRes.oldVal)
				oldVal = oRes.oldVal.clone();
			var newVal = null;
			if(null != oRes.newVal)
				newVal = oRes.newVal.clone();
            History.Add(AscCommonExcel.g_oUndoRedoRow, AscCH.historyitem_RowCol_SetFont, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, true, oldVal, newVal));
		}
	},
	setFontname : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setFontname(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoRow, AscCH.historyitem_RowCol_Fontname, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, true, oRes.oldVal, oRes.newVal));
	},
	setFontsize : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setFontsize(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoRow, AscCH.historyitem_RowCol_Fontsize, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, true, oRes.oldVal, oRes.newVal));
	},
	setFontcolor : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setFontcolor(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoRow, AscCH.historyitem_RowCol_Fontcolor, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, true, oRes.oldVal, oRes.newVal));
	},
	setBold : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setBold(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoRow, AscCH.historyitem_RowCol_Bold, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, true, oRes.oldVal, oRes.newVal));
	},
	setItalic : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setItalic(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoRow, AscCH.historyitem_RowCol_Italic, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, true, oRes.oldVal, oRes.newVal));
	},
	setUnderline : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setUnderline(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoRow, AscCH.historyitem_RowCol_Underline, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, true, oRes.oldVal, oRes.newVal));
	},
	setStrikeout : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setStrikeout(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoRow, AscCH.historyitem_RowCol_Strikeout, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, true, oRes.oldVal, oRes.newVal));
	},
	setFontAlign : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setFontAlign(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoRow, AscCH.historyitem_RowCol_FontAlign, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, true, oRes.oldVal, oRes.newVal));
	},
	setAlignVertical : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setAlignVertical(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoRow, AscCH.historyitem_RowCol_AlignVertical, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, true, oRes.oldVal, oRes.newVal));
	},
	setAlignHorizontal : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setAlignHorizontal(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoRow, AscCH.historyitem_RowCol_AlignHorizontal, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, true, oRes.oldVal, oRes.newVal));
	},
	setFill : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setFill(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoRow, AscCH.historyitem_RowCol_Fill, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, true, oRes.oldVal, oRes.newVal));
	},
	setBorder : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setBorder(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
		{
			var oldVal = null;
			if(null != oRes.oldVal)
				oldVal = oRes.oldVal.clone();
			var newVal = null;
			if(null != oRes.newVal)
				newVal = oRes.newVal.clone();
            History.Add(AscCommonExcel.g_oUndoRedoRow, AscCH.historyitem_RowCol_Border, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, true, oldVal, newVal));
		}
	},
	setShrinkToFit : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setShrinkToFit(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoRow, AscCH.historyitem_RowCol_ShrinkToFit, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, true, oRes.oldVal, oRes.newVal));
	},
	setWrap : function(val)
	{
		var oRes = this.ws.workbook.oStyleManager.setWrap(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoRow, AscCH.historyitem_RowCol_Wrap, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, true, oRes.oldVal, oRes.newVal));
	},
    setAngle: function(val)
    {
        var oRes = this.ws.workbook.oStyleManager.setAngle(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoRow, AscCH.historyitem_RowCol_Angle, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, true, oRes.oldVal, oRes.newVal));
    },
	setVerticalText : function(val)
	{
        var oRes = this.ws.workbook.oStyleManager.setVerticalText(this, val);
        if(History.Is_On() && oRes.oldVal != oRes.newVal)
            History.Add(AscCommonExcel.g_oUndoRedoRow, AscCH.historyitem_RowCol_Angle, this.ws.getId(), this._getUpdateRange(), new UndoRedoData_IndexSimpleProp(this.index, true, oRes.oldVal, oRes.newVal));
	},

	getHidden: function()
	{
		return 0 != (AscCommonExcel.g_nRowFlag_hd & this.flags);
	}
};
var g_oCCellValueMultiTextProperties = {
		text: 0,
		format: 1
	};
function CCellValueMultiText()
{
	this.Properties = g_oCCellValueMultiTextProperties;
	this.text = null;
	this.format = null;
}
CCellValueMultiText.prototype = 
{
	isEqual : function(val)
	{
		if(null == val)
			return false;
		return this.text == val.text && ((null == this.format && null == val.format) || (null != this.format && null != val.format && this.format.isEqual(val.format)));
	},
	clone : function()
	{
		var oRes = new CCellValueMultiText();
		if(null != this.text)
			oRes.text = this.text;
		if(null != this.format)
			oRes.format = this.format.clone();
		return oRes;
	},
	getType : function()
	{
		return UndoRedoDataTypes.ValueMultiTextElem;
	},
	getProperties : function()
	{
		return this.Properties;
	},
	getProperty : function(nType)
	{
		switch(nType)
		{
			case this.Properties.text: return this.text;break;
			case this.Properties.format: return this.format;break;
		}
	},
	setProperty : function(nType, value)
	{
		switch(nType)
		{
			case this.Properties.text: this.text = value;break;
			case this.Properties.format: this.format = value;break;
		}
	}
};
var g_oCCellValueProperties = {
		text: 0,
		multiText: 1,
		number: 2,
		type: 3
	};
function CCellValue()
{
	this.Properties = g_oCCellValueProperties;
	
	this.text = null;
	this.multiText = null;
	this.number = null;
	this.type = CellValueType.Number;
	//cache
	this.textValue = null;
	this.aTextValue2 = [];
	this.textValueForEdit = null;
	this.textValueForEdit2 = null;
}
CCellValue.prototype = 
{
	isEmpty : function()
	{
		if(null != this.number || (null != this.text && "" != this.text))
			return false;
		if(null != this.multiText && "" != this.getStringFromMultiText())
			return false;
		return true;
	},
	isEqual : function(val)
	{
		if(null == val)
			return false;
		if(this.text != val.text)
			return false;
		if(this.number != val.number)
			return false;
		if(this.type != val.type)
			return false;
		if(null != this.multiText && null != val.multiText)
		{
			if(this.multiText.length == val.multiText.length)
			{
				for(var i = 0, length = this.multiText.length; i < length; ++i)
				{
					if(false == this.multiText[i].isEqual(val.multiText[i]))
						return false;
				}
				return true;
			}
			return false;
		}
		else if(null == this.multiText && null == val.multiText)
			return true;
		
		return false;
	},
	clean : function()
	{
		this.text = null;
		this.multiText = null;
		this.number = null;
		this.type = CellValueType.Number;
		this.cleanCache();
	},
	clone : function()
	{
		var oRes = new CCellValue();
		if(null != this.text)
			oRes.text = this.text;
		if(null != this.multiText)
			oRes.multiText = this._cloneMultiText();
		if(null != this.number)
			oRes.number = this.number;
		if(null != this.type)
			oRes.type = this.type;
		return oRes;
	},
	cleanCache : function()
	{
		this.textValue = null;
		this.aTextValue2 = [];
		this.textValueForEdit = null;
		this.textValueForEdit2 = null;
	},
	getStringFromMultiText: function () {
	    var sRes = "";
	    if (null != this.multiText) {
	        for (var i = 0, length = this.multiText.length; i < length; ++i) {
	            var elem = this.multiText[i];
	            if (null != elem.text)
	                sRes += elem.text;
	        }
	    }
	    return sRes;
	},
	makeSimpleText : function()
	{
		var bRes = false;
		if(null != this.multiText)
		{
		    this.text = this.getStringFromMultiText();
		    this.multiText = null;
			bRes = true;
		}
		return bRes;
	},
	getValueWithoutFormat : function()
	{
		//применяем форматирование
		var sResult = "";
		if(null != this.number)
		{
			if(CellValueType.Bool == this.type)
				sResult = this.number == 1 ? cBoolLocal["t"].toUpperCase() : cBoolLocal["f"].toUpperCase();
			else
				sResult = this.number.toString();
		}
		else if(null != this.text)
			sResult = this.text;
		else if(null != this.multiText)
		    sResult = this.getStringFromMultiText();
		return sResult;
	},
	getNumberValue : function()
	{
		return this.number;
	},
	getValue : function(cell)
	{
		if(null == this.textValue)
		{
			this.getValue2(cell, gc_nMaxDigCountView, function(){return true;});
			this.textValue = this._textArrayToString(this.aTextValue2[gc_nMaxDigCountView]);
		}
		return this.textValue;
	},
	_textArrayToString: function(aText) {
		var res = '';
		for (var i = 0, length = aText.length; i < length; ++i) {
			var elem = aText[i];
			if (elem.format && elem.format.getSkip() == false) {
				res += elem.text;
			}
		}
		return res;
	},
	getValueForEdit : function(cell)
	{
		if(null == this.textValueForEdit)
		{
			this.getValueForEdit2(cell);
			this.textValueForEdit = "";
			for(var i = 0, length = this.textValueForEdit2.length; i < length; ++i)
				this.textValueForEdit += this.textValueForEdit2[i].text;
		}
//		if( CellValueType.Error == this.type ){
//			return this._getValueTypeError(this.textValueForEdit);
//		}
		return this.textValueForEdit;
	},
	getValue2 : function(cell, dDigitsCount, fIsFitMeasurer)
	{
		var aRes = null;
		if(null != this.aTextValue2[dDigitsCount])
			aRes = this.aTextValue2[dDigitsCount];
		if(null == aRes)
		{
			aRes = this._getValue2(cell, dDigitsCount, fIsFitMeasurer);
			var formula = cell.getFormula();
			if( formula ){
				aRes[0].sFormula = formula;
				aRes[0].sId = cell.getName();
			}
			
			this.aTextValue2[dDigitsCount] = aRes;
		}
		return aRes;
	},
	getValueForExample : function(cell, dDigitsCount, fIsFitMeasurer, numFormat, cultureInfo)
	{
		var aText = this._getValue2(cell, dDigitsCount, fIsFitMeasurer, numFormat, cultureInfo);
		return this._textArrayToString(aText);
	},
	_getValue2: function(cell, dDigitsCount, fIsFitMeasurer, opt_numFormat, opt_cultureInfo) {
		var aRes = null;
		var bNeedMeasure = true;
		var sText = null;
		var aText = null;
		var isMultyText = false;
		if (CellValueType.Number == this.type || CellValueType.String == this.type) {
			if (null != this.text) {
				sText = this.text;
			} else if (null != this.multiText) {
				aText = this.multiText;
				isMultyText = true;
			}

			if (CellValueType.String == this.type) {
				bNeedMeasure = false;
			}
			var oNumFormat;
			if (opt_numFormat) {
				oNumFormat = opt_numFormat;
			} else {
				var xfs = cell.getCompiledStyle();
				if (null != xfs && null != xfs.num) {
					oNumFormat = oNumFormatCache.get(xfs.num.getFormat());
				} else {
					oNumFormat = oNumFormatCache.get(g_oDefaultFormat.Num.getFormat());
				}
			}

			if (false == oNumFormat.isGeneralFormat()) {
				if (null != this.number) {
					aText = oNumFormat.format(this.number, this.type, dDigitsCount, false, opt_cultureInfo);
					isMultyText = false;
					sText = null;
				} else if (CellValueType.String == this.type) {
					var oTextFormat = oNumFormat.getTextFormat();
					if (null != oTextFormat && "@" != oTextFormat.formatString) {
						if (null != this.text) {
							aText = oNumFormat.format(this.text, this.type, dDigitsCount, false, opt_cultureInfo);
							isMultyText = false;
							sText = null;
						} else if (null != this.multiText) {
							var sSimpleString = this.getStringFromMultiText();
							aText = oNumFormat.format(sSimpleString, this.type, dDigitsCount, false, opt_cultureInfo);
							isMultyText = false;
							sText = null;
						}
					}
				}
			} else if (CellValueType.Number == this.type && null != this.number) {
				bNeedMeasure = false;
				var bFindResult = false;
				//варируем dDigitsCount чтобы результат влез в ячейку
				var nTempDigCount = Math.ceil(dDigitsCount);
				var sOriginText = this.number;
				while (nTempDigCount >= 1) {
					//Строим подходящий general format
					var sGeneral = AscCommon.DecodeGeneralFormat(sOriginText, this.type, nTempDigCount);
					if (null != sGeneral) {
						oNumFormat = oNumFormatCache.get(sGeneral);
					}

					if (null != oNumFormat) {
						sText = null;
						isMultyText = false;
						aText = oNumFormat.format(sOriginText, this.type, dDigitsCount, false, opt_cultureInfo);
						if (true == oNumFormat.isTextFormat()) {
							break;
						} else {
							aRes = this._getValue2Result(cell, sText, aText, isMultyText);
							//Проверяем влезает ли текст
							if (true == fIsFitMeasurer(aRes)) {
								bFindResult = true;
								break;
							}
							aRes = null;
						}
					}
					nTempDigCount--;
				}
				if (false == bFindResult) {
					aRes = null;
					sText = null;
					isMultyText = false;
					var font = new AscCommonExcel.Font();
					if (dDigitsCount > 1) {
						font.setRepeat(true);
						aText = [{text: "#", format: font}];
					} else {
						aText = [{text: "", format: font}];
					}
				}
			}
		} else if (CellValueType.Bool == this.type) {
			if (null != this.number) {
				sText = (0 != this.number) ? cBoolLocal["t"].toUpperCase() : cBoolLocal["f"].toUpperCase();
			}
		} else if (CellValueType.Error == this.type) {
			if (null != this.text) {
				sText = this._getValueTypeError(this.text);
			}
		}
		if (bNeedMeasure) {
			aRes = this._getValue2Result(cell, sText, aText, isMultyText);
			//Проверяем влезает ли текст
			if (false == fIsFitMeasurer(aRes)) {
				aRes = null;
				sText = null;
				isMultyText = false;
				var font = new AscCommonExcel.Font();
				font.setRepeat(true);
				aText = [{text: "#", format: font}];
			}
		}
		if (null == aRes) {
			aRes = this._getValue2Result(cell, sText, aText, isMultyText);
		}
		return aRes;
	},
	getValueForEdit2: function (cell, cultureInfo)
	{
	    if (null == cultureInfo)
	        cultureInfo = AscCommon.g_oDefaultCultureInfo;
		if(null == this.textValueForEdit2)
		{
			//todo проблема точности. в excel у чисел только 15 значащих цифр у нас больше.
			//применяем форматирование
			var oValueText = null;
			var oValueArray = null;
			var xfs = cell.getCompiledStyle();
			if(cell.formulaParsed)
				oValueText = "="+cell.formulaParsed.assembleLocale(AscCommonExcel.cFormulaFunctionToLocale,true);	// ToDo если будет притормаживать, то завести переменную и не рассчитывать каждый раз!
			else
			{
				if(null != this.text || null != this.number)
				{
					if (CellValueType.Bool == this.type && null != this.number)
						oValueText = (this.number == 1) ? cBoolLocal["t"].toUpperCase() : cBoolLocal["f"].toUpperCase();
					else
					{
						if(null != this.text)
							oValueText = this.text;
						if(CellValueType.Number == this.type || CellValueType.String == this.type)
						{
							var oNumFormat;
							if(null != xfs && null != xfs.num)
								oNumFormat = oNumFormatCache.get(xfs.num.getFormat());
							else
								oNumFormat = oNumFormatCache.get(g_oDefaultFormat.Num.getFormat());
							if(CellValueType.String != this.type && null != oNumFormat && null != this.number)
							{
								var nValue = this.number;
								var oTargetFormat = oNumFormat.getFormatByValue(nValue);
								if(oTargetFormat)
								{
									if(1 == oTargetFormat.nPercent)
									{
										//prercent
										oValueText = AscCommon.oGeneralEditFormatCache.format(nValue * 100) + "%";
									}
									else if(oTargetFormat.bDateTime)
									{
										//Если число не подходит под формат даты возвращаем само число
										if(false == oTargetFormat.isInvalidDateValue(nValue))
										{
											var bDate = oTargetFormat.bDate;
											var bTime = oTargetFormat.bTime;
											if(false == bDate && nValue >= 1)
												bDate = true;
											if(false == bTime && Math.floor(nValue) != nValue)
											    bTime = true;
											var sDateFormat = "";
											if (bDate) {
												sDateFormat = AscCommon.getShortDateFormat(cultureInfo);
											}
                                            var sTimeFormat = 'h:mm:ss';
                                            if (cultureInfo.AMDesignator.length > 0 && cultureInfo.PMDesignator.length > 0){
                                                sTimeFormat += ' AM/PM';
                                            }
											if(bDate && bTime)
											    oNumFormat = oNumFormatCache.get(sDateFormat + ' ' + sTimeFormat);
											else if(bTime)
												oNumFormat = oNumFormatCache.get(sTimeFormat);
											else
											    oNumFormat = oNumFormatCache.get(sDateFormat);
											
											var aFormatedValue = oNumFormat.format(nValue, CellValueType.Number, AscCommon.gc_nMaxDigCount);
											oValueText = "";
											for(var i = 0, length = aFormatedValue.length; i < length; ++i)
												oValueText += aFormatedValue[i].text;
										}
										else
											oValueText = AscCommon.oGeneralEditFormatCache.format(nValue);
									}
									else
										oValueText = AscCommon.oGeneralEditFormatCache.format(nValue);
								}
							}
						}
					}
				}
				else if(this.multiText)
					oValueArray = this.multiText;
			}
			if(null != xfs && true == xfs.QuotePrefix && CellValueType.String == this.type && false == cell.isFormula())
			{
				if(null != oValueText)
					oValueText = "'" + oValueText;
				else if(null != oValueArray)
					oValueArray = [{text:"'"}].concat(oValueArray);
			}
			this.textValueForEdit2 = this._getValue2Result(cell, oValueText, oValueArray, true);
		}
		return this.textValueForEdit2;
	},
	_getValue2Result : function(cell, sText, aText, isMultyText)
	{
		var aResult = [];
		if(null == sText && null == aText)
			sText = "";
		var color;
		var cellfont;
		var xfs = cell.getCompiledStyle();
		if(null != xfs && null != xfs.font)
			cellfont = xfs.font;
		else
			cellfont = g_oDefaultFormat.Font;
		if(null != sText){
			var oNewItem = new Fragment();
			oNewItem.text = sText;
			oNewItem.format = cellfont.clone();
			color = oNewItem.format.getColor();
			if(color instanceof ThemeColor)
			{
				//для посещенных гиперссылок
				if(g_nColorHyperlink == color.theme && null == color.tint)
				{
					var hyperlink = cell.ws.hyperlinkManager.getByCell(cell.nRow, cell.nCol);
					if(null != hyperlink && hyperlink.data.getVisited())
					{
						oNewItem.format.setColor(g_oColorManager.getThemeColor(g_nColorHyperlinkVisited, null));
					}
				}
			}
			oNewItem.format.setSkip(false);
			oNewItem.format.setRepeat(false);
			aResult.push(oNewItem);
		} else if(null != aText){
			for(var i = 0; i < aText.length; i++){
				var oNewItem = new Fragment();
				var oCurtext = aText[i];
				if(null != oCurtext.text)
				{
					oNewItem.text = oCurtext.text;
					var oCurFormat = new Font();
					if (isMultyText) {
						if (null != oCurtext.format) {
							oCurFormat.assign(oCurtext.format);
						} else {
							oCurFormat.assign(cellfont);
						}
					} else {
						oCurFormat.assign(cellfont);
						if (null != oCurtext.format) {
							oCurFormat.assignFromObject(oCurtext.format);
						}
					}
					oNewItem.format = oCurFormat;
					color = oNewItem.format.getColor();
					if(color instanceof ThemeColor)
					{
						//для посещенных гиперссылок
						if(g_nColorHyperlink == color.theme && null == color.tint)
						{
							var hyperlink = cell.ws.hyperlinkManager.getByCell(cell.nRow, cell.nCol);
							if(null != hyperlink && hyperlink.data.getVisited())
							{
								oNewItem.format.setColor(g_oColorManager.getThemeColor(g_nColorHyperlinkVisited, null));
							}
						}
					}
					aResult.push(oNewItem);
				}
			}
		}
		return aResult;
	},
	setValue : function(cell, val)
	{
		this.clean();

		function checkCellValueTypeError(sUpText){
			switch (sUpText){
				case cErrorLocal["nil"]:
					return cErrorOrigin["nil"];
					break;
				case cErrorLocal["div"]:
					return cErrorOrigin["div"];
					break;
				case cErrorLocal["value"]:
					return cErrorOrigin["value"];
					break;
				case cErrorLocal["ref"]:
					return cErrorOrigin["ref"];
					break;
				case cErrorLocal["name"]:
				case cErrorLocal["name"].replace('\\', ''): // ToDo это неправильная правка для бага 32463 (нужно переделать parse формул)
					return cErrorOrigin["name"];
					break;
				case cErrorLocal["num"]:
					return cErrorOrigin["num"];
					break;
				case cErrorLocal["na"]:
					return cErrorOrigin["na"];
					break;
				case cErrorLocal["getdata"]:
					return cErrorOrigin["getdata"];
					break;
				case cErrorLocal["uf"]:
					return cErrorOrigin["uf"];
					break;
			}
			return false;
		}

		if("" == val)
			return;
		var oNumFormat;
		var xfs = cell.getCompiledStyle();
		if(null != xfs && null != xfs.num)
			oNumFormat = oNumFormatCache.get(xfs.num.getFormat());
		else
			oNumFormat = oNumFormatCache.get(g_oDefaultFormat.Num.getFormat());
		if(oNumFormat.isTextFormat())
		{
			this.type = CellValueType.String;
			this.text = val;
		}
		else
		{
		    if (AscCommon.g_oFormatParser.isLocaleNumber(val))
			{
				this.type = CellValueType.Number;
				this.number = AscCommon.g_oFormatParser.parseLocaleNumber(val);
			}
			else
			{
				var sUpText = val.toUpperCase();
				if(cBoolLocal["t"].toUpperCase() == sUpText || cBoolLocal["f"].toUpperCase() == sUpText)
				{
					this.type = CellValueType.Bool;
					this.number = (cBoolLocal["t"].toUpperCase() == sUpText) ? 1 : 0;
				}
//				else if( "#NULL!" == sUpText || "#DIV/0!" == sUpText || "#NAME?" == sUpText || "#NUM!" == sUpText ||
//					"#N/A" == sUpText || "#REF!" == sUpText || "#VALUE!" == sUpText )
				else if(checkCellValueTypeError(sUpText))
				{
					this.type = CellValueType.Error;
					this.text = checkCellValueTypeError(sUpText);
				}
				else
				{
					//распознаем формат
					var res = AscCommon.g_oFormatParser.parse(val);
					if(null != res)
					{
						//Сравниваем с текущим форматом, если типы совпадают - меняем только значение ячейки
						var nFormatType = oNumFormat.getType();
						if(!((c_oAscNumFormatType.Percent == nFormatType && res.bPercent) ||
							(c_oAscNumFormatType.Currency == nFormatType && res.bCurrency) ||
							(c_oAscNumFormatType.Date == nFormatType && res.bDate) ||
							(c_oAscNumFormatType.Time == nFormatType && res.bTime)) && res.format != oNumFormat.sFormat)
							cell.setNumFormat(res.format);
						this.number = res.value;
						this.type = CellValueType.Number;
					}
					else
					{
						this.type = CellValueType.String;
						//проверяем QuotePrefix
						if(val.length > 0 && "'" == val[0])
						{
							cell.setQuotePrefix(true);
							val = val.substring(1);
						}
						this.text = val;
					}
				}
			}
		}
    if (/(^(((http|https|ftp):\/\/)|(mailto:)|(www.)))|@/i.test(val)) {
      // Удаляем концевые пробелы и переводы строки перед проверкой гиперссылок
      val = val.replace(/\s+$/, '');
      var typeHyp = AscCommon.getUrlType(val);
      if (AscCommon.c_oAscUrlType.Invalid != typeHyp) {
        val = AscCommon.prepareUrl(val, typeHyp);

        var oNewHyperlink = new Hyperlink();
        oNewHyperlink.Ref = cell.ws.getCell3(cell.nRow, cell.nCol);
        oNewHyperlink.Hyperlink = val;
        oNewHyperlink.Ref.setHyperlink(oNewHyperlink);
      }
    }
	},
	setValue2 : function(cell, aVal)
	{
		var sSimpleText = "";
		for(var i = 0, length = aVal.length; i < length; ++i)
			sSimpleText += aVal[i].text;
		this.setValue(cell, sSimpleText);
		var nRow = cell.nRow;
		var nCol = cell.nCol;
		if(CellValueType.String == this.type && null == cell.ws.hyperlinkManager.getByCell(nRow, nCol))
		{
			this.clean();
			this.type = CellValueType.String;
			//проверяем можно ли перевести массив в простую строку.
			if(aVal.length > 0)
			{
				this.multiText = [];
				for(var i = 0, length = aVal.length; i < length; i++){
					var item = aVal[i];
					var oNewElem = new CCellValueMultiText();
					oNewElem.text = item.text;
					if (null != item.format) {
						oNewElem.format = new Font();
						oNewElem.format.assign(item.format);
					}
					this.multiText.push(oNewElem);
				}
				this.minimizeMultiText(cell, true);
			}
			//обрабатываем QuotePrefix
			if(null != this.text)
			{
				if(this.text.length > 0 && "'" == this.text[0])
				{
					cell.setQuotePrefix(true);
					this.text = this.text.substring(1);
				}
			}
			else if(null != this.multiText)
			{
				if(this.multiText.length > 0)
				{
					var oFirstItem = this.multiText[0];
					if(null != oFirstItem.text && oFirstItem.text.length > 0 && "'" == oFirstItem.text[0])
					{
						cell.setQuotePrefix(true);
						if(1 != oFirstItem.text.length)
							oFirstItem.text = oFirstItem.text.substring(1);
						else
						{
							this.multiText.shift();
							if(0 == this.multiText.length)
							{
								this.multiText = null;
								this.text = "";
							}
						}
					}
				}
			}
		}
	},
	_cloneMultiText : function()
	{
		var oRes = [];
		for(var i = 0, length = this.multiText.length; i < length; ++i)
			oRes.push(this.multiText[i].clone());
		return oRes;
	},
	minimizeMultiText : function(cell, bSetCellFont)
	{
		var bRes = false;
		if(null != this.multiText && this.multiText.length > 0)
		{
		    var cellFont = cell.getFont();
		    var oIntersectFont = null;
		    for (var i = 0, length = this.multiText.length; i < length; i++) {
		        var elem = this.multiText[i];
			    if (null != elem.format) {
			        if (null == oIntersectFont)
			            oIntersectFont = elem.format.clone();
			        oIntersectFont.intersect(elem.format, cellFont);
			    }
			    else {
			        oIntersectFont = cellFont;
			        break;
			    }
			}

			if(bSetCellFont)
			{
			    if (oIntersectFont.isEqual(g_oDefaultFormat.Font))
					cell.setFont(null, false);
				else
					cell.setFont(oIntersectFont, false);
			}
			//если у всех элементов один формат, то сохраняем только текст
			var bIsEqual = true;
			for (var i = 0, length = this.multiText.length; i < length; i++)
			{
			    var elem = this.multiText[i];
			    if (null != elem.format && false == oIntersectFont.isEqual(elem.format))
				{
					bIsEqual = false;
					break;
				}
			}
			if(bIsEqual)
			{
				this.makeSimpleText();
				bRes = true;
			}
		}
		return bRes;
	},
	_setFontProp : function(cell, fCheck, fAction)
	{
		var bRes = false;
		if(null != this.multiText)
		{
			//проверяем поменяются ли свойства
			var bChange = false;
			for(var i = 0, length = this.multiText.length; i < length; ++i)
			{
			    var elem = this.multiText[i];
			    if (null != elem.format && true == fCheck(elem.format))
				{
					bChange = true;
					break;
				}
			}
			if(bChange)
			{
				var backupObj = cell.getValueData();
				for (var i = 0, length = this.multiText.length; i < length; ++i) {
				    var elem = this.multiText[i];
				    if (null != elem.format)
				        fAction(elem.format)
				}
				//пробуем преобразовать в простую строку
				if(this.minimizeMultiText(cell, false))
				{
					var DataNew = cell.getValueData();
					History.Add(AscCommonExcel.g_oUndoRedoCell, AscCH.historyitem_Cell_ChangeValue, cell.ws.getId(), new Asc.Range(cell.nCol, cell.nRow, cell.nCol, cell.nRow), new UndoRedoData_CellSimpleData(cell.nRow,cell.nCol, backupObj, DataNew));
				}
				else
				{
					var DataNew = this._cloneMultiText();
					History.Add(AscCommonExcel.g_oUndoRedoCell, AscCH.historyitem_Cell_ChangeArrayValueFormat, cell.ws.getId(), new Asc.Range(cell.nCol, cell.nRow, cell.nCol, cell.nRow), new UndoRedoData_CellSimpleData(cell.nRow, cell.nCol, backupObj.value.multiText, DataNew));
				}
			}
			bRes = true;
		}
		return bRes;
	},
	setFontname : function(cell, val)
	{
		return this._setFontProp(cell, function(format){return val != format.getName();}, function(format){format.setName(val);});
	},
	setFontsize : function(cell, val)
	{
		return this._setFontProp(cell, function(format){return val != format.getSize();}, function(format){format.setSize(val);});
	},
	setFontcolor : function(cell, val)
	{
		return this._setFontProp(cell, function(format){return val != format.getColor();}, function(format){format.setColor(val);});
	},
	setBold : function(cell, val)
	{
		return this._setFontProp(cell, function(format){return val != format.getBold();}, function(format){format.setBold(val);});
	},
	setItalic : function(cell, val)
	{
		return this._setFontProp(cell, function(format){return val != format.getItalic();}, function(format){format.setItalic(val);});
	},
	setUnderline : function(cell, val)
	{
		return this._setFontProp(cell, function(format){return val != format.getUnderline();}, function(format){format.setUnderline(val);});
	},
	setStrikeout : function(cell, val)
	{
		return this._setFontProp(cell, function(format){return val != format.getStrikeout();}, function(format){format.setStrikeout(val);});
	},
	setFontAlign : function(cell, val)
	{
		return this._setFontProp(cell, function(format){return val != format.getVerticalAlign();}, function(format){format.setVerticalAlign(val);});
	},
	setValueType : function(type)
	{
		if(CellValueType.String == type && null != this.number)
		{
			this.text = this.number.toString();
			this.number = null;
		}
		this.type = type;
	},
	getType : function()
	{
		return UndoRedoDataTypes.CellValue;
	},
	getProperties : function()
	{
		return this.Properties;
	},
	getProperty : function(nType)
	{
		switch(nType)
		{
			case this.Properties.text: return this.text;break;
			case this.Properties.multiText: return this.multiText;break;
			case this.Properties.number: return this.number;break;
			case this.Properties.type: return this.type;break;
		}
	},
	setProperty : function(nType, value)
	{
		switch(nType)
		{
			case this.Properties.text: this.text = value;break;
			case this.Properties.multiText: this.multiText = value;break;
			case this.Properties.number: this.number = value;break;
			case this.Properties.type: this.type = value;break;
		}
	},
	_getValueTypeError : function (text){
		switch (text){
			case cErrorOrigin["nil"]:
				return cErrorLocal["nil"];
				break;
			case cErrorOrigin["div"]:
				return cErrorLocal["div"];
				break;
			case cErrorOrigin["value"]:
				return cErrorLocal["value"];
				break;
			case cErrorOrigin["ref"]:
				return cErrorLocal["ref"];
				break;
			case cErrorOrigin["name"]:
				return cErrorLocal["name"].replace('\\', ''); // ToDo это неправильная правка для бага 32463 (нужно переделать parse формул)
				break;
			case cErrorOrigin["num"]:
				return cErrorLocal["num"];
				break;
			case cErrorOrigin["na"]:
				return cErrorLocal["na"];
				break;
			case cErrorOrigin["getdata"]:
				return cErrorLocal["getdata"];
				break;
			case cErrorOrigin["uf"]:
				return cErrorLocal["uf"];
				break;
	}
		return cErrorLocal["nil"];
	}
};

function TreeRBNode(key, storedValue){
	this.storedValue = storedValue;
	this.key = key;
	this.red = null;
	
	this.left = null;
	this.right = null;
	this.parent = null;
}
TreeRBNode.prototype = {
	constructor: TreeRBNode,
	isEqual : function(x){
		return this.key == x.key;
	}
};
/**
 *
 * @param low
 * @param high
 * @param storedValue
 * @constructor
 * @extends {TreeRBNode}
 */
function IntervalTreeRBNode(low, high, storedValue){
	TreeRBNode.call(this, low, storedValue);
	this.high = high;
	this.maxHigh = this.high;
	this.minLow = this.key;
}
IntervalTreeRBNode.prototype = Object.create(TreeRBNode.prototype);
IntervalTreeRBNode.prototype.constructor = IntervalTreeRBNode;
IntervalTreeRBNode.prototype.isEqual = function (x) {
	return this.key == x.key && this.high == x.high;
};
		
function TreeRB(){
	this.nil = null;
	this.root = null;
	this._init();
}
TreeRB.prototype = {
	constructor: TreeRB,
	_init : function(){
		this.nil = new TreeRBNode();
		this.nil.left = this.nil.right = this.nil.parent = this.nil;
		this.nil.key = -Number.MAX_VALUE;
		this.nil.red = 0;
		this.nil.storedValue = null;
		
		this.root = new TreeRBNode();
		this.root.left = this.nil.right = this.nil.parent = this.nil;
		this.root.key = Number.MAX_VALUE;
		this.root.red = 0;
		this.root.storedValue = null;
	},
	_treeInsertHelp : function(z){
		var oRes = z;
		z.left = z.right = this.nil;
		var y = this.root;
		var x = this.root.left;
		while(x != this.nil && !x.isEqual(z)){
			y = x;
			if(x.key > z.key)
				x = x.left;
			else
				x = x.right;
		}
		if(x == this.nil)
		{
			z.parent = y;
			if(y == this.root || y.key > z.key)
				y.left = z;
			else
				y.right = z;
		}
		else
			oRes = x;
		return oRes;
	},
	_fixUpMaxHigh : function(x){
	},
	_cleanMaxHigh : function(x){
	},
	_leftRotate : function(x){
		var y = x.right;
		x.right = y.left;
		if (y.left != this.nil)
			y.left.parent = x;
		y.parent = x.parent;
		if(x == x.parent.left){
			x.parent.left = y;
		}
		else{
			x.parent.right = y;
		}
		y.left = x;
		x.parent = y;
	},
	_rightRotate : function(y){
		var x = y.left;
		y.left = x.right;
		if(this.nil !=  x.right)
			x.right.parent = y;
		x.parent = y.parent;
		if(y == y.parent.left){
			y.parent.left = x;
		}
		else{
			y.parent.right = x;
		}
		x.right = y;
		y.parent = x;
	},
	insertOrGet : function(x){
		var y = null;
		var oRes = x;
		oRes = this._treeInsertHelp(x);
		if(x == oRes)
		{
			this._fixUpMaxHigh(x.parent);
			x.red = 1;
			while(x.parent.red)
			{
				if(x.parent == x.parent.parent.left){
					y = x.parent.parent.right;
					if(y.red){
						x.parent.red = 0;
						y.red = 0;
						x.parent.parent.red = 1;
						x = x.parent.parent;
					}
					else{
						if (x == x.parent.right) {
						  x = x.parent;
						  this._leftRotate(x);
						}
						x.parent.red=0;
						x.parent.parent.red=1;
						this._rightRotate(x.parent.parent);
					}
				}
				else{
					y = x.parent.parent.left;
					if (y.red){
						x.parent.red = 0;
						y.red = 0;
						x.parent.parent.red = 1;
						x = x.parent.parent;
					}
					else{
						if (x == x.parent.left) {
							x = x.parent;
							this._rightRotate(x);
						}
						x.parent.red = 0;
						x.parent.parent.red = 1;
						this._leftRotate(x.parent.parent);
					} 
				}
			}
			this.root.left.red = 0;
		}
		return oRes;
	},
	_getSuccessorOf : function(x){
		var y;
		if(this.nil != (y = x.right)){
			while(y.left != this.nil){
				y = y.left;
			}
			return(y);
		}
		else{
			y = x.parent;
			while(x == y.right) {
			  x = y;
			  y = y.parent;
			}
			if (y == this.root) return(this.nil);
			return(y);
		}
	},
	_deleteFixUp : function(x){
		var w;
		var rootLeft = this.root.left;
		
		while((!x.red) && (rootLeft != x)){
			if(x == x.parent.left){
				w = x.parent.right;
				if (w.red){
					w.red = 0;
					x.parent.red = 1;
					this._leftRotate(x.parent);
					w = x.parent.right;
				}
				if((!w.right.red) && (!w.left.red)){
					w.red = 1;
					x = x.parent;
				}
				else{
					if(!w.right.red){
						w.left.red = 0;
						w.red = 1;
						this._rightRotate(w);
						w = x.parent.right;
					}
					w.red = x.parent.red;
					x.parent.red = 0;
					w.right.red = 0;
					this._leftRotate(x.parent);
					x = rootLeft; /* this is to exit while loop */
				}
			}
			else{
				w = x.parent.left;
				if (w.red){
					w.red = 0;
					x.parent.red = 1;
					this._rightRotate(x.parent);
					w = x.parent.left;
				}
				if ( (!w.right.red) && (!w.left.red)){
					w.red = 1;
					x = x.parent;
				}
				else{
					if (!w.left.red) {
						w.right.red = 0;
						w.red = 1;
						this._leftRotate(w);
						w = x.parent.left;
					}
					w.red = x.parent.red;
					x.parent.red = 0;
					w.left.red = 0;
					this._rightRotate(x.parent);
					x = rootLeft; /* this is to exit while loop */
				}
			}
		}
		x.red=0;
	},
	deleteNode : function(z){
		var oRes = z.storedValue;
		var y = ((z.left == this.nil) || (z.right == this.nil)) ? z : this._getSuccessorOf(z);
		var x = (y.left == this.nil) ? y.right : y.left;
		if (this.root == (x.parent = y.parent)){
			this.root.left = x;
		}
		else{
			if (y == y.parent.left){
				y.parent.left = x;
			}
			else{
				y.parent.right = x;
			}
		}
		if (y != z){
			this._cleanMaxHigh(y);
			y.left = z.left;
			y.right = z.right;
			y.parent = z.parent;
			z.left.parent = z.right.parent = y;
			if (z == z.parent.left){
				z.parent.left = y; 
			}
			else{
				z.parent.right = y;
			}
			this._fixUpMaxHigh(x.parent); 
			if(!(y.red)){
				y.red = z.red;
				this._deleteFixUp(x);
			}
			else
				y.red = z.red; 
		}
		else{
			this._fixUpMaxHigh(x.parent);
			if (!(y.red))
				this._deleteFixUp(x);
		}
		return oRes;
	},
	_enumerateRecursion : function(low, high, x, enumResultStack){
		if(x != this.nil){
			if(low > x.key)
				this._enumerateRecursion(low, high, x.right, enumResultStack);
			else if(high < x.key)
				this._enumerateRecursion(low, high, x.left, enumResultStack);
			else
			{
				this._enumerateRecursion(low, high, x.left, enumResultStack);
				enumResultStack.push(x);
				this._enumerateRecursion(low, high, x.right, enumResultStack);
			}
		}
	},
	enumerate : function(low, high){
		var enumResultStack = [];
		if(low <= high)
			this._enumerateRecursion(low, high, this.root.left, enumResultStack);
		return enumResultStack;
	},
	getElem : function(val){
		var oRes = null;
		//todo переделать
		var aElems = this.enumerate(val, val);
		if(aElems.length > 0)
			oRes = aElems[0];
		return oRes;
	},
	getNodeAll : function(){
		return this.enumerate(-Number.MAX_VALUE, Number.MAX_VALUE);
	},
	isEmpty : function(){
		return this.nil == this.root.left;
	}
};

/**
 *
 * @constructor
 * @extends {TreeRB}
 */
function IntervalTreeRB(){
	TreeRB.call(this);
}
IntervalTreeRB.prototype = Object.create(TreeRB.prototype);
IntervalTreeRB.prototype.constructor = IntervalTreeRB;
IntervalTreeRB.prototype._init = function (x) {
	this.nil = new IntervalTreeRBNode();
	this.nil.left = this.nil.right = this.nil.parent = this.nil;
	this.nil.key = this.nil.high = this.nil.maxHigh = -Number.MAX_VALUE;
	this.nil.minLow = Number.MAX_VALUE;
	this.nil.red = 0;
	this.nil.storedValue = null;
	
	this.root = new IntervalTreeRBNode();
	this.root.left = this.nil.right = this.nil.parent = this.nil;
	this.root.key = this.root.high = this.root.maxHigh = Number.MAX_VALUE;
	this.root.minLow = -Number.MAX_VALUE;
	this.root.red = 0;
	this.root.storedValue = null;
};
IntervalTreeRB.prototype._fixUpMaxHigh = function (x) {
	while(x != this.root){
		x.maxHigh = Math.max(x.high, Math.max(x.left.maxHigh, x.right.maxHigh));
		x.minLow = Math.min(x.key, Math.min(x.left.minLow, x.right.minLow));
		x = x.parent;
	}
};
IntervalTreeRB.prototype._cleanMaxHigh = function (x) {
	x.maxHigh = -Number.MAX_VALUE;
	x.minLow = Number.MAX_VALUE;
};
IntervalTreeRB.prototype._overlap = function (a1, a2, b1, b2) {
	if (a1 <= b1){
		return ((b1 <= a2));
	}
	else{
		return ((a1 <= b2));
	}
};
IntervalTreeRB.prototype._enumerateRecursion = function (low, high, x, enumResultStack) {
	if(x != this.nil){
		if(this._overlap(low, high, x.minLow, x.maxHigh))
		{
			this._enumerateRecursion(low, high, x.left, enumResultStack);
			if (this._overlap(low, high, x.key, x.high))
				enumResultStack.push(x);
			this._enumerateRecursion(low, high, x.right, enumResultStack);
		}
	}
};
IntervalTreeRB.prototype._leftRotate = function (x) {
	var y = x.right;
	TreeRB.prototype._leftRotate.call(this, x);

	x.maxHigh = Math.max(x.left.maxHigh,Math.max(x.right.maxHigh,x.high));
	x.minLow = Math.min(x.left.minLow,Math.min(x.right.minLow,x.key));
	y.maxHigh = Math.max(x.maxHigh,Math.max(y.right.maxHigh,y.high));
	y.minLow = Math.min(x.minLow,Math.min(y.right.minLow,y.key));
};
IntervalTreeRB.prototype._rightRotate = function (y) {
	var x = y.left;
	TreeRB.prototype._rightRotate.call(this, y);
	
	y.maxHigh = Math.max(y.left.maxHigh,Math.max(y.right.maxHigh,y.high));
	y.minLow = Math.min(y.left.minLow,Math.min(y.right.minLow,y.key));
	x.maxHigh = Math.max(x.left.maxHigh,Math.max(y.maxHigh,x.high));
	x.minLow = Math.min(x.left.minLow,Math.min(y.minLow,y.key));
};
function RangeDataManagerElem(bbox, data)
{
	this.bbox = bbox;
	this.data = data;
}
function RangeDataManager(fChange)
{
	this.oIntervalTreeRB = new IntervalTreeRB();
	this.oDependenceManager = null;
	this.fChange = fChange;
}
RangeDataManager.prototype = {
    add: function (bbox, data, oChangeParam)
	{
		var oNewNode = new IntervalTreeRBNode(bbox.r1, bbox.r2, null);
		var oStoredNode = this.oIntervalTreeRB.insertOrGet(oNewNode);
		if(oStoredNode == oNewNode)
			oStoredNode.storedValue = [];
		var oNewElem = new RangeDataManagerElem(new Asc.Range(bbox.c1, bbox.r1, bbox.c2, bbox.r2), data);
		oStoredNode.storedValue.push(oNewElem);
		if(null != this.fChange)
		    this.fChange.call(this, oNewElem.data, null, oNewElem.bbox, oChangeParam);
	},
	get : function(bbox)
	{
		var bboxRange = new Asc.Range(bbox.c1, bbox.r1, bbox.c2, bbox.r2);
		var oRes = {all: [], inner: [], outer: []};
		var oNodes = this.oIntervalTreeRB.enumerate(bbox.r1, bbox.r2);
		for(var i = 0, length = oNodes.length; i < length; i++)
		{
			var oNode = oNodes[i];
			if(oNode.storedValue)
			{
				for(var j = 0, length2 = oNode.storedValue.length; j < length2; j++)
				{
					var elem = oNode.storedValue[j];
					if(elem.bbox.isIntersect(bbox))
					{
						oRes.all.push(elem);
						if(bboxRange.containsRange(elem.bbox))
							oRes.inner.push(elem);
						else
							oRes.outer.push(elem);
					}
				}
			}
		}
		return oRes;
	},
	getExact : function(bbox)
	{
		var oRes = null;
		var oGet = this.get(bbox);
		for(var i = 0, length = oGet.inner.length; i < length; i++)
		{
			var elem = oGet.inner[i];
			if(elem.bbox.isEqual(bbox))
			{
				oRes = elem;
				break;
			}
		}
		return oRes;
	},
	_getByCell : function(nRow, nCol)
	{
		var oRes = null;
		var aAll = this.get(new Asc.Range(nCol, nRow, nCol, nRow));
		if(aAll.all.length > 0)
			oRes = aAll.all[0];
		return oRes;
	},
	getByCell : function(nRow, nCol)
	{
		var oRes = this._getByCell(nRow, nCol);
		if(null == oRes && null != this.oDependenceManager)
		{
			var oDependence = this.oDependenceManager._getByCell(nRow, nCol);
			if(null != oDependence)
			{
				var oTempRes = this.get(oDependence.bbox);
				if(oTempRes.all.length > 0)
					oRes = oTempRes.all[0];
			}
		}
		return oRes;
	},
	remove: function (bbox, bInnerOnly, oChangeParam)
	{
	    var aElems = this.get(bbox);
	    var aTargetArray;
	    if (bInnerOnly)
	        aTargetArray = aElems.inner;
	    else
	        aTargetArray = aElems.all;
	    for (var i = 0, length = aTargetArray.length; i < length; ++i)
		{
	        var elem = aTargetArray[i];
	        this.removeElement(elem, oChangeParam);
		}
	},
	removeElement: function (elemToDelete, oChangeParam)
	{
		if(null != elemToDelete)
		{
			var bbox = elemToDelete.bbox;
			var oNodes = this.oIntervalTreeRB.enumerate(bbox.r1, bbox.r2);
			for(var i = 0, length = oNodes.length; i < length; i++)
			{
				var oNode = oNodes[i];
				if(oNode.storedValue)
				{
					for(var j = 0, length2 = oNode.storedValue.length; j < length2; j++)
					{
						var elem = oNode.storedValue[j];
						if(elem.bbox.isEqual(bbox))
						{
							oNode.storedValue.splice(j, 1);
							break;
						}
					}
					if(0 == oNode.storedValue.length)
						this.oIntervalTreeRB.deleteNode(oNode);
				}
			}
			if(null != this.fChange)
			    this.fChange.call(this, elemToDelete.data, elemToDelete.bbox, null, oChangeParam);
		}
	},
	removeAll : function(oChangeParam)
	{
	    this.remove(new Asc.Range(0, 0, gc_nMaxCol0, gc_nMaxRow0), null, oChangeParam);
		//todo
		this.oIntervalTreeRB = new IntervalTreeRB();
	},
	shiftGet : function(bbox, bHor)
	{
		var bboxGet = shiftGetBBox(bbox, bHor);
		return {bbox: bboxGet, elems: this.get(bboxGet)};
	},
	shift: function (bbox, bAdd, bHor, oGetRes, oChangeParam)
	{
	    var _this = this;
	    if (null == oGetRes)
	        oGetRes = this.shiftGet(bbox, bHor);
	    var offset;
	    if (bHor)
	        offset = { offsetRow: 0, offsetCol: bbox.c2 - bbox.c1 + 1 };
	    else
	        offset = { offsetRow: bbox.r2 - bbox.r1 + 1, offsetCol: 0 };
	    if (!bAdd) {
	        offset.offsetRow = -offset.offsetRow;
	        offset.offsetCol = -offset.offsetCol;
	    }
	    this._shiftmove(true, bbox, offset, oGetRes.elems, oChangeParam);
	},
	move: function (from, to, oChangeParam)
	{
	    var offset = { offsetRow: to.r1 - from.r1, offsetCol: to.c1 - from.c1 };
	    var oGetRes = this.get(from);
	    this._shiftmove(false, from, offset, oGetRes, oChangeParam);
	},
	_shiftmove: function (bShift, bbox, offset, elems, oChangeParam) {
	    var aToChange = [];
	    var bAdd = offset.offsetRow > 0 || offset.offsetCol > 0;
	    var bHor = 0 != offset.offsetCol ? true : false;
	    //сдвигаем inner
	    if (elems.inner.length > 0) {
	        var bboxAsc = Asc.Range(bbox.c1, bbox.r1, bbox.c2, bbox.r2);
	        for (var i = 0, length = elems.inner.length; i < length; i++) {
	            var elem = elems.inner[i];
	            var from = elem.bbox;
	            var to = null;
	            if (bShift) {
	                if (bAdd) {
	                    to = from.clone();
	                    to.setOffset(offset);
	                }
	                else if (!bboxAsc.containsRange(from)) {
	                    to = from.clone();
	                    if (bHor) {
	                        if (to.c1 <= bbox.c2)
	                            to.setOffsetFirst({ offsetRow: 0, offsetCol: bbox.c2 - to.c1 + 1 });
	                    }
	                    else {
	                        if (to.r1 <= bbox.r2)
	                            to.setOffsetFirst({ offsetRow: bbox.r2 - to.r1 + 1, offsetCol: 0 });
	                    }
	                    to.setOffset(offset);
	                }
	            }
	            else {
	                to = from.clone();
	                to.setOffset(offset);
	            }
	            aToChange.push({ elem: elem, to: to });
	        }
	    }
	    //меняем outer
	    if (bShift) {
	        if (elems.outer.length > 0) {
	            for (var i = 0, length = elems.outer.length; i < length; i++) {
	                var elem = elems.outer[i];
	                var from = elem.bbox;
	                var to = null;
	                if (bHor) {
	                    if (from.c1 < bbox.c1 && bbox.r1 <= from.r1 && from.r2 <= bbox.r2) {
	                        if (bAdd) {
	                            to = from.clone();
	                            to.setOffsetLast({ offsetRow: 0, offsetCol: bbox.c2 - bbox.c1 + 1 });
	                        }
	                        else {
	                            to = from.clone();
	                            var nTemp1 = from.c2 - bbox.c1 + 1;
	                            var nTemp2 = bbox.c2 - bbox.c1 + 1;
	                            to.setOffsetLast({ offsetRow: 0, offsetCol: -Math.min(nTemp1, nTemp2) });
	                        }
	                    }
	                }
	                else {
	                    if (from.r1 < bbox.r1 && bbox.c1 <= from.c1 && from.c2 <= bbox.c2) {
	                        if (bAdd) {
	                            to = from.clone();
	                            to.setOffsetLast({ offsetRow: bbox.r2 - bbox.r1 + 1, offsetCol: 0 });
	                        }
	                        else {
	                            to = from.clone();
	                            var nTemp1 = from.r2 - bbox.r1 + 1;
	                            var nTemp2 = bbox.r2 - bbox.r1 + 1;
	                            to.setOffsetLast({ offsetRow: -Math.min(nTemp1, nTemp2), offsetCol: 0 });
	                        }
	                    }
	                }
	                if (null != to)
	                    aToChange.push({ elem: elem, to: to });
	            }
	        }
	    }
	    //сначала сортируем чтобы не было конфликтов при сдвиге
	    aToChange.sort(function (a, b) { return shiftSort(a, b, offset); });

	    if (null != this.fChange) {
	        for (var i = 0, length = aToChange.length; i < length; ++i) {
	            var item = aToChange[i];
	            this.fChange.call(this, item.elem.data, item.elem.bbox, item.to, oChangeParam);
	        }
	    }
	    //убираем fChange, чтобы потом послать его только на одну операцию, а не 2
	    var fOldChange = this.fChange;
	    this.fChange = null;
	    //сначала удаляем все чтобы не было конфликтов
	    for (var i = 0, length = aToChange.length; i < length; ++i) {
	        var item = aToChange[i];
	        var elem = item.elem;
	        this.removeElement(elem, oChangeParam);
	    }
	    //добавляем измененные ячейки
	    for (var i = 0, length = aToChange.length; i < length; ++i) {
	        var item = aToChange[i];
	        if (null != item.to)
	            this.add(item.to, item.elem.data, oChangeParam);
	    }
	    this.fChange = fOldChange;
	},
	getAll : function()
	{
		var aRes = [];
		var oNodes = this.oIntervalTreeRB.getNodeAll();
		for(var i = 0, length = oNodes.length; i < length; i++)
		{
			var oNode = oNodes[i];
			if(oNode.storedValue)
			{
				for(var j = 0, length2 = oNode.storedValue.length; j < length2; j++)
				{
					var elem = oNode.storedValue[j];
					aRes.push(elem);
				}
			}
		}
		return aRes;
	},
	setDependenceManager : function(oDependenceManager)
	{
		this.oDependenceManager = oDependenceManager;
	}
};

	/** @constructor */
	function sparklineGroup(addId) {
		// attributes
		this.type = null;
		this.lineWeight = null;
		this.displayEmptyCellsAs = null;
		this.markers = null;
		this.high = null;
		this.low = null;
		this.first = null;
		this.last = null;
		this.negative = null;
		this.displayXAxis = null;
		this.displayHidden = null;
		this.minAxisType = null;
		this.maxAxisType = null;
		this.rightToLeft = null;
		this.manualMax = null;
		this.manualMin = null;

		this.dateAxis = null;

		// elements
		this.colorSeries = null;
		this.colorNegative = null;
		this.colorAxis = null;
		this.colorMarkers = null;
		this.colorFirst = null;
		this.colorLast = null;
		this.colorHigh = null;
		this.colorLow = null;

		this.f = null;
		this.arrSparklines = [];

		//for drawing preview
		this.canvas = null;

		this.worksheet = null;
		this.Id = null;
		if (addId) {
			this.Id = AscCommon.g_oIdCounter.Get_NewId();
			AscCommon.g_oTableId.Add(this, this.Id);
		}
	}
	sparklineGroup.prototype.getObjectType = function () {
		return AscDFH.historyitem_type_Sparkline;
	};
	sparklineGroup.prototype.Get_Id = function () {
		return this.Id;
	};
	sparklineGroup.prototype.Write_ToBinary2 = function (w) {
		w.WriteLong(this.getObjectType());
		w.WriteString2(this.Id);
		w.WriteString2(this.worksheet ? this.worksheet.getId() : '-1');
	};
	sparklineGroup.prototype.Read_FromBinary2 = function (r) {
		this.Id = r.GetString2();

		// ToDDo не самая лучшая схема добавления на лист...
		var api_sheet = Asc['editor'];
		this.worksheet = api_sheet.wbModel.getWorksheetById(r.GetString2());
		if (this.worksheet) {
			this.worksheet.insertSparklineGroup(this);
		}
	};
	sparklineGroup.prototype.default = function () {
		this.type = Asc.c_oAscSparklineType.Line;
		this.lineWeight = 0.75;
		this.displayEmptyCellsAs = Asc.c_oAscEDispBlanksAs.Zero;
		this.markers = false;
		this.high = false;
		this.low = false;
		this.first = false;
		this.last = false;
		this.negative = false;
		this.displayXAxis = false;
		this.displayHidden = false;
		this.minAxisType = Asc.c_oAscSparklineAxisMinMax.Individual;
		this.maxAxisType = Asc.c_oAscSparklineAxisMinMax.Individual;
		this.rightToLeft = false;
		this.manualMax = null;
		this.manualMin = null;
		this.dateAxis = false;

		// elements
		var defaultSeriesColor = 3629202;
		var defaultOtherColor = 13631488;

		this.colorSeries = new RgbColor(defaultSeriesColor);
		this.colorNegative = new RgbColor(defaultOtherColor);
		this.colorAxis = new RgbColor(defaultOtherColor);
		this.colorMarkers = new RgbColor(defaultOtherColor);
		this.colorFirst = new RgbColor(defaultOtherColor);
		this.colorLast = new RgbColor(defaultOtherColor);
		this.colorHigh = new RgbColor(defaultOtherColor);
		this.colorLow = new RgbColor(defaultOtherColor);
	};
	sparklineGroup.prototype.setWorksheet = function (worksheet, oldWorksheet) {
		this.worksheet = worksheet;
		if (oldWorksheet) {
			var oldSparklines = [];
			var newSparklines = [];
			for (var i = 0; i < this.arrSparklines.length; ++i) {
				oldSparklines.push(this.arrSparklines[i].clone());
				this.arrSparklines[i].updateWorksheet(worksheet.sName, oldWorksheet.sName);
				newSparklines.push(this.arrSparklines[i].clone());
			}
			History.Add(new AscDFH.CChangesSparklinesChangeData(this, oldSparklines, newSparklines));
		}
	};

    sparklineGroup.prototype.checkProperty = function (propOld, propNew, type, fChangeConstructor) {
        if (null !== propNew && propOld !== propNew) {
            History.Add(new fChangeConstructor(this, type, propOld, propNew));
            return propNew;
        }
        return propOld;
    };

	sparklineGroup.prototype.set = function (val) {
		var t = this;

		var getColor = function (color) {
			return color instanceof Asc.asc_CColor ? CorrectAscColor(color) : color ? color.clone(): color;
		};

		this.type = this.checkProperty(this.type, val.type, AscDFH.historyitem_Sparkline_Type, AscDFH.CChangesDrawingsLong);
		this.lineWeight = this.checkProperty(this.lineWeight, val.lineWeight, AscDFH.historyitem_Sparkline_LineWeight, AscDFH.CChangesDrawingsDouble);
		this.displayEmptyCellsAs = this.checkProperty(this.displayEmptyCellsAs, val.displayEmptyCellsAs, AscDFH.historyitem_Sparkline_DisplayEmptyCellsAs, AscDFH.CChangesDrawingsLong);
		this.markers = this.checkProperty(this.markers, val.markers, AscDFH.historyitem_Sparkline_Markers, AscDFH.CChangesDrawingsBool);
		this.high = this.checkProperty(this.high, val.high, AscDFH.historyitem_Sparkline_High, AscDFH.CChangesDrawingsBool);
		this.low = this.checkProperty(this.low, val.low, AscDFH.historyitem_Sparkline_Low, AscDFH.CChangesDrawingsBool);
		this.first = this.checkProperty(this.first, val.first, AscDFH.historyitem_Sparkline_First, AscDFH.CChangesDrawingsBool);
		this.last = this.checkProperty(this.last, val.last, AscDFH.historyitem_Sparkline_Last, AscDFH.CChangesDrawingsBool);
		this.negative = this.checkProperty(this.negative, val.negative, AscDFH.historyitem_Sparkline_Negative, AscDFH.CChangesDrawingsBool);
		this.displayXAxis = this.checkProperty(this.displayXAxis, val.displayXAxis, AscDFH.historyitem_Sparkline_DisplayXAxis, AscDFH.CChangesDrawingsBool);
		this.displayHidden = this.checkProperty(this.displayHidden, val.displayHidden, AscDFH.historyitem_Sparkline_DisplayHidden, AscDFH.CChangesDrawingsBool);
		this.minAxisType = this.checkProperty(this.minAxisType, val.minAxisType, AscDFH.historyitem_Sparkline_MinAxisType, AscDFH.CChangesDrawingsLong);
		this.maxAxisType = this.checkProperty(this.maxAxisType, val.maxAxisType, AscDFH.historyitem_Sparkline_MaxAxisType, AscDFH.CChangesDrawingsLong);
		this.rightToLeft = this.checkProperty(this.rightToLeft, val.rightToLeft, AscDFH.historyitem_Sparkline_RightToLeft, AscDFH.CChangesDrawingsBool);
		this.manualMax = this.checkProperty(this.manualMax, val.manualMax, AscDFH.historyitem_Sparkline_ManualMax, AscDFH.CChangesDrawingsDouble);
		this.manualMin = this.checkProperty(this.manualMin, val.manualMin, AscDFH.historyitem_Sparkline_ManualMin, AscDFH.CChangesDrawingsDouble);
		this.dateAxis = this.checkProperty(this.dateAxis, val.dateAxis, AscDFH.historyitem_Sparkline_DateAxis, AscDFH.CChangesDrawingsBool);

		this.colorSeries = this.checkProperty(this.colorSeries, getColor(val.colorSeries), AscDFH.historyitem_Sparkline_ColorSeries, AscDFH.CChangesDrawingsExcelColor);
		this.colorNegative = this.checkProperty(this.colorNegative, getColor(val.colorNegative), AscDFH.historyitem_Sparkline_ColorNegative, AscDFH.CChangesDrawingsExcelColor);
		this.colorAxis = this.checkProperty(this.colorAxis, getColor(val.colorAxis), AscDFH.historyitem_Sparkline_ColorAxis, AscDFH.CChangesDrawingsExcelColor);
		this.colorMarkers = this.checkProperty(this.colorMarkers, getColor(val.colorMarkers), AscDFH.historyitem_Sparkline_ColorMarkers, AscDFH.CChangesDrawingsExcelColor);
		this.colorFirst = this.checkProperty(this.colorFirst, getColor(val.colorFirst), AscDFH.historyitem_Sparkline_ColorFirst, AscDFH.CChangesDrawingsExcelColor);
		this.colorLast = this.checkProperty(this.colorLast, getColor(val.colorLast), AscDFH.historyitem_Sparkline_colorLast, AscDFH.CChangesDrawingsExcelColor);
		this.colorHigh = this.checkProperty(this.colorHigh, getColor(val.colorHigh), AscDFH.historyitem_Sparkline_ColorHigh, AscDFH.CChangesDrawingsExcelColor);
		this.colorLow = this.checkProperty(this.colorLow, getColor(val.colorLow), AscDFH.historyitem_Sparkline_ColorLow, AscDFH.CChangesDrawingsExcelColor);

		this.f = this.checkProperty(this.f, val.f, AscDFH.historyitem_Sparkline_F, AscDFH.CChangesDrawingsString);

		this.cleanCache();
	};
	sparklineGroup.prototype.clone = function (onlyProps) {
		var res = new sparklineGroup(!onlyProps);
		res.set(this);
		res.f = this.f;

		if (!onlyProps) {
			var newSparklines = [];
			for (var i = 0; i < this.arrSparklines.length; ++i) {
				res.arrSparklines.push(this.arrSparklines[i].clone());
				newSparklines.push(this.arrSparklines[i].clone());
			}
			History.Add(new AscDFH.CChangesSparklinesChangeData(res, null, newSparklines));
		}

		return res;
	};
	sparklineGroup.prototype.draw = function (oDrawingContext) {
		var oCacheView;
		var graphics = new AscCommon.CGraphics();
		graphics.init(oDrawingContext.ctx, oDrawingContext.getWidth(0), oDrawingContext.getHeight(0),
			oDrawingContext.getWidth(3), oDrawingContext.getHeight(3));
		graphics.m_oFontManager = AscCommon.g_fontManager;
		for (var i = 0; i < this.arrSparklines.length; ++i) {
			if (oCacheView = this.arrSparklines[i].oCacheView) {
				oCacheView.draw(graphics);
			}
		}
	};
	sparklineGroup.prototype.cleanCache = function () {
		// ToDo clean only colors (for color scheme)
		for (var i = 0; i < this.arrSparklines.length; ++i) {
			this.arrSparklines[i].oCacheView = null;
		}
	};
	sparklineGroup.prototype.updateCache = function (sheet, ranges) {
		var sparklineRange;
		for (var i = 0; i < this.arrSparklines.length; ++i) {
			sparklineRange = this.arrSparklines[i]._f;
			for (var j = 0; j < ranges.length; ++j) {
				if (sparklineRange.isIntersect(ranges[j], sheet)) {
					this.arrSparklines[i].oCacheView = null;
					break;
				}
			}
		}
	};
	sparklineGroup.prototype.contains = function (c, r) {
		for (var j = 0; j < this.arrSparklines.length; ++j) {
			if (this.arrSparklines[j].contains(c, r)) {
				return j;
			}
		}
		return -1;
	};
	sparklineGroup.prototype.intersectionSimple = function (range) {
		for (var j = 0; j < this.arrSparklines.length; ++j) {
			if (this.arrSparklines[j].intersectionSimple(range)) {
				return j;
			}
		}
		return -1;
	};
	sparklineGroup.prototype.remove = function (range) {
		for (var i = 0; i < this.arrSparklines.length; ++i) {
			if (this.arrSparklines[i].checkInRange(range)) {
				History.Add(new AscDFH.CChangesSparklinesRemoveData(this, this.arrSparklines[i]));
				this.arrSparklines.splice(i, 1);
				--i;
			}
		}
		var bRemove = (0 === this.arrSparklines.length);
		return bRemove;
	};
	sparklineGroup.prototype.getLocationRanges = function (onlySingle) {
		var result = new AscCommonExcel.SelectionRange();
		this.arrSparklines.forEach(function (item, i) {
			if (0 === i) {
				result.assign2(item.sqref);
			} else {
				result.addRange();
				result.getLast().assign2(item.sqref);
			}
		});
		var unionRange = result.getUnion();
		return (!onlySingle || unionRange.isSingleRange()) ? unionRange : result;
	};
	sparklineGroup.prototype.getDataRanges = function () {
		var isUnion = true;
		var sheet = this.worksheet.getName();
		var result = new AscCommonExcel.SelectionRange();
		this.arrSparklines.forEach(function (item, i) {
			isUnion = isUnion && sheet === item._f.sheet;
			if (0 === i) {
				result.assign2(item._f);
			} else {
				result.addRange();
				result.getLast().assign2(item._f);
			}
		});
		var unionRange = isUnion ? result.getUnion() : result;
		return unionRange.isSingleRange() ? unionRange : result;
	};
	sparklineGroup.prototype.asc_getId = function () {
		return this.Id;
	};
	sparklineGroup.prototype.asc_getType = function () {
		return null !== this.type ? this.type : Asc.c_oAscSparklineType.Line;
	};
	sparklineGroup.prototype.asc_getLineWeight = function () {
		return null !== this.lineWeight ? this.lineWeight : 0.75;
	};
	sparklineGroup.prototype.asc_getDisplayEmpty = function () {
		return null !== this.displayEmptyCellsAs ? this.displayEmptyCellsAs : Asc.c_oAscEDispBlanksAs.Zero;
	};
	sparklineGroup.prototype.asc_getMarkersPoint = function () {
		return !!this.markers;
	};
	sparklineGroup.prototype.asc_getHighPoint = function () {
		return !!this.high;
	};
	sparklineGroup.prototype.asc_getLowPoint = function () {
		return !!this.low;
	};
	sparklineGroup.prototype.asc_getFirstPoint = function () {
		return !!this.first;
	};
	sparklineGroup.prototype.asc_getLastPoint = function () {
		return !!this.last;
	};
	sparklineGroup.prototype.asc_getNegativePoint = function () {
		return !!this.negative;
	};
	sparklineGroup.prototype.asc_getDisplayXAxis = function () {
		return this.displayXAxis;
	};
	sparklineGroup.prototype.asc_getDisplayHidden = function () {
		return this.displayHidden;
	};
	sparklineGroup.prototype.asc_getMinAxisType = function () {
		return null !== this.minAxisType ? this.minAxisType : Asc.c_oAscSparklineAxisMinMax.Individual;
	};
	sparklineGroup.prototype.asc_getMaxAxisType = function () {
		return null !== this.maxAxisType ? this.minAxisType : Asc.c_oAscSparklineAxisMinMax.Individual;
	};
	sparklineGroup.prototype.asc_getRightToLeft = function () {
		return this.rightToLeft;
	};
	sparklineGroup.prototype.asc_getManualMax = function () {
		return this.manualMax;
	};
	sparklineGroup.prototype.asc_getManualMin = function () {
		return this.manualMin;
	};
	sparklineGroup.prototype.asc_getColorSeries = function () {
		return this.colorSeries ? Asc.colorObjToAscColor(this.colorSeries) : this.colorSeries;
	};
	sparklineGroup.prototype.asc_getColorNegative = function () {
		return this.colorNegative ? Asc.colorObjToAscColor(this.colorNegative) : this.colorNegative;
	};
	sparklineGroup.prototype.asc_getColorAxis = function () {
		return this.colorAxis ? Asc.colorObjToAscColor(this.colorAxis) : this.colorAxis;
	};
	sparklineGroup.prototype.asc_getColorMarkers = function () {
		return this.colorMarkers ? Asc.colorObjToAscColor(this.colorMarkers) : this.colorMarkers;
	};
	sparklineGroup.prototype.asc_getColorFirst = function () {
		return this.colorFirst ? Asc.colorObjToAscColor(this.colorFirst) : this.colorFirst;
	};
	sparklineGroup.prototype.asc_getColorLast = function () {
		return this.colorLast ? Asc.colorObjToAscColor(this.colorLast) : this.colorLast;
	};
	sparklineGroup.prototype.asc_getColorHigh = function () {
		return this.colorHigh ? Asc.colorObjToAscColor(this.colorHigh) : this.colorHigh;
	};
	sparklineGroup.prototype.asc_getColorLow = function () {
		return this.colorLow ? Asc.colorObjToAscColor(this.colorLow) : this.colorLow;
	};
	sparklineGroup.prototype.asc_getDataRanges = function () {
		var arrResultData = [];
		var arrResultLocation = [];
		var oLocationRanges = this.getLocationRanges(true);
		var oDataRanges = oLocationRanges.isSingleRange() && this.getDataRanges();
		if (oLocationRanges.isSingleRange() && oDataRanges.isSingleRange()) {
			for (var i = 0; i < oLocationRanges.ranges.length; ++i) {
				arrResultData.push(oDataRanges.ranges[i].getName());
				arrResultLocation.push(oLocationRanges.ranges[i].getAbsName());
			}
		} else {
			this.arrSparklines.forEach(function (item) {
				arrResultData.push(item.f);
				arrResultLocation.push(item.sqref.getAbsName());
			});
		}
		return [arrResultData.join(AscCommon.FormulaSeparators.functionArgumentSeparator),
			arrResultLocation.join(AscCommon.FormulaSeparators.functionArgumentSeparator)];
	};
	sparklineGroup.prototype.asc_setType = function (val) {
		this.type = val;
	};
	sparklineGroup.prototype.asc_setLineWeight = function (val) {
		this.lineWeight = val;
	};
	sparklineGroup.prototype.asc_setDisplayEmpty = function (val) {
		this.displayEmptyCellsAs = val;
	};
	sparklineGroup.prototype.asc_setMarkersPoint = function (val) {
		this.markers = val;
	};
	sparklineGroup.prototype.asc_setHighPoint = function (val) {
		this.high = val;
	};
	sparklineGroup.prototype.asc_setLowPoint = function (val) {
		this.low = val;
	};
	sparklineGroup.prototype.asc_setFirstPoint = function (val) {
		this.first = val;
	};
	sparklineGroup.prototype.asc_setLastPoint = function (val) {
		this.last = val;
	};
	sparklineGroup.prototype.asc_setNegativePoint = function (val) {
		this.negative = val;
	};
	sparklineGroup.prototype.asc_setDisplayXAxis = function (val) {
		this.displayXAxis = val;
	};
	sparklineGroup.prototype.asc_setDisplayHidden = function (val) {
		this.displayHidden = val;
	};
	sparklineGroup.prototype.asc_setMinAxisType = function (val) {
		this.minAxisType = val;
	};
	sparklineGroup.prototype.asc_setMaxAxisType = function (val) {
		this.maxAxisType = val;
	};
	sparklineGroup.prototype.asc_setRightToLeft = function (val) {
		this.rightToLeft = val;
	};
	sparklineGroup.prototype.asc_setManualMax = function (val) {
		this.manualMax = val;
	};
	sparklineGroup.prototype.asc_setManualMin = function (val) {
		this.manualMin = val;
	};
	sparklineGroup.prototype.asc_setColorSeries = function (val) {
		this.colorSeries = val;
	};
	sparklineGroup.prototype.asc_setColorNegative = function (val) {
		this.colorNegative = val;
	};
	sparklineGroup.prototype.asc_setColorAxis = function (val) {
		this.colorAxis = val;
	};
	sparklineGroup.prototype.asc_setColorMarkers = function (val) {
		this.colorMarkers = val;
	};
	sparklineGroup.prototype.asc_setColorFirst = function (val) {
		this.colorFirst = val;
	};
	sparklineGroup.prototype.asc_setColorLast = function (val) {
		this.colorLast = val;
	};
	sparklineGroup.prototype.asc_setColorHigh = function (val) {
		this.colorHigh = val;
	};
	sparklineGroup.prototype.asc_setColorLow = function (val) {
		this.colorLow = val;
	};

	sparklineGroup.prototype.createExcellColor = function(aColor) {
		var oExcellColor = null;
		if(Array.isArray(aColor)) {
			if(2 === aColor.length){
				oExcellColor = AscCommonExcel.g_oColorManager.getThemeColor(aColor[0], aColor[1]);
			}
			else if(1 === aColor.length){
				oExcellColor = new AscCommonExcel.RgbColor(0x00ffffff & aColor[0]);
			}
		}
		return oExcellColor;
	};

	sparklineGroup.prototype._generateThumbCache = function () {
		function createItem(value) {
			return {numFormatStr: "General", isDateTimeFormat: false, val: value, isHidden: false};
		}

		switch (this.asc_getType()) {
			case Asc.c_oAscSparklineType.Line: {
				return [createItem(4), createItem(-58), createItem(51), createItem(-124), createItem(124), createItem(60)];
			}
			case Asc.c_oAscSparklineType.Column: {
				return [createItem(88), createItem(56), createItem(144), createItem(64), createItem(-56), createItem(-104),
					createItem(-40), createItem(-24), createItem(-56), createItem(104), createItem(56), createItem(80),
					createItem(-56), createItem(88)];
			}
			case Asc.c_oAscSparklineType.Stacked: {
				return [createItem(1), createItem(-1), createItem(-1), createItem(-2), createItem(1), createItem(1),
					createItem(-1), createItem(1), createItem(1), createItem(1), createItem(1), createItem(2), createItem(-1),
					createItem(1)];
			}
		}
		return [];
	};

	sparklineGroup.prototype._drawThumbBySparklineGroup = function (oSparkline, oSparklineGroup, oSparklineView, oGraphics) {
		oSparklineView.initFromSparkline(oSparkline, oSparklineGroup, null, true);
		var api_sheet = Asc['editor'];

		AscFormat.ExecuteNoHistory(function () {
			oSparklineView.chartSpace.setWorksheet(api_sheet.wb.getWorksheet().model);
		}, this, []);

		oSparklineView.chartSpace.extX = 100;
		oSparklineView.chartSpace.extY = 100;
		oSparklineView.chartSpace.x = 0;
		oSparklineView.chartSpace.y = 0;
		var type = oSparklineGroup.asc_getType();
		if (type === Asc.c_oAscSparklineType.Stacked) {
			AscFormat.ExecuteNoHistory(function () {
				var oPlotArea = oSparklineView.chartSpace.chart.plotArea;
				if (!oPlotArea.layout) {
					oPlotArea.setLayout(new AscFormat.CLayout());
				}
				var fPos = 0.32;
				oPlotArea.layout.setWMode(AscFormat.LAYOUT_MODE_FACTOR);
				oPlotArea.layout.setW(1.0);
				oPlotArea.layout.setHMode(AscFormat.LAYOUT_MODE_FACTOR);
				oPlotArea.layout.setH(1 - 2 * fPos);
				oPlotArea.layout.setYMode(AscFormat.LAYOUT_MODE_EDGE);
				oPlotArea.layout.setY(fPos);
			}, this, []);
		}
		if (type === Asc.c_oAscSparklineType.Line) {
			AscFormat.ExecuteNoHistory(function () {
				var oPlotArea = oSparklineView.chartSpace.chart.plotArea;
				if (!oPlotArea.layout) {
					oPlotArea.setLayout(new AscFormat.CLayout());
				}
				var fPos = 0.16;
				oPlotArea.layout.setWMode(AscFormat.LAYOUT_MODE_FACTOR);
				oPlotArea.layout.setW(1 - fPos);
				oPlotArea.layout.setHMode(AscFormat.LAYOUT_MODE_FACTOR);
				oPlotArea.layout.setH(1 - fPos);
			}, this, []);
		}
		AscFormat.ExecuteNoHistory(function () {
			AscFormat.CheckSpPrXfrm(oSparklineView.chartSpace);
		}, this, []);
		oSparklineView.chartSpace.recalculate();
		oSparklineView.chartSpace.brush = AscFormat.CreateSolidFillRGBA(0xFF, 0xFF, 0xFF, 0xFF);

		oSparklineView.chartSpace.draw(oGraphics);
	};

	sparklineGroup.prototype._isEqualStyle = function (oSparklineGroup) {
		var equalColors = function (color1, color2) {
			return color1 ? color1.isEqual(color2) : color1 === color2;
		};
		return equalColors(this.colorSeries, oSparklineGroup.colorSeries) &&
			equalColors(this.colorNegative, oSparklineGroup.colorNegative) &&
			equalColors(this.colorMarkers, oSparklineGroup.colorMarkers) &&
			equalColors(this.colorFirst, oSparklineGroup.colorFirst) &&
			equalColors(this.colorLast, oSparklineGroup.colorLast) &&
			equalColors(this.colorHigh, oSparklineGroup.colorHigh) && equalColors(this.colorLow, oSparklineGroup.colorLow);
	};

	sparklineGroup.prototype.asc_getStyles = function () {
		History.TurnOff();
		var aRet = [];
		var nStyleIndex = -1;
		var oSparklineGroup = this.clone(true);

		var canvas = document.createElement('canvas');
		canvas.width = 50;
		canvas.height = 50;
		if (AscCommon.AscBrowser.isRetina) {
			canvas.width = AscCommon.AscBrowser.convertToRetinaValue(canvas.width, true);
			canvas.height = AscCommon.AscBrowser.convertToRetinaValue(canvas.height, true);
		}
		var oSparklineView = new AscFormat.CSparklineView();
		var oSparkline = new sparkline();
		oSparkline.oCache = this._generateThumbCache();
		var oGraphics = new AscCommon.CGraphics();
		oGraphics.init(canvas.getContext('2d'), canvas.width, canvas.height, 100, 100);
		oGraphics.m_oFontManager = AscCommon.g_fontManager;
		oGraphics.transform(1, 0, 0, 1, 0, 0);

		for (var i = 0; i < 36; ++i) {
			oSparklineGroup.asc_setStyle(i);
			if (nStyleIndex === -1 && this._isEqualStyle(oSparklineGroup)) {
				nStyleIndex = i;
			}

			this._drawThumbBySparklineGroup(oSparkline, oSparklineGroup, oSparklineView, oGraphics);
			aRet.push(canvas.toDataURL("image/png"));
		}
		aRet.push(nStyleIndex);
		History.TurnOn();
		return aRet;
	};

	sparklineGroup.prototype.asc_setStyle = function (nStyleIndex) {
		var oStyle = AscFormat.aSparklinesStyles[nStyleIndex];
		if (oStyle) {
			this.colorSeries = this.createExcellColor(oStyle[0]);
			this.colorNegative = this.createExcellColor(oStyle[1]);
			this.colorAxis = this.createExcellColor(0xff000000);
			this.colorMarkers = this.createExcellColor(oStyle[2]);
			this.colorFirst = this.createExcellColor(oStyle[3]);
			this.colorLast = this.createExcellColor(oStyle[4]);
			this.colorHigh = this.createExcellColor(oStyle[5]);
			this.colorLow = this.createExcellColor(oStyle[6]);
		}
	};
	/** @constructor */
	function sparkline() {
		this.sqref = null;
		this.f = null;
		this._f = null;

		//for preview
		this.oCache = null;
		this.oCacheView = null;
	}

	sparkline.prototype.clone = function () {
		var res = new sparkline();

		res.sqref = this.sqref ? this.sqref.clone() : null;
		res.f = this.f;
		res._f = this._f ? this._f.clone() : null;

		return res;
	};
	sparkline.prototype.setSqref = function (sqref) {
		this.sqref = AscCommonExcel.g_oRangeCache.getAscRange(sqref).clone();
		this.sqref.setAbs(true, true, true, true);
	};
	sparkline.prototype.setF = function (f) {
		this.f = f;
		this._f = AscCommonExcel.g_oRangeCache.getRange3D(this.f);
	};
	sparkline.prototype.updateWorksheet = function (sheet, oldSheet) {
		if (this._f && oldSheet === this._f.sheet && (null === this._f.sheet2 || oldSheet === this._f.sheet2)) {
			this._f.setSheet(sheet);
			this.f = this._f.getName();
		}
	};
	sparkline.prototype.checkInRange = function (range) {
		return this.sqref ? range.isIntersect(this.sqref) : false;
	};
	sparkline.prototype.contains = function (c, r) {
		return this.sqref ? this.sqref.contains(c, r) : false;
	};
	sparkline.prototype.intersectionSimple = function (range) {
		return this.sqref ? this.sqref.intersectionSimple(range) : false;
	};

// For Auto Filters
/** @constructor */
function TablePart(handlers) {
	this.Ref = null;
	this.HeaderRowCount = null;
	this.TotalsRowCount = null;
	this.DisplayName = null;
	this.AutoFilter = null;
	this.SortState = null;
	this.TableColumns = null;
	this.TableStyleInfo = null;
	
	this.altText = null;
	this.altTextSummary = null;
	
	this.result = null;
	this.handlers = handlers;
}
TablePart.prototype.clone = function() {
	var i, res = new TablePart(this.handlers);
	res.Ref = this.Ref ? this.Ref.clone() : null;
	res.HeaderRowCount = this.HeaderRowCount;
	res.TotalsRowCount = this.TotalsRowCount;
	if (this.AutoFilter)
		res.AutoFilter = this.AutoFilter.clone();
	if (this.SortState)
		res.SortState = this.SortState.clone();
	if (this.TableColumns) {
		res.TableColumns = [];
		for (i = 0; i < this.TableColumns.length; ++i)
			res.TableColumns.push(this.TableColumns[i].clone());
	}
	if (this.TableStyleInfo)
		res.TableStyleInfo = this.TableStyleInfo.clone();
	
	if (this.result) {
		res.result = [];
		for (i = 0; i < this.result.length; ++i)
			res.result.push(this.result[i].clone());
	}
	res.DisplayName = this.DisplayName;
	
	res.altText = this.altText;
	res.altTextSummary = this.altTextSummary;
	
	return res;
};
	TablePart.prototype.renameSheetCopy = function(ws, renameParams) {
		for (var i = 0; i < this.TableColumns.length; ++i) {
			this.TableColumns[i].renameSheetCopy(ws, renameParams);
		}
	};
	TablePart.prototype.removeDependencies = function(opt_cols) {
		if (!opt_cols) {
			opt_cols = this.TableColumns;
		}
		for (var i = 0; i < opt_cols.length; ++i) {
			opt_cols[i].removeDependencies();
		}
	};
	TablePart.prototype.buildDependencies = function() {
		for (var i = 0; i < this.TableColumns.length; ++i) {
			this.TableColumns[i].buildDependencies();
		}
	};
	TablePart.prototype.getAllFormulas = function(formulas) {
		for (var i = 0; i < this.TableColumns.length; ++i) {
			this.TableColumns[i].getAllFormulas(formulas);
		}
	};
TablePart.prototype.moveRef = function(col, row) {
	var ref = this.Ref.clone();
	ref.setOffset({offsetCol: col ? col : 0, offsetRow: row ? row : 0});

	this.Ref = ref;
	//event
	this.handlers.trigger("changeRefTablePart", this);

	if(this.AutoFilter)
	{
		this.AutoFilter.moveRef(col, row);
	}	
	if(this.SortState)
	{
		this.SortState.moveRef(col, row);
	}
};
TablePart.prototype.changeRef = function(col, row, bIsFirst, bIsNotChangeAutoFilter) {
	var ref = this.Ref.clone();
	if(bIsFirst)
		ref.setOffsetFirst({offsetCol: col ? col : 0, offsetRow: row ? row : 0});
	else
		ref.setOffsetLast({offsetCol: col ? col : 0, offsetRow: row ? row : 0});
	
	this.Ref = ref;
	
	//event
	this.handlers.trigger("changeRefTablePart", this);
	
	if(this.AutoFilter && !bIsNotChangeAutoFilter)
	{
		this.AutoFilter.changeRef(col, row, bIsFirst);
	}
	if(this.SortState)
	{
		this.SortState.changeRef(col, row, bIsFirst);
	}
};
TablePart.prototype.changeRefOnRange = function(range, autoFilters, generateNewTableColumns) {
	if(!range)
		return;
	
	//add table columns
	if(generateNewTableColumns)
	{
		var newTableColumns = [];
		var intersectionRanges = this.Ref.intersection(range);
		
		if(null !== intersectionRanges)
		{
			this.removeDependencies();
			var tableColumn;
			for(var i = range.c1; i <= range.c2; i++)
			{
				if(i >= intersectionRanges.c1 && i <= intersectionRanges.c2)
				{
					var tableIndex = i - this.Ref.c1;
					tableColumn = this.TableColumns[tableIndex];
				}
				else
				{
					tableColumn = new TableColumn();
				}
				
				newTableColumns.push(tableColumn);
			}
			
			for(var j = 0; j < newTableColumns.length; j++)
			{
				tableColumn = newTableColumns[j];
				if(tableColumn.Name === null)
					tableColumn.Name = autoFilters._generateColumnName2(newTableColumns);
			}
			
			this.TableColumns = newTableColumns;
			this.buildDependencies();
		}
	}
	this.Ref = Asc.Range(range.c1, range.r1, range.c2, range.r2);
	//event
	this.handlers.trigger("changeRefTablePart", this);
	
	if(this.AutoFilter)
		this.AutoFilter.changeRefOnRange(range);
};
TablePart.prototype.isApplyAutoFilter = function() {
	var res = false;
	
	if(this.AutoFilter)
		res = this.AutoFilter.isApplyAutoFilter();
		
	return res;
};
TablePart.prototype.isApplySortConditions = function() {
	var res = false;
	
	if(this.SortState && this.SortState.SortConditions && this.SortState.SortConditions[0])
		res = true;
		
	return res;
};

TablePart.prototype.setHandlers = function(handlers) {
	if(this.handlers === null)
		this.handlers = handlers;
};

TablePart.prototype.deleteTableColumns = function(activeRange)
{
	if(!activeRange)
		return;
	
	var diff = null, startCol;
	if(activeRange.c1 < this.Ref.c1 && activeRange.c2 > this.Ref.c1 && activeRange.c2 < this.Ref.c2)//until
	{
		diff = activeRange.c2 - this.Ref.c1 + 1;
		startCol = 0;
	}
	else if(activeRange.c1 < this.Ref.c2 && activeRange.c2 > this.Ref.c2 && activeRange.c1 > this.Ref.c1)//after
	{
		diff = this.Ref.c2 - activeRange.c1 + 1;
		startCol = activeRange.c1 - this.Ref.c1;
	}
	else if(activeRange.c1 >= this.Ref.c1 && activeRange.c2 <= this.Ref.c2)//inside
	{
		diff = activeRange.c2 - activeRange.c1 + 1;
		startCol = activeRange.c1 - this.Ref.c1;
	}

	if (diff !== null) {
		var deleted = this.TableColumns.splice(startCol, diff);
		this.removeDependencies(deleted);

		//todo undo
		var deletedMap = {};
		for (var i = 0; i < deleted.length; ++i) {
			deletedMap[deleted[i].Name] = 1;
		}
		this.handlers.trigger("deleteColumnTablePart", this.DisplayName, deletedMap);
		
		if(this.SortState) 
		{
			var bIsDeleteSortState = this.SortState.changeColumns(activeRange, true);
			if(bIsDeleteSortState)
			{
				this.SortState = null;
			}
		}
	}

};

TablePart.prototype.addTableColumns = function(activeRange, autoFilters)
{
	var newTableColumns = [], num = 0;
	this.removeDependencies();
	for(var j = 0; j < this.TableColumns.length;)
	{
		var curCol = num + this.Ref.c1;
		if(activeRange.c1 <= curCol && activeRange.c2 >= curCol)
		{
			newTableColumns[newTableColumns.length] = new TableColumn();
		}
		else
		{
			newTableColumns[newTableColumns.length] = this.TableColumns[j];
			j++
		}
		
		num++;
	}
	
	for(var j = 0; j < newTableColumns.length; j++)
	{
		var tableColumn = newTableColumns[j];
		if(tableColumn.Name === null)
			tableColumn.Name = autoFilters._generateColumnName2(newTableColumns);
	}
	
	this.TableColumns = newTableColumns;
	
	/*if(this.SortState && this.SortState.SortConditions && this.SortState.SortConditions[0])
	{
		var SortConditions = this.SortState.SortConditions[0];
		if(activeRange.c1 <= SortConditions.Ref.c1)
		{
			var offset = activeRange.c2 - activeRange.c1 + 1;
			SortConditions.Ref.c1 += offset;
			SortConditions.Ref.c2 += offset;
		}
	}*/
	
	if(this.SortState) 
	{
		this.SortState.changeColumns(activeRange);
	}
	
	this.buildDependencies();
};

TablePart.prototype.addTableLastColumn = function(activeRange, autoFilters, isAddLastColumn)
{
	this.removeDependencies();
	var newTableColumns = this.TableColumns;
	newTableColumns.push(new TableColumn());
	newTableColumns[newTableColumns.length - 1].Name = autoFilters._generateColumnName2(newTableColumns);
	
	this.TableColumns = newTableColumns;
	this.buildDependencies();
};

TablePart.prototype.isAutoFilter = function()
{
	return false;
};

TablePart.prototype.getTableRangeForFormula = function(objectParam)
{
	var res = null;
	var startRow = this.HeaderRowCount === null ? this.Ref.r1 + 1 : this.Ref.r1;
	var endRow = this.TotalsRowCount ? this.Ref.r2 - 1 : this.Ref.r2;
	switch(objectParam.param)
	{
		case FormulaTablePartInfo.all:
		{
			res = new Asc.Range(this.Ref.c1, this.Ref.r1, this.Ref.c2, this.Ref.r2);
			break;
		}
		case FormulaTablePartInfo.data:
		{
			res = new Asc.Range(this.Ref.c1, startRow, this.Ref.c2, endRow);
			break;
		}
		case FormulaTablePartInfo.headers:
		{
			if(this.HeaderRowCount === null) {
				res = new Asc.Range(this.Ref.c1, this.Ref.r1, this.Ref.c2, this.Ref.r1);
			} else if(!objectParam.toRef || objectParam.bConvertTableFormulaToRef) {
				res = new Asc.Range(this.Ref.c1, startRow, this.Ref.c2, endRow);
			}
			break;
		}
		case FormulaTablePartInfo.totals:
		{
			if(this.TotalsRowCount) {
				res = new Asc.Range(this.Ref.c1, this.Ref.r2, this.Ref.c2, this.Ref.r2);
			} else if(!objectParam.toRef || objectParam.bConvertTableFormulaToRef) {
				res = new Asc.Range(this.Ref.c1, startRow, this.Ref.c2, endRow);
			}
			break;
		}
		case FormulaTablePartInfo.thisRow:
		{
			if (objectParam.cell) {
				if (startRow <= objectParam.cell.r1 && objectParam.cell.r1 <= endRow) {
					res = new Asc.Range(this.Ref.c1, objectParam.cell.r1, this.Ref.c2, objectParam.cell.r1);
				} else if (objectParam.bConvertTableFormulaToRef) {
					res = new Asc.Range(this.Ref.c1, startRow, this.Ref.c2, endRow);
				}
			} else {
				if (objectParam.bConvertTableFormulaToRef) {
					res = new Asc.Range(this.Ref.c1, 0, this.Ref.c2, 0);
				} else {
					res = new Asc.Range(this.Ref.c1, startRow, this.Ref.c2, endRow);
				}
			}
			break;
		}
		case FormulaTablePartInfo.columns:
		{
			var startCol = this.getTableIndexColumnByName(objectParam.startCol);
			var endCol = this.getTableIndexColumnByName(objectParam.endCol);
			
			if(startCol === null)
				break;
			if(endCol === null)
				endCol = startCol;

			res = new Asc.Range(this.Ref.c1 + startCol, startRow, this.Ref.c1 + endCol, endRow);
			break;
		}
	}
	if (res) {
		if (objectParam.param === FormulaTablePartInfo.thisRow) {
			res.setAbs(false, true, false, true);
		} else {
			res.setAbs(true, true, true, true);
		}
	}
	return res;
};

TablePart.prototype.getTableIndexColumnByName = function(name)
{
	var res = null;
	if(name === null || name === undefined || !this.TableColumns)
		return res;
		
	for(var i = 0; i < this.TableColumns.length; i++)
	{
		if(name.toLowerCase() === this.TableColumns[i].Name.toLowerCase())
		{
			res = i;
			break;
		}
	}
	
	return res;
};

TablePart.prototype.getTableNameColumnByIndex = function(index)
{
	var res = null;
	if(index === null || index === undefined || !this.TableColumns)
		return res;
		
	for(var i = 0; i < this.TableColumns.length; i++)
	{
		if(index === i)
		{
			res = this.TableColumns[i].Name;
			break;
		}
	}
	
	return res;
};

TablePart.prototype.showButton = function(val)
{
	if(val === false)
	{
		if(!this.AutoFilter)
		{
			this.AutoFilter = new AutoFilter();
			this.AutoFilter.Ref = this.Ref;
		}
		
		this.AutoFilter.showButton(val);
	}
	else
	{
		if(this.AutoFilter && this.AutoFilter.FilterColumns && this.AutoFilter.FilterColumns.length)
		{
			this.AutoFilter.showButton(val);
		}
	}
};

TablePart.prototype.isShowButton = function()
{
	var res = false;
	
	if(this.AutoFilter)
	{
		res = this.AutoFilter.isShowButton();
	}
	else
	{
		res = null;
	}
	
	return res;
};

TablePart.prototype.generateTotalsRowLabel = function(ws)
{
	if(!this.TableColumns)
	{
		return;
	}
	
	//в случае одной колонки выставляем только формулу
	if(this.TableColumns.length > 1)
	{
		this.TableColumns[0].generateTotalsRowLabel();
	}
	this.TableColumns[this.TableColumns.length - 1].generateTotalsRowFunction(ws, this);
};

TablePart.prototype.changeDisplayName = function(newName)
{
	this.DisplayName = newName;
}; 

TablePart.prototype.getRangeWithoutHeaderFooter = function()
{
	var startRow = this.HeaderRowCount === null ? this.Ref.r1 + 1 : this.Ref.r1;
	var endRow = this.TotalsRowCount ? this.Ref.r2 - 1 : this.Ref.r2;
	
	return Asc.Range(this.Ref.c1, startRow, this.Ref.c2, endRow);
};

TablePart.prototype.checkTotalRowFormula = function(ws)
{
	for (var i = 0; i < this.TableColumns.length; i++) {
		this.TableColumns[i].checkTotalRowFormula(ws, this);
	}
};

TablePart.prototype.changeAltText = function(val)
{
	this.altText = val;
};

TablePart.prototype.changeAltTextSummary = function(val)
{
	this.altTextSummary = val;
};

TablePart.prototype.addAutoFilter = function()
{
	var autoFilter = new AscCommonExcel.AutoFilter();
	var cloneRef = this.Ref.clone();
	if(this.TotalsRowCount)
	{
		cloneRef.r2--
	}
	autoFilter.Ref = cloneRef;
	
	this.AutoFilter = autoFilter;
	return autoFilter;
};

TablePart.prototype.isHeaderRow = function()
{
	return null === this.HeaderRowCount || this.HeaderRowCount > 0; 
};

TablePart.prototype.isTotalsRow = function()
{
	return this.TotalsRowCount > 0; 
};


/** @constructor */
function AutoFilter() {
	this.Ref = null;
	this.FilterColumns = null;
	this.SortState = null;
	
	this.result = null;
}
AutoFilter.prototype.clone = function() {
	var i, res = new AutoFilter();
	res.Ref = this.Ref ? this.Ref.clone() : null;
	res.refTable = this.refTable ? this.refTable.clone() : null;
	if (this.FilterColumns) {
		res.FilterColumns = [];
		for (i = 0; i < this.FilterColumns.length; ++i)
			res.FilterColumns.push(this.FilterColumns[i].clone());
	}
	
	if (this.SortState)
		res.SortState = this.SortState.clone();
		
	if (this.result) {
		res.result = [];
		for (i = 0; i < this.result.length; ++i)
			res.result.push(this.result[i].clone());
	}
	
	return res;
};

AutoFilter.prototype.addFilterColumn = function() {
	if(this.FilterColumns === null)
		this.FilterColumns = [];
	
	var oNewElem = new FilterColumn();
	this.FilterColumns.push(oNewElem);
	
	return oNewElem;
};
AutoFilter.prototype.moveRef = function(col, row) {
	var ref = this.Ref.clone();
	ref.setOffset({offsetCol: col ? col : 0, offsetRow: row ? row : 0});
	
	if(this.SortState)
	{
		this.SortState.moveRef(col, row);
	}
	
	this.Ref = ref;
};
AutoFilter.prototype.changeRef = function(col, row, bIsFirst) {
	var ref = this.Ref.clone();
	if(bIsFirst)
		ref.setOffsetFirst({offsetCol: col ? col : 0, offsetRow: row ? row : 0});
	else
		ref.setOffsetLast({offsetCol: col ? col : 0, offsetRow: row ? row : 0});
	
	this.Ref = ref;
};
AutoFilter.prototype.changeRefOnRange = function(range) {
	if(!range)
		return;
		
	this.Ref = Asc.Range(range.c1, range.r1, range.c2, range.r2);
	
	if(this.AutoFilter)
		this.AutoFilter.changeRefOnRange(range);
};
AutoFilter.prototype.isApplyAutoFilter = function() {
	var res = false;
	
	if(this.FilterColumns && this.FilterColumns.length)
	{
		for(var i = 0; i < this.FilterColumns.length; i++)
		{
			if(this.FilterColumns[i].isApplyAutoFilter())
			{
				res = true;
				break;
			}
		}
	}
		
	return res;
};

AutoFilter.prototype.isApplySortConditions = function() {
	var res = false;
	
	if(this.SortState && this.SortState.SortConditions && this.SortState.SortConditions[0])
		res = true;
		
	return res;
};

AutoFilter.prototype.isAutoFilter = function()
{
	return true;
};

AutoFilter.prototype.cleanFilters = function() {
	if(!this.FilterColumns)
		return;
	
	for(var i = 0; i < this.FilterColumns.length; i++)
	{
		if(this.FilterColumns[i].ShowButton === false)
			this.FilterColumns[i].clean();
		else
		{
			this.FilterColumns.splice(i, 1);
			i--;
		}	
	}
};

AutoFilter.prototype.showButton = function(val) {
	
	if(val === false)
	{
		if(this.FilterColumns === null)
		{
			this.FilterColumns = [];
		}
		
		var columnsLength = this.Ref.c2 - this.Ref.c1 + 1;
		for(var i = 0; i < columnsLength; i++)
		{
			var filterColumn = this._getFilterColumnByColId(i);
			if(filterColumn)
			{
				filterColumn.ShowButton = false;
			}
			else
			{
				filterColumn = new FilterColumn();
				filterColumn.ColId = i;
				filterColumn.ShowButton = false;
				this.FilterColumns.push(filterColumn);
			}
		}
	}
	else
	{
		if(this.FilterColumns && this.FilterColumns.length)
		{
			for(var i = 0; i < this.FilterColumns.length; i++)
			{
				this.FilterColumns[i].ShowButton = true;
			}
		}
	}
};

AutoFilter.prototype.isShowButton = function()
{
	var res = true;
	
	if(this.FilterColumns && this.FilterColumns.length)
	{
		for(var i = 0; i < this.FilterColumns.length; i++)
		{
			if(this.FilterColumns[i].ShowButton === false)
			{
				res = false;
				break;
			}
		}
	}
	
	return res;
};

AutoFilter.prototype.getRangeWithoutHeaderFooter = function()
{
	return Asc.Range(this.Ref.c1, this.Ref.r1 + 1, this.Ref.c2, this.Ref.r2);
}; 

AutoFilter.prototype._getFilterColumnByColId = function(colId)
{
	var res = false;
	
	if(this.FilterColumns && this.FilterColumns.length)
	{
		for(var i = 0; i < this.FilterColumns.length; i++)
		{
			if(this.FilterColumns[i].ColId === colId)
			{
				res = this.FilterColumns[i];
				break;
			}
		}
	}
	
	return res;
};

//функция используется только для изменения данных сортировки, называется так как и в классе TablePart. возможно стоит переименовать.
AutoFilter.prototype.deleteTableColumns = function(activeRange)
{
	if(this.SortState) 
	{
		var bIsDeleteSortState = this.SortState.changeColumns(activeRange, true);
		if(bIsDeleteSortState)
		{
			this.SortState = null;
		}
	}
};

//функция используется только для изменения данных сортировки, называется так как и в классе TablePart. возможно стоит переименовать.
AutoFilter.prototype.addTableColumns = function(activeRange)
{
	if(this.SortState) 
	{
		this.SortState.changeColumns(activeRange);
	}
};

function FilterColumns() {
	this.ColId = null;
	this.CustomFiltersObj = null;
}
FilterColumns.prototype.clone = function() {
	var res = new FilterColumns();
	res.ColId = this.ColId;
	if(this.CustomFiltersObj)
		res.CustomFiltersObj = this.CustomFiltersObj.clone();
	
	return res;
};

/** @constructor */
function SortState() {
	this.Ref = null;
	this.CaseSensitive = null;
	this.SortConditions = null;
}

SortState.prototype.clone = function() {
	var i, res = new SortState();
	res.Ref = this.Ref ? this.Ref.clone() : null;
	res.CaseSensitive = this.CaseSensitive;
	if (this.SortConditions) {
		res.SortConditions = [];
		for (i = 0; i < this.SortConditions.length; ++i)
			res.SortConditions.push(this.SortConditions[i].clone());
	}
	return res;
};

SortState.prototype.moveRef = function(col, row) {
	var ref = this.Ref.clone();
	ref.setOffset({offsetCol: col ? col : 0, offsetRow: row ? row : 0});
	
	this.Ref = ref;
	
	if (this.SortConditions) {
		for (var i = 0; i < this.SortConditions.length; ++i)
			this.SortConditions[i].moveRef(col, row);
	}
};

SortState.prototype.changeRef = function(col, row, bIsFirst) {
	var ref = this.Ref.clone();
	if(bIsFirst)
		ref.setOffsetFirst({offsetCol: col ? col : 0, offsetRow: row ? row : 0});
	else
		ref.setOffsetLast({offsetCol: col ? col : 0, offsetRow: row ? row : 0});
	
	this.Ref = ref;
};

SortState.prototype.changeColumns = function(activeRange, isDelete)
{
	var bIsSortStateDelete = true;
	//если изменяем диапазон так, что удаляется колонка с сортировкой, удаляем ее
	if (this.SortConditions) 
	{
		for (var i = 0; i < this.SortConditions.length; ++i)
		{
			var bIsSortConditionsDelete = this.SortConditions[i].changeColumns(activeRange, isDelete);
			if(bIsSortConditionsDelete)
			{
				this.SortConditions[i] = null;
			}
			else
			{
				bIsSortStateDelete = false;
			}
		}
	}
	return bIsSortStateDelete;
};


/** @constructor */
function TableColumn() {
	this.Name = null;
	this.TotalsRowLabel = null;
	this.TotalsRowFunction = null;
	this.TotalsRowFormula = null;
	this.dxf = null;
	this.CalculatedColumnFormula = null;
}
	TableColumn.prototype.onFormulaEvent = function(type, eventData) {
		if (AscCommon.c_oNotifyParentType.CanDo === type) {
			return true;
		} else if (AscCommon.c_oNotifyParentType.Change === type) {
			this.TotalsRowFormula.setIsDirty(false);
		}
	};
	TableColumn.prototype.renameSheetCopy = function(ws, renameParams) {
		if (this.TotalsRowFormula) {
			this.buildDependencies();
			this.TotalsRowFormula.renameSheetCopy(renameParams);
			this.applyTotalRowFormula(this.TotalsRowFormula.assemble(true), ws, true);
		}
	};
	TableColumn.prototype.buildDependencies = function() {
		if (this.TotalsRowFormula) {
			this.TotalsRowFormula.parse();
			this.TotalsRowFormula.buildDependencies();
		}
	};
	TableColumn.prototype.removeDependencies = function() {
		if (this.TotalsRowFormula) {
			this.TotalsRowFormula.removeDependencies();
		}
	};
	TableColumn.prototype.getAllFormulas = function(formulas) {
		if (this.TotalsRowFormula) {
			formulas.push(this.TotalsRowFormula);
		}
	};
TableColumn.prototype.clone = function() {
	var res = new TableColumn();
	res.Name = this.Name;
	res.TotalsRowLabel = this.TotalsRowLabel;
	res.TotalsRowFunction = this.TotalsRowFunction;

	if (this.TotalsRowFormula) {
		res.applyTotalRowFormula(this.TotalsRowFormula.Formula, this.TotalsRowFormula.ws, false);
	}
	if (this.dxf)
		res.dxf = this.dxf.clone;
	res.CalculatedColumnFormula = this.CalculatedColumnFormula;
	return res;
};
TableColumn.prototype.generateTotalsRowLabel = function(){
	//TODO добавить в перевод
	if(this.TotalsRowLabel === null)
	{	
		this.TotalsRowLabel = "Summary";
	}
};
TableColumn.prototype.generateTotalsRowFunction = function(ws, tablePart){
	//TODO добавить в перевод
	if(null === this.TotalsRowFunction && null === this.TotalsRowLabel)
	{	
		this.TotalsRowFunction = Asc.ETotalsRowFunction.totalrowfunctionSum;
		//this.setTotalsRowFormula("SUBTOTAL(109," + tablePart.DisplayName + "[" + this.Name + "])", ws);
	}
};

TableColumn.prototype.getTotalRowFormula = function(tablePart){
	var res = null;
	
	if(null !== this.TotalsRowFunction)
	{
		switch(this.TotalsRowFunction)
		{
			case Asc.ETotalsRowFunction.totalrowfunctionAverage:
			{
				res = "SUBTOTAL(101," + tablePart.DisplayName + "[" + this.Name + "])";
				break;
			}
			case Asc.ETotalsRowFunction.totalrowfunctionCount:
			{
				res = "SUBTOTAL(103," + tablePart.DisplayName + "[" + this.Name + "])";
				break;
			}
			case Asc.ETotalsRowFunction.totalrowfunctionCountNums:
			{
				break;
			}
			case Asc.ETotalsRowFunction.totalrowfunctionCustom:
			{
				res = this.getTotalsRowFormula();
				break;
			}
			case Asc.ETotalsRowFunction.totalrowfunctionMax:
			{
				res = "SUBTOTAL(104," + tablePart.DisplayName + "[" + this.Name + "])";
				break;
			}
			case Asc.ETotalsRowFunction.totalrowfunctionMin:
			{
				res = "SUBTOTAL(105," + tablePart.DisplayName + "[" + this.Name + "])";
				break;
			}
			case Asc.ETotalsRowFunction.totalrowfunctionNone:
			{
				break;
			}
			case Asc.ETotalsRowFunction.totalrowfunctionStdDev:
			{
				res = "SUBTOTAL(107," + tablePart.DisplayName + "[" + this.Name + "])";
				break;
			}
			case Asc.ETotalsRowFunction.totalrowfunctionSum:
			{
				res = "SUBTOTAL(109," + tablePart.DisplayName + "[" + this.Name + "])";
				break;
			}
			case Asc.ETotalsRowFunction.totalrowfunctionVar:
			{
				res = "SUBTOTAL(110," + tablePart.DisplayName + "[" + this.Name + "])";
				break;
			}
		}
	}
	
	return res;
};

TableColumn.prototype.cleanTotalsData = function(){
	this.CalculatedColumnFormula = null;
	this.applyTotalRowFormula(null, null, false);
	this.TotalsRowFunction = null;
	this.TotalsRowLabel = null;
};
	TableColumn.prototype.getTotalsRowFormula = function(){
		return this.TotalsRowFormula ? this.TotalsRowFormula.getFormula() : null;
	};
TableColumn.prototype.setTotalsRowFormula = function(val, ws){
	this.cleanTotalsData();
	if("=" === val[0])
	{
		val = val.substring(1);
	}
	this.applyTotalRowFormula(val, ws, true);
	this.TotalsRowFunction = Asc.ETotalsRowFunction.totalrowfunctionCustom;
};

TableColumn.prototype.setTotalsRowLabel = function(val){
	this.cleanTotalsData();
	
	this.TotalsRowLabel = val;
};

TableColumn.prototype.checkTotalRowFormula = function(ws, tablePart){
	if(null !== this.TotalsRowFunction && Asc.ETotalsRowFunction.totalrowfunctionCustom !== this.TotalsRowFunction)
	{
		var totalRowFormula = this.getTotalRowFormula(tablePart);
		
		if(null !== totalRowFormula)
		{
			this.applyTotalRowFormula(totalRowFormula, ws, true);
			this.TotalsRowFunction = Asc.ETotalsRowFunction.totalrowfunctionCustom;
		}
	}
};
	TableColumn.prototype.applyTotalRowFormula = function(val, opt_ws, opt_buildDep) {
		this.removeDependencies();
		if (val) {
			this.TotalsRowFormula = new AscCommonExcel.parserFormula(val, this, opt_ws);
			if (opt_buildDep) {
				this.buildDependencies();
			}
		} else {
			this.TotalsRowFormula = null;
		}
	};

/** @constructor */
function TableStyleInfo() {
	this.Name = null;
	this.ShowColumnStripes = null;
	this.ShowRowStripes = null;
	this.ShowFirstColumn = null;
	this.ShowLastColumn = null;
}
TableStyleInfo.prototype.clone = function() {
	var res = new TableStyleInfo();
	res.Name = this.Name;
	res.ShowColumnStripes = this.ShowColumnStripes;
	res.ShowRowStripes = this.ShowRowStripes;
	res.ShowFirstColumn = this.ShowFirstColumn;
	res.ShowLastColumn = this.ShowLastColumn;
	return res;
};
/** @constructor */
function FilterColumn() {
	this.ColId = null;
	this.Filters = null;
	this.CustomFiltersObj = null;
	this.DynamicFilter = null;
	this.ColorFilter = null;
	this.Top10 = null;
	this.ShowButton = true;
}
FilterColumn.prototype.clone = function() {
	var res = new FilterColumn();
	res.ColId = this.ColId;
	if (this.Filters) {
		res.Filters = this.Filters.clone();
	}
	if (this.CustomFiltersObj) {
		res.CustomFiltersObj = this.CustomFiltersObj.clone();
	}
	if (this.DynamicFilter) {
		res.DynamicFilter = this.DynamicFilter.clone();
	}
	if (this.ColorFilter) {
		res.ColorFilter = this.ColorFilter.clone();
	}
	if (this.Top10) {
		res.Top10 = this.Top10.clone();
	}
	res.ShowButton = this.ShowButton;
	return res;
};
FilterColumn.prototype.isHideValue = function(val, isDateTimeFormat, top10Length, cell) {
	var res = false;
	if(this.Filters)
	{
		this.Filters._initLowerCaseValues();
		res = this.Filters.isHideValue(val.toLowerCase(), isDateTimeFormat);
	}
	else if(this.CustomFiltersObj)
	{
		res = this.CustomFiltersObj.isHideValue(val);
	}
	else if(this.Top10)
	{
		res = this.Top10.isHideValue(val, top10Length);
	}
	else if(this.ColorFilter)
	{
		res = this.ColorFilter.isHideValue(cell);
	}
	else if(this.DynamicFilter)
	{
		res = this.DynamicFilter.isHideValue(val);
	}
		
	return res;
};
FilterColumn.prototype.clean = function() {
	this.Filters = null;
	this.CustomFiltersObj = null;
	this.DynamicFilter = null;
	this.ColorFilter = null;
	this.Top10 = null;
};
FilterColumn.prototype.createFilter = function(obj) {
	
	var allFilterOpenElements = false;
	var newFilter;
	
	switch (obj.filter.type)
	{
		case c_oAscAutoFilterTypes.ColorFilter:
		{
			this.ColorFilter = obj.filter.filter.clone();
			break;
		}
		case c_oAscAutoFilterTypes.CustomFilters:
		{
			this.CustomFiltersObj = obj.filter.filter.clone();
			break;
		}	
		case c_oAscAutoFilterTypes.DynamicFilter:
		{
			this.DynamicFilter = obj.filter.filter.clone();
			break;
		}
		case c_oAscAutoFilterTypes.Top10:
		{
			this.Top10 = obj.filter.filter.clone();
			break;
		}	
		case c_oAscAutoFilterTypes.Filters:
		{
			newFilter = new Filters();
			allFilterOpenElements = newFilter.init(obj);
			
			if(!allFilterOpenElements)
			{
				this.Filters = newFilter;
			}
			
			break;
		}	
	}	
	
	return allFilterOpenElements;
};
FilterColumn.prototype.isApplyAutoFilter = function() {
	var res = false;
	
	if(this.Filters !== null || this.CustomFiltersObj !== null || this.DynamicFilter !== null || this.ColorFilter !== null || this.Top10 !== null)
		res = true;
		
	return res;
};

FilterColumn.prototype.init = function(range) {
	
	//добавляем данные, которые не передаются из меню при примененни а/ф(в данном случае только DynamicFilter)
	if(null !== this.DynamicFilter)
	{
		this.DynamicFilter.init(range);
	}
	else if(null !== this.Top10)
	{
		this.Top10.init(range);
	}
	
};



/** @constructor */
function Filters() {
	this.Values = {};
	this.Dates = [];
	this.Blank = null;
	
	this.lowerCaseValues = null;
}
Filters.prototype.clone = function() {
	var i, res = new Filters();
	for(var i in this.Values)
		res.Values[i] = this.Values[i];
	if (this.Dates) {
		for (i = 0; i < this.Dates.length; ++i)
			res.Dates.push(this.Dates[i].clone());
	}
	res.Blank = this.Blank;
	return res;
};
Filters.prototype.init = function(obj) {
	var allFilterOpenElements = true;
	for(var i = 0; i < obj.values.length; i++)
	{
		if(obj.values[i].visible)
		{
			if(obj.values[i].isDateFormat)
			{
				if(obj.values[i].text === "")
				{
					this.Blank = true;
				}
				else
				{
					var dateGroupItem = new DateGroupItem();
					var autoFilterDateElem = new AutoFilterDateElem(obj.values[i].val, obj.values[i].val, 1);
					dateGroupItem.convertRangeToDateGroupItem(autoFilterDateElem);
					autoFilterDateElem.convertDateGroupItemToRange(dateGroupItem);
					
					this.Dates.push(autoFilterDateElem);
				}
			}
			else
			{
				if(obj.values[i].text === "")
					this.Blank = true;
				else
					this.Values[obj.values[i].text] = true;
			}
		}	
		else
			allFilterOpenElements = false;
	}
	this._sortDate();
	this._initLowerCaseValues();

	return allFilterOpenElements;
};
Filters.prototype.isHideValue = function(val, isDateTimeFormat) {
	var res = false;
	
	if(isDateTimeFormat && this.Dates)
	{
		if(val === "")
		{
			res = !this.Blank ? true : false;
		}
		else
		{
			res = this.binarySearch(val, this.Dates) !== -1 ? false : true;
		}
	}
	else if(this.Values)
	{
		if(val === "")
		{
			res = !this.Blank ? true : false;
		}
		else
		{
			res = !this.lowerCaseValues[val] ? true : false;
		}
	}
	
	return res;
};

Filters.prototype.binarySearch = function(val, array) {
	var i = 0, j = array.length - 1, k;
	val = parseFloat(val);

	while (i <= j)
	{
		k = Math.floor((i + j) / 2);
		
		if (val >= array[k].start && val < array[k].end) 
			return k;
		else if (val < array[k].start)
			j = k - 1;
		else
			i = k + 1;
	}

	return -1; 
};

Filters.prototype.linearSearch = function(val, array) {
	var n = array.length, i = 0;
	val = parseFloat(val);

	while (i <= n && !(array[i] && val >= array[i].start && val < array[i].end))
		i++;
 
	if (i < n)
		return i;
	else
		return -1;
};
Filters.prototype._initLowerCaseValues = function() {
	if(this.lowerCaseValues === null)
	{
		this.lowerCaseValues = {};
		for(var i in this.Values)
		{
			this.lowerCaseValues[i.toLowerCase()] = true;
		}
	}
};
Filters.prototype._sortDate = function()
{
	if(this.Dates && this.Dates.length)
	{
		this.Dates.sort (function sortArr(a, b)
		{
			return a.start - b.start;
		})
	}
};

Filters.prototype.clean = function()
{
	this.Values = {};
	this.Dates = [];
	this.Blank = null;
};
	
/** @constructor */
function Filter() {
	this.Val = null;
}
/** @constructor */
function DateGroupItem() {
	this.DateTimeGrouping = null;
	this.Day = null;
	this.Hour = null;
	this.Minute = null;
	this.Month = null;
	this.Second = null;
	this.Year = null;
}
DateGroupItem.prototype.clone = function() {
	var res = new DateGroupItem();
	res.DateTimeGrouping = this.DateTimeGrouping;
	res.Day = this.Day;
	res.Hour = this.Hour;
	res.Minute = this.Minute;
	res.Month = this.Month;
	res.Second = this.Second;
	res.Year = this.Year;
	return res;
};
DateGroupItem.prototype.convertRangeToDateGroupItem = function(range) {
	var startUtcDate = AscCommon.NumFormat.prototype.parseDate(range.start);
	var year = startUtcDate.year;
	var month = startUtcDate.month + 1;
	var day = startUtcDate.d;
	var hour = startUtcDate.hour;
	var minute = startUtcDate.minute;
	var second = startUtcDate.second;
	
	this.DateTimeGrouping = range.dateTimeGrouping;
	
	switch(this.DateTimeGrouping)
	{
		case 1://day
		{
			this.Year = year;
			this.Month = month;
			this.Day = day;
			break;
		}
		case 2://hour
		{
			this.Year = year;
			this.Month = month;
			this.Day = day;
			this.Hour = hour;
			break;
		}
		case 3://minute
		{
			this.Year = year;
			this.Month = month;
			this.Day = day;
			this.Hour = hour;
			this.Minute = minute;
			break;
		}
		case 4://month
		{
			this.Year = year;
			this.Month = month;
			break;
		}
		case 5://second
		{
			this.Year = year;
			this.Month = month;
			this.Day = day;
			this.Hour = hour;
			this.Minute = minute;
			this.Second = second;
			break;
		}
		case 6://year
		{
			this.Year = year;
			break;
		}
	}
};


var g_oCustomFilters = {
	And	 : 0,
	CustomFilters	: 1
};
/** @constructor */
function CustomFilters() {
	this.Properties = g_oCustomFilters;
	
	this.And = null;
	this.CustomFilters = null;
}
CustomFilters.prototype.getType = function() {
	return UndoRedoDataTypes.CustomFilters;
};
CustomFilters.prototype.getProperties = function() {
	return this.Properties;
};
CustomFilters.prototype.getProperty = function(nType) {
	switch (nType) {
		case this.Properties.And: return this.And; break;
		case this.Properties.CustomFilters: return this.CustomFilters; break;
	}
	return null;
};
CustomFilters.prototype.setProperty = function(nType, value) {
	switch (nType) {
		case this.Properties.And: this.And = value;break;
		case this.Properties.CustomFilters: this.CustomFilters = value;break;
	}
};
	
CustomFilters.prototype.clone = function() {
	var i, res = new CustomFilters();
	res.And = this.And;
	if (this.CustomFilters) {
		res.CustomFilters = [];
		for (i = 0; i < this.CustomFilters.length; ++i)
			res.CustomFilters.push(this.CustomFilters[i].clone());
	}
	return res;
};
CustomFilters.prototype.init = function(obj) {
	this.And = !obj.isChecked;
	this.CustomFilters = [];
	
	if(obj.filter1 != undefined)
		this.CustomFilters[0] = new CustomFilter(obj.filter1, obj.valFilter1);
	if(obj.filter2 != undefined)
		this.CustomFilters[1] = new CustomFilter(obj.filter2, obj.valFilter2);
};
CustomFilters.prototype.isHideValue = function(val){
	
	var res = false;
	var filterRes1 = this.CustomFilters[0] ? this.CustomFilters[0].isHideValue(val) : null;
	var filterRes2 = this.CustomFilters[1] ? this.CustomFilters[1].isHideValue(val) : null;
	
	if(!this.And && ((filterRes1 === null && filterRes2 === true || filterRes1 === true && filterRes2 === null || filterRes1 === true && filterRes2 === true)))
		res = true;
	if(this.And && ((filterRes1 === true || filterRes2 === true)))
		res = true;
	
	return res;
};
CustomFilters.prototype.asc_getAnd = function () { return this.And; };
CustomFilters.prototype.asc_getCustomFilters = function () { return this.CustomFilters; };

CustomFilters.prototype.asc_setAnd = function (val) { this.And = val; };
CustomFilters.prototype.asc_setCustomFilters = function (val) { this.CustomFilters = val; };

var g_oCustomFilter = {
	Operator	 : 0,
	Val	: 1
};

/** @constructor */
function CustomFilter(operator, val) {
	this.Properties = g_oCustomFilter;
	
	this.Operator = operator != undefined ? operator : null;
	this.Val = val != undefined ? val : null;
}
CustomFilter.prototype.getType = function() {
	return UndoRedoDataTypes.CustomFilter;
};
CustomFilter.prototype.getProperties = function() {
	return this.Properties;
};
CustomFilter.prototype.getProperty = function(nType) {
	switch (nType) {
		case this.Properties.Operator: return this.Operator; break;
		case this.Properties.Val: return this.Val; break;
	}
	return null;
};
CustomFilter.prototype.setProperty = function(nType, value) {
	switch (nType) {
		case this.Properties.Operator: this.Operator = value;break;
		case this.Properties.Val: this.Val = value;break;
	}
};

CustomFilter.prototype.clone = function() {
	var res = new CustomFilter();
	res.Operator = this.Operator;
	res.Val = this.Val;
	return res;
};
CustomFilter.prototype.init = function(operator, val) {
	this.Operator = operator;
	this.Val = val;
};
CustomFilter.prototype.isHideValue = function(val) {

	var result = false;
	var isDigitValue = isNaN(val) ? false : true;
	if(!isDigitValue)
	{
		val = val.toLowerCase();
	}

	var checkComplexSymbols = null, filterVal;
	if(checkComplexSymbols != null)
	{
		result = checkComplexSymbols;
	}
	else
	{
		var isNumberFilter = this.Operator == c_oAscCustomAutoFilter.isGreaterThan || this.Operator == c_oAscCustomAutoFilter.isGreaterThanOrEqualTo || this.Operator == c_oAscCustomAutoFilter.isLessThan || this.Operator == c_oAscCustomAutoFilter.isLessThanOrEqualTo;
		
		if(c_oAscCustomAutoFilter.equals === this.Operator || c_oAscCustomAutoFilter.doesNotEqual === this.Operator)
		{
			filterVal = isNaN(this.Val) ? this.Val.toLowerCase() : this.Val;
		}
		else if(isNumberFilter)
		{
			if(isNaN(this.Val))
			{
				filterVal =  this.Val;
			}
			else
			{
				filterVal =  parseFloat(this.Val);
				val = parseFloat(val);
			}
		}
		else
		{
			filterVal = isNaN(this.Val) ? this.Val.toLowerCase() : this.Val;
		}
		
		switch (this.Operator)
		{
			case c_oAscCustomAutoFilter.equals://equals
			{
				if(val === filterVal)
				{
					result = true;
				}
				
				break;
			}
			case c_oAscCustomAutoFilter.doesNotEqual://doesNotEqual
			{
				if(val !== filterVal)
				{
					result = true;
				}
					
				break;
			}
			
			case c_oAscCustomAutoFilter.isGreaterThan://isGreaterThan
			{
				if(val > filterVal)
				{
					result = true;
				}	
				
				break;
			}
			case c_oAscCustomAutoFilter.isGreaterThanOrEqualTo://isGreaterThanOrEqualTo
			{
				if(val >= filterVal)
				{
					result = true;
				}	
				
				break;
			}
			case c_oAscCustomAutoFilter.isLessThan://isLessThan
			{
				if(val < filterVal)
				{
					result = true;
				}
				
				break;
			}
			case c_oAscCustomAutoFilter.isLessThanOrEqualTo://isLessThanOrEqualTo
			{
				if(val <= filterVal)
				{
					result = true;
				}
				
				break;
			}
			case c_oAscCustomAutoFilter.beginsWith://beginsWith
			{
				if(!isDigitValue)
				{
					if(val.startsWith(filterVal))
						result = true;
				}
				
				break;
			}
			case c_oAscCustomAutoFilter.doesNotBeginWith://doesNotBeginWith
			{
				if(!isDigitValue)
				{
					if(!val.startsWith(filterVal))
						result = true;
				}
				else
					result = true;
				
				break;
			}
			case c_oAscCustomAutoFilter.endsWith://endsWith
			{
				if(!isDigitValue)
				{
					if(val.endsWith(filterVal))
						result = true;
				}
				
				break;
			}
			case c_oAscCustomAutoFilter.doesNotEndWith://doesNotEndWith
			{
				if(!isDigitValue)
				{
					if(!val.endsWith(filterVal))
						result = true;
				}
				else
					result = true;
				
				break;
			}
			case c_oAscCustomAutoFilter.contains://contains
			{
				if(!isDigitValue)
				{
					if(val.indexOf(filterVal) !== -1)
						result = true;
				}
				
				break;
			}
			case c_oAscCustomAutoFilter.doesNotContain://doesNotContain
			{
				if(!isDigitValue)
				{
					if(val.indexOf(filterVal) === -1)
						result = true;
				}
				else
					result = true;
				
				break;
			}
		}
	}	
	
	return !result;
};

CustomFilter.prototype.asc_getOperator = function () { return this.Operator; };
CustomFilter.prototype.asc_getVal = function () { return this.Val; };

CustomFilter.prototype.asc_setOperator = function (val) { this.Operator = val; };
CustomFilter.prototype.asc_setVal = function (val) { this.Val = val; };


var g_oDynamicFilter = {
	Type : 0,
	Val	: 1,
	MaxVal: 2
};

/** @constructor */
function DynamicFilter() {
	this.Properties = g_oDynamicFilter;
	
	this.Type = null;
	this.Val = null;
	this.MaxVal = null;
}
DynamicFilter.prototype.getType = function() {
	return UndoRedoDataTypes.DynamicFilter;
};
DynamicFilter.prototype.getProperties = function() {
	return this.Properties;
};
DynamicFilter.prototype.getProperty = function(nType) {
	switch (nType) {
		case this.Properties.Type: return this.Type; break;
		case this.Properties.Val: return this.Val; break;
		case this.Properties.MaxVal: return this.MaxVal; break;
	}
	return null;
};
DynamicFilter.prototype.setProperty = function(nType, value) {
	switch (nType) {
		case this.Properties.Type: this.Type = value;break;
		case this.Properties.Val: this.Val = value;break;
		case this.Properties.MaxVal: this.MaxVal = value;break;
	}
};
DynamicFilter.prototype.clone = function() {
	var res = new DynamicFilter();
	res.Type = this.Type;
	res.Val = this.Val;
	res.MaxVal = this.MaxVal;
	return res;
};

DynamicFilter.prototype.init = function(range) {
	var res = null;
	
	switch(this.Type)
	{
		case Asc.c_oAscDynamicAutoFilter.aboveAverage:
		case Asc.c_oAscDynamicAutoFilter.belowAverage:
		{
			var summ = 0;
			var counter = 0;
			
			range._foreach2(function(cell){
				var val = parseFloat(cell.getValueWithoutFormat());
				
				if(!isNaN(val))
				{
					summ += parseFloat(val);
					counter++;
				}
				
			});
			res = summ / counter;
			
			break;
		}
	}
	
	this.Val = res;
};

DynamicFilter.prototype.isHideValue = function(val) {
	var res = false;
	
	switch(this.Type)
	{
		case Asc.c_oAscDynamicAutoFilter.aboveAverage:
		{
			res = val > this.Val ? false : true;
			break;
		}
		case Asc.c_oAscDynamicAutoFilter.belowAverage:
		{
			res = val < this.Val ? false : true;
			break;
		}
	}
	
	return res;
};

DynamicFilter.prototype.asc_getType = function () { return this.Type; };
DynamicFilter.prototype.asc_getVal = function () { return this.Val; };
DynamicFilter.prototype.asc_getMaxVal = function () { return this.MaxVal; };

DynamicFilter.prototype.asc_setType = function (val) { this.Type = val; };
DynamicFilter.prototype.asc_setVal = function (val) { this.Val = val; };
DynamicFilter.prototype.asc_setMaxVal = function (val) { this.MaxVal = val; };

var g_oColorFilter = {
	CellColor : 0,
	dxf	: 1
};

/** @constructor */
function ColorFilter() {
	this.Properties = g_oColorFilter;
	
	this.CellColor = null;
	this.dxf = null;
}
ColorFilter.prototype.getType = function() {
	return UndoRedoDataTypes.ColorFilter;
};
ColorFilter.prototype.getProperties = function() {
	return this.Properties;
};
ColorFilter.prototype.getProperty = function(nType) {
	switch (nType) {
		case this.Properties.CellColor: return this.CellColor; break;
		case this.Properties.dxf: return this.dxf; break;
	}
	return null;
};
ColorFilter.prototype.setProperty = function(nType, value) {
	switch (nType) {
		case this.Properties.CellColor: this.CellColor = value;break;
		case this.Properties.dxf: this.dxf = value;break;
	}
};
ColorFilter.prototype.clone = function() {
	var res = new ColorFilter();
	res.CellColor = this.CellColor;
	if (this.dxf) {
		res.dxf = this.dxf.clone();
	}
	return res;
};
ColorFilter.prototype.isHideValue = function(cell) {
	
	var res = true;
	
	var isEqualColors = function(filterColor, cellColor)
	{
		var res = false;
		if(filterColor === cellColor)
		{
			res = true;
		}
		else if(!filterColor && (!cellColor || null === cellColor.rgb || 0 === cellColor.rgb))
		{
			res = true;
		}
		else if(!cellColor && (!filterColor || null === filterColor.rgb || 0 === filterColor.rgb))
		{
			res = true;
		}
		else if(cellColor && filterColor && cellColor.rgb === filterColor.rgb)
		{
			res = true;
		}
		
		return res;
	};
	
	if(this.dxf && this.dxf.fill && cell)
	{
		var filterColor = this.dxf.fill.bg;
		cell = cell.getCells()[0];
		
		if(false === this.CellColor)//font color
		{
			if(cell.oValue.multiText !== null)
			{
				for(var j = 0; j < cell.oValue.multiText.length; j++)
				{
					var fontColor = cell.oValue.multiText[j].format ? cell.oValue.multiText[j].format.getColor() : null;
					if(isEqualColors(filterColor,fontColor ))
					{
						res = false;
						break;
					}
				}
			}
			else
			{
				var fontColor =  cell.xfs && cell.xfs.font ? cell.xfs.font.getColor() : null;
				if(isEqualColors(filterColor,fontColor))
				{
					res = false;
				}
			}
		}
		else
		{
			var color = cell.getStyle();
			var cellColor =  color !== null && color.fill && color.fill.bg ? color.fill.bg : null;
			
			if(isEqualColors(filterColor, cellColor))
			{
				res = false;
			}
		}
	}
	
	return res;
};

ColorFilter.prototype.asc_getCellColor = function () { return this.CellColor; };
ColorFilter.prototype.asc_getDxf = function () { return this.dxf; };

ColorFilter.prototype.asc_setCellColor = function (val) { this.CellColor = val; };
ColorFilter.prototype.asc_setDxf = function (val) { this.dxf = val; };
ColorFilter.prototype.asc_getCColor = function ()
{ 
	var res = null;
	
	if(this.dxf && this.dxf.fill && null !== this.dxf.fill.bg && null !== this.dxf.fill.bg.rgb)
	{
		var color = this.dxf.fill.bg;
		
		var res = new Asc.asc_CColor();
		res.asc_putR(color.getR());
		res.asc_putG(color.getG());
		res.asc_putB(color.getB());
		res.asc_putA(color.getA());
	}
	
	return res;
};
ColorFilter.prototype.asc_setCColor = function (asc_CColor) 
{
	if(!this.dxf)
	{
		this.dxf = new CellXfs();
	}
	
	if(!this.dxf.bg)
	{
		this.dxf.fill = new Fill();
	}
	
	if(null === asc_CColor)
	{
		this.dxf.fill.bg = new RgbColor();
		this.dxf.fill.bg.rgb = null;
	}
	else
	{
		this.dxf.fill.bg = new RgbColor((asc_CColor.asc_getR() << 16) + (asc_CColor.asc_getG() << 8) + asc_CColor.asc_getB());
	}
};

var g_oTop10 = {
	FilterVal : 0,
	Percent	: 1,
	Top: 2,
	Val: 3
};

/** @constructor */
function Top10() {
	this.Properties = g_oTop10;
	
	this.FilterVal = null;
	this.Percent = null;
	this.Top = null;
	this.Val = null;
}
Top10.prototype.getType = function() {
	return UndoRedoDataTypes.Top10;
};
Top10.prototype.getProperties = function() {
	return this.Properties;
};
Top10.prototype.getProperty = function(nType) {
	switch (nType) {
		case this.Properties.FilterVal: return this.FilterVal; break;
		case this.Properties.Percent: return this.Percent; break;
		case this.Properties.Top: return this.Top; break;
		case this.Properties.Val: return this.Val; break;
	}
	return null;
};
Top10.prototype.setProperty = function(nType, value) {
	switch (nType) {
		case this.Properties.FilterVal: this.FilterVal = value;break;
		case this.Properties.Percent: this.Percent = value;break;
		case this.Properties.Top: this.Top = value;break;
		case this.Properties.Val: this.Val = value;break;
	}
};
Top10.prototype.clone = function() {
	var res = new Top10();
	res.FilterVal = this.FilterVal;
	res.Percent = this.Percent;
	res.Top = this.Top;
	res.Val = this.Val;
	return res;
};
Top10.prototype.isHideValue = function(val) {
	// ToDo работает не совсем правильно.
	var res = false;
	
	if(null !== this.FilterVal)
	{
		if(this.Top)
		{
			if(val < this.FilterVal)
			{
				res = true;
			}
		}
		else
		{
			if(val > this.FilterVal)
			{
				res = true;
			}
		}
	}
	
	return res;
};

Top10.prototype.init = function(range, reWrite){
	var res = null;
	var t = this;
	
	if(null === this.FilterVal || true === reWrite)
	{	
		if(range)
		{
			var arr = [];
			var alreadyAddValues = {};
			var count = 0;
			range._setPropertyNoEmpty(null, null, function(cell){
				var val = parseFloat(cell.getValueWithoutFormat());
				
				if(!isNaN(val) && !alreadyAddValues[val])
				{
					arr.push(val);
					alreadyAddValues[val] = 1;
					count++;
				}
			});
			
			if(arr.length)
			{
				arr.sort(function(a, b){
					var res;
					if(t.Top)
					{
						res = b - a;
					}
					else
					{
						res = a - b;
					}
					
					return res; 
				});
				
				if(this.Percent)
				{
					var num = parseInt(count * (this.Val / 100));
					if(0 === num)
					{
						num = 1;
					}
					
					res = arr[num - 1];
				}
				else
				{
					res = arr[this.Val - 1];
				}
				
			}
		}
	}
	
	if(null !== res)
	{
		this.FilterVal = res;
	}
}; 

Top10.prototype.asc_getFilterVal = function () { return this.FilterVal; };
Top10.prototype.asc_getPercent = function () { return this.Percent; };
Top10.prototype.asc_getTop = function () { return this.Top; };
Top10.prototype.asc_getVal = function () { return this.Val; };

Top10.prototype.asc_setFilterVal = function (val) { this.FilterVal = val; };
Top10.prototype.asc_setPercent = function (val) { this.Percent = val; };
Top10.prototype.asc_setTop = function (val) { this.Top = val; };
Top10.prototype.asc_setVal = function (val) { this.Val = val; };

/** @constructor */
function SortCondition() {
	this.Ref = null;
	this.ConditionSortBy = null;
	this.ConditionDescending = null;
	this.dxf = null;
}
SortCondition.prototype.clone = function() {
	var res = new SortCondition();
	res.Ref = this.Ref ? this.Ref.clone() : null;
	res.ConditionSortBy = this.ConditionSortBy;
	res.ConditionDescending = this.ConditionDescending;
	if (this.dxf)
		res.dxf = this.dxf.clone();
	return res;
};
SortCondition.prototype.moveRef = function(col, row) {
	var ref = this.Ref.clone();
	ref.setOffset({offsetCol: col ? col : 0, offsetRow: row ? row : 0});
	
	this.Ref = ref;
};
SortCondition.prototype.changeColumns = function(activeRange, isDelete) {
	var bIsDeleteCurSortCondition = false;
	var ref = this.Ref.clone();
	var offsetCol = null;
	
	if(isDelete)
	{
		if(activeRange.c1 <= ref.c1 && activeRange.c2 >= ref.c1)
		{
			bIsDeleteCurSortCondition = true;
		}
		else if(activeRange.c1 < ref.c1)
		{
			offsetCol = -(activeRange.c2 - activeRange.c1 + 1);
		}
	}
	else
	{
		if(activeRange.c1 <= ref.c1)
		{
			offsetCol = activeRange.c2 - activeRange.c1 + 1;
		}
	}
	
	if(null !== offsetCol)
	{
		ref.setOffset({offsetCol: offsetCol, offsetRow: 0});
		this.Ref = ref;
	}
	
	return bIsDeleteCurSortCondition;
};

function AutoFilterDateElem(start, end, dateTimeGrouping) {
	this.start = start;
	this.end = end;
	this.dateTimeGrouping = dateTimeGrouping;
} 
AutoFilterDateElem.prototype.clone = function() {
	var res = new AutoFilterDateElem();
	res.start = this.start;
	this.end = this.end;
	this.dateTimeGrouping = this.dateTimeGrouping;
	
	return res;
};
AutoFilterDateElem.prototype.convertDateGroupItemToRange = function(oDateGroupItem) {
	var startDate, endDate, date;
	switch(oDateGroupItem.DateTimeGrouping)
	{
		case 1://day
		{
			date = new Date(Date.UTC( oDateGroupItem.Year, oDateGroupItem.Month - 1, oDateGroupItem.Day));
			startDate = date.getExcelDateWithTime();
			date.addDays(1)
			endDate = date.getExcelDateWithTime();
			break;
		}
		case 2://hour
		{
			startDate = new Date(Date.UTC( oDateGroupItem.Year, oDateGroupItem.Month - 1, oDateGroupItem.Day, oDateGroupItem.Hour, 1)).getExcelDateWithTime();
			endDate = new Date(Date.UTC( oDateGroupItem.Year, oDateGroupItem.Month - 1, oDateGroupItem.Day, oDateGroupItem.Hour, 59)).getExcelDateWithTime();
			break;
		}
		case 3://minute
		{
			startDate = new Date(Date.UTC( oDateGroupItem.Year, oDateGroupItem.Month - 1, oDateGroupItem.Day, oDateGroupItem.Hour, oDateGroupItem.Minute, 1)).getExcelDateWithTime();
			endDate = new Date(Date.UTC( oDateGroupItem.Year, oDateGroupItem.Month - 1, oDateGroupItem.Day, oDateGroupItem.Hour, oDateGroupItem.Minute, 59)).getExcelDateWithTime();
			break;
		}
		case 4://month
		{
			date = new Date(Date.UTC( oDateGroupItem.Year, oDateGroupItem.Month - 1, 1));
			startDate = date.getExcelDateWithTime();
			date.addMonths(1)
			endDate = date.getExcelDateWithTime();
			break;
		}
		case 5://second
		{
			startDate = new Date(Date.UTC( oDateGroupItem.Year, oDateGroupItem.Month - 1, oDateGroupItem.Day, oDateGroupItem.Hour, oDateGroupItem.Second)).getExcelDateWithTime();
			endDate = new Date(Date.UTC( oDateGroupItem.Year, oDateGroupItem.Month - 1, oDateGroupItem.Day, oDateGroupItem.Hour, oDateGroupItem.Second )).getExcelDateWithTime();
			break;
		}
		case 6://year
		{
			date = new Date(Date.UTC( oDateGroupItem.Year, 0));
			startDate = date.getExcelDateWithTime();
			date.addYears(1)
			endDate = date.getExcelDateWithTime();
			break;
		}
	}
	
	this.start = startDate;
	this.end = endDate;
	this.dateTimeGrouping = oDateGroupItem.DateTimeGrouping;
};

	//----------------------------------------------------------export----------------------------------------------------
	var prot;
	window['Asc'] = window['Asc'] || {};
	window['AscCommonExcel'] = window['AscCommonExcel'] || {};
	window['AscCommonExcel'].g_oColorManager = g_oColorManager;
	window['AscCommonExcel'].g_oDefaultFormat = g_oDefaultFormat;
	window['AscCommonExcel'].g_nColorTextDefault = g_nColorTextDefault;
	window['AscCommonExcel'].g_nColorHyperlink = g_nColorHyperlink;
	window['AscCommonExcel'].g_oThemeColorsDefaultModsSpreadsheet = g_oThemeColorsDefaultModsSpreadsheet;
	window['AscCommonExcel'].map_themeExcel_to_themePresentation = map_themeExcel_to_themePresentation;
	window['AscCommonExcel'].shiftGetBBox = shiftGetBBox;
	window['AscCommonExcel'].RgbColor = RgbColor;
	window['AscCommonExcel'].createRgbColor = createRgbColor;
	window['AscCommonExcel'].ThemeColor = ThemeColor;
	window['AscCommonExcel'].CorrectAscColor = CorrectAscColor;
	window['AscCommonExcel'].Fragment = Fragment;
	window['AscCommonExcel'].Font = Font;
	window['AscCommonExcel'].Fill = Fill;
	window['AscCommonExcel'].BorderProp = BorderProp;
	window['AscCommonExcel'].Border = Border;
	window['AscCommonExcel'].Num = Num;
	window['AscCommonExcel'].CellXfs = CellXfs;
	window['AscCommonExcel'].Align = Align;
	window['AscCommonExcel'].CCellStyles = CCellStyles;
	window['AscCommonExcel'].CCellStyle = CCellStyle;
	window['AscCommonExcel'].StyleManager = StyleManager;
	window['AscCommonExcel'].Hyperlink = Hyperlink;
	window['AscCommonExcel'].SheetFormatPr = SheetFormatPr;
	window['AscCommonExcel'].Col = Col;
	window['AscCommonExcel'].g_nRowFlag_empty = g_nRowFlag_empty;
	window['AscCommonExcel'].g_nRowFlag_hd = g_nRowFlag_hd;
	window['AscCommonExcel'].g_nRowFlag_CustomHeight = g_nRowFlag_CustomHeight;
	window['AscCommonExcel'].g_nRowFlag_CalcHeight = g_nRowFlag_CalcHeight;
	window['AscCommonExcel'].Row = Row;
	window['AscCommonExcel'].CCellValueMultiText = CCellValueMultiText;
	window['AscCommonExcel'].CCellValue = CCellValue;
	window['AscCommonExcel'].RangeDataManagerElem = RangeDataManagerElem;
	window['AscCommonExcel'].RangeDataManager = RangeDataManager;
	window["Asc"]["sparklineGroup"] = window['AscCommonExcel'].sparklineGroup = sparklineGroup;
	prot = sparklineGroup.prototype;
	prot["asc_getId"]							= prot.asc_getId;
	prot["asc_getType"]						= prot.asc_getType;
	prot["asc_getLineWeight"]			= prot.asc_getLineWeight;
	prot["asc_getDisplayEmpty"]		= prot.asc_getDisplayEmpty;
	prot["asc_getMarkersPoint"]		= prot.asc_getMarkersPoint;
	prot["asc_getHighPoint"]			= prot.asc_getHighPoint;
	prot["asc_getLowPoint"]				= prot.asc_getLowPoint;
	prot["asc_getFirstPoint"]			= prot.asc_getFirstPoint;
	prot["asc_getLastPoint"]			= prot.asc_getLastPoint;
	prot["asc_getNegativePoint"]	= prot.asc_getNegativePoint;
	prot["asc_getDisplayXAxis"]		= prot.asc_getDisplayXAxis;
	prot["asc_getDisplayHidden"]	= prot.asc_getDisplayHidden;
	prot["asc_getMinAxisType"]		= prot.asc_getMinAxisType;
	prot["asc_getMaxAxisType"]		= prot.asc_getMaxAxisType;
	prot["asc_getRightToLeft"]		= prot.asc_getRightToLeft;
	prot["asc_getManualMax"]			= prot.asc_getManualMax;
	prot["asc_getManualMin"]			= prot.asc_getManualMin;
	prot["asc_getColorSeries"]		= prot.asc_getColorSeries;
	prot["asc_getColorNegative"]	= prot.asc_getColorNegative;
	prot["asc_getColorAxis"]			= prot.asc_getColorAxis;
	prot["asc_getColorMarkers"]		= prot.asc_getColorMarkers;
	prot["asc_getColorFirst"]			= prot.asc_getColorFirst;
	prot["asc_getColorLast"]			= prot.asc_getColorLast;
	prot["asc_getColorHigh"]			= prot.asc_getColorHigh;
	prot["asc_getColorLow"]				= prot.asc_getColorLow;
	prot["asc_getDataRanges"]			= prot.asc_getDataRanges;
	prot["asc_setType"]					= prot.asc_setType;
	prot["asc_setLineWeight"]			= prot.asc_setLineWeight;
	prot["asc_setDisplayEmpty"]		= prot.asc_setDisplayEmpty;
	prot["asc_setMarkersPoint"]		= prot.asc_setMarkersPoint;
	prot["asc_setHighPoint"]			= prot.asc_setHighPoint;
	prot["asc_setLowPoint"]				= prot.asc_setLowPoint;
	prot["asc_setFirstPoint"]			= prot.asc_setFirstPoint;
	prot["asc_setLastPoint"]			= prot.asc_setLastPoint;
	prot["asc_setNegativePoint"]	= prot.asc_setNegativePoint;
	prot["asc_setDisplayXAxis"]		= prot.asc_setDisplayXAxis;
	prot["asc_setDisplayHidden"]	= prot.asc_setDisplayHidden;
	prot["asc_setMinAxisType"]		= prot.asc_setMinAxisType;
	prot["asc_setMaxAxisType"]		= prot.asc_setMaxAxisType;
	prot["asc_setRightToLeft"]		= prot.asc_setRightToLeft;
	prot["asc_setManualMax"]			= prot.asc_setManualMax;
	prot["asc_setManualMin"]			= prot.asc_setManualMin;
	prot["asc_setColorSeries"]		= prot.asc_setColorSeries;
	prot["asc_setColorNegative"]	= prot.asc_setColorNegative;
	prot["asc_setColorAxis"]			= prot.asc_setColorAxis;
	prot["asc_setColorMarkers"]		= prot.asc_setColorMarkers;
	prot["asc_setColorFirst"]			= prot.asc_setColorFirst;
	prot["asc_setColorLast"]			= prot.asc_setColorLast;
	prot["asc_setColorHigh"]			= prot.asc_setColorHigh;
	prot["asc_setColorLow"]				= prot.asc_setColorLow;
	prot["asc_getStyles"]				= prot.asc_getStyles;
	prot["asc_setStyle"]				= prot.asc_setStyle;
	window['AscCommonExcel'].sparkline = sparkline;
	window['AscCommonExcel'].TablePart = TablePart;
	window['AscCommonExcel'].AutoFilter = AutoFilter;
	window['AscCommonExcel'].SortState = SortState;
	window['AscCommonExcel'].TableColumn = TableColumn;
	window['AscCommonExcel'].TableStyleInfo = TableStyleInfo;
	window['AscCommonExcel'].FilterColumn = FilterColumn;
	window['AscCommonExcel'].Filters = Filters;
	window['AscCommonExcel'].Filter = Filter;
	window['AscCommonExcel'].DateGroupItem = DateGroupItem;
	window['AscCommonExcel'].SortCondition = SortCondition;
	window['AscCommonExcel'].AutoFilterDateElem = AutoFilterDateElem;

window["Asc"]["CustomFilters"]			= window["Asc"].CustomFilters = CustomFilters;
prot									= CustomFilters.prototype;
prot["asc_getAnd"]						= prot.asc_getAnd;
prot["asc_getCustomFilters"]			= prot.asc_getCustomFilters;
prot["asc_setAnd"]						= prot.asc_setAnd;
prot["asc_setCustomFilters"]			= prot.asc_setCustomFilters;

window["Asc"]["CustomFilter"]			= window["Asc"].CustomFilter = CustomFilter;
prot									= CustomFilter.prototype;
prot["asc_getOperator"]					= prot.asc_getOperator;
prot["asc_getVal"]						= prot.asc_getVal;
prot["asc_setOperator"]					= prot.asc_setOperator;
prot["asc_setVal"]						= prot.asc_setVal;

window["Asc"]["DynamicFilter"]			= window["Asc"].DynamicFilter = DynamicFilter;
prot									= DynamicFilter.prototype;
prot["asc_getType"]						= prot.asc_getType;
prot["asc_getVal"]						= prot.asc_getVal;
prot["asc_getMaxVal"]					= prot.asc_getMaxVal;
prot["asc_setType"]						= prot.asc_setType;
prot["asc_setVal"]						= prot.asc_setVal;
prot["asc_setMaxVal"]					= prot.asc_setMaxVal;

window["Asc"]["ColorFilter"]			= window["Asc"].ColorFilter = ColorFilter;
prot									= ColorFilter.prototype;
prot["asc_getCellColor"]				= prot.asc_getCellColor;
prot["asc_getCColor"]					= prot.asc_getCColor;
prot["asc_getDxf"]						= prot.asc_getDxf;
prot["asc_setCellColor"]				= prot.asc_setCellColor;
prot["asc_setDxf"]						= prot.asc_setDxf;
prot["asc_setCColor"]					= prot.asc_setCColor;

window["Asc"]["Top10"]					= window["Asc"].Top10 = Top10;
prot									= Top10.prototype;
prot["asc_getFilterVal"]				= prot.asc_getFilterVal;
prot["asc_getPercent"]					= prot.asc_getPercent;
prot["asc_getTop"]						= prot.asc_getTop;
prot["asc_getVal"]						= prot.asc_getVal;
prot["asc_setFilterVal"]				= prot.asc_setFilterVal;
prot["asc_setPercent"]					= prot.asc_setPercent;
prot["asc_setTop"]						= prot.asc_setTop;
prot["asc_setVal"]						= prot.asc_setVal;

window["Asc"]["TreeRBNode"]			= window["Asc"].TreeRBNode = TreeRBNode;
window["Asc"]["TreeRB"]			= window["Asc"].TreeRB = TreeRB;
prot									= TreeRB.prototype;
prot["insertOrGet"]						= prot.insertOrGet;
prot["deleteNode"]			= prot.deleteNode;
prot["enumerate"]						= prot.enumerate;
prot["getElem"]			= prot.getElem;
prot["getNodeAll"]			= prot.getNodeAll;
prot["isEmpty"]			= prot.getNodeAll;
})(window);
