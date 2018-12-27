function getCurrencyUnits(currencyCode) {
  var curs = {
    NGN: {
      majorUnit: "Naira",
      minorUnit: "Kobo"
    },
    USD: {
      majorUnit: "Dollar",
      minorUnit: "Cents"
    },
    GBP: {
      majorUnit: "Pound",
      minorUnit: "Sterlin"
    },
    EUR: {
      majorUnit: "Euro",
      minorUnit: ""
    },
    GHS: {
      majorUnit: "Cedi",
      minorUnit: "Cents"
    }
  };

  if (curs[currencyCode] == undefined) {
    throw "Unknow currency code. To avoid this error in future, try specifying the the majorUnit and minorUnit of the currency instead";
  }

  return curs[currencyCode];
}

function getNumberToWordsModes() {
  return {
    SCIENTIFIC: 0,
    FINANCIAL: 1
  };
}

function NumberToWords(params) {
  this.majorUnit = params.majorUnit == undefined ? "" : params.majorUnit;
  this.minorUnit = params.minorUnit == undefined ? "" : params.minorUnit;

  this.modes = getNumberToWordsModes();
  this.mode =
    params.mode == undefined ? this.modes.FINANCIAL : parseInt(params.mode);


  if (this.mode > 1) {
    throw "Invalid mode";
  }

  var $class = this;

  this.getModes = function() {
    return $class.modes;
  };

  this.setUnits = function(currencyCode) {
    if (currencyCode != undefined) {
      var uni = getCurrencyUnits(currencyCode);
      $class.majorUnit = uni.majorUnit;
      $class.minorUnit = uni.minorUnit;
    }
  };
  
  this.setUnits(params.currencyCode);

  this.convert = function(number, currency) {
    if(currency != undefined){
      $class.setUnits(currency);
    }
    var n = "" + number;
    var m = "";
    var decimalPoint = n.indexOf(".");
    if (decimalPoint > -1) {
      m = n.substring(decimalPoint + 1);
      n = n.substring(0, decimalPoint);
    }

    var segs = [];
    var text = "";
    while (n.length > 2) {
      segs.push(n.substring(n.length - 3));
      n = n.substring(0, n.length - 3);
    }

    if (n.length > 0) {
      segs.push(n);
    }

    segs.forEach(function(seg, index) {
      switch (index) {
        case segs.length - 1: {
          var t = $class.processSegment(seg, index).trim();
          text =
            t + (segs.length == 1 ? " " : t.length > 0 ? ", " : " ") + text;
          break;
        }
        default: {
          var t = $class.processSegment(seg, index).trim();
          text = t + (t.length > 0 ? ", " : " ") + text;
        }
      }
    });

    var wholePart =
      text.replace(/\,[\s]*$/gi, "") +
      " " +
      ($class.mode == $class.modes.SCIENTIFIC ? "" : $class.majorUnit);
    var fractPart = "";
    if (m.length > 0) {
      fractPart =
        ($class.mode == $class.modes.SCIENTIFIC ? " point " : ", ") +
        $class.numberToWord(m, $class.mode) +
        " " +
        ($class.mode == $class.modes.SCIENTIFIC
          ? $class.majorUnit
          : $class.minorUnit);
    }
    var ret = wholePart + fractPart;

    return ret.replace(/[\s]+/gi, " ").toUpperCase();
  };

  this.processSegment = function(number, scale) {
    var text = "";
    switch (scale) {
      case 0: {
        var hundred = $class.numberToWord(number);
        if (hundred.trim() != "Zero") {
          text += hundred;
        }
        break;
      }
      case 1: {
        var thousand = $class.numberToWord(number);
        if (thousand.trim() != "Zero") {
          text += thousand + " thousand";
        }
        break;
      }
      case 2: {
        var million = $class.numberToWord(number);
        if (million.trim() != "Zero") {
          text += million + " million";
        }
        break;
      }
      case 3: {
        var billion = $class.numberToWord(number);
        if (billion.trim() != "Zero") {
          text += billion + " billion";
        }
        break;
      }
      case 4: {
        var trillion = $class.numberToWord(number);
        if (trillion.trim() != "Zero") {
          text += trillion + " trillion";
        }
        break;
      }
    }

    return text;
  };

  this.numberToWord = function(number, mode) {
    var parsedNumber = parseInt(number);
    var text = "";

    t = {
      0: "Zero",
      1: "One",
      2: "Two",
      3: "Three",
      4: "Four",
      5: "Five",
      6: "Six",
      7: "Seven",
      8: "Eight",
      9: "Nine",
      10: "Ten",
      11: "Eleven",
      12: "Twelve",
      13: "Thirteen",
      14: "Fourteen",
      15: "Fifteen",
      16: "Sixteen",
      17: "Seventeen",
      18: "Eighteen",
      19: "Nineteen",
      20: "Twenty",
      30: "Thirty",
      40: "Fourty",
      50: "Fifty",
      60: "Sixty",
      70: "Seventy",
      80: "Eighty",
      90: "Ninety"
    };

    if (mode == $class.modes.SCIENTIFIC) {
      var splitNumber = number.match(/.{1,1}/g);
      splitNumber.forEach(function(num) {
        text += " " + t[parseInt(num)];
      });
      return text;
    }

    if (parsedNumber < 100) {
      return $class.processTens(number, parsedNumber);
    } else {
      var hundred = parseInt(number.substring(0, 1));
      var tens = parsedNumber % 100;

      return (
        t[hundred] +
        " hundred " +
        (tens > 0
          ? " and " + $class.processTens(number.substring(1), tens)
          : "")
      );
    }
  };

  this.processTens = function(number, parsedNumber) {
    var text = "";

    if (parsedNumber == undefined) {
      parsedNumber = parseInt(number);
    }

    if (parsedNumber == 0) {
      return "Zero";
    } else if (parsedNumber < 11) {
      return $class.processUnits(parsedNumber);
    } else if (parsedNumber > 10 && parsedNumber < 21) {
      return t[parsedNumber];
    } else if (parsedNumber > 19 && parsedNumber <= 99) {
      var tens = parseInt(number.substring(0, 1));
      var units = parseInt(number.substring(1));

      return t[tens * 10] + " " + $class.processUnits(units);
    }

    return text;
  };

  this.processUnits = function(parsedNumber) {
    return t[parsedNumber];
  };
}

var numberToWord = new NumberToWords({
  currencyCode: "NGN"
});
