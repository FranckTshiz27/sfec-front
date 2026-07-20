import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {
  private static readonly UNITS = [
    'zero', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
    'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'
  ];

  private static readonly TENS = [
    '', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'
  ];

  private static readonly SCALES = [
    '', 'mille', 'million', 'milliard', 'billion'
  ];

  constructor() {

  }

  numberToFrenchWords(number: number): string {
    if (!Number.isFinite(number)) {
      throw new Error('Le nombre doit etre une valeur numerique finie');
    }

    const negative = number < 0;
    const normalized = Math.round((Math.abs(number) + Number.EPSILON) * 100) / 100;

    const integerPart = Math.trunc(normalized);
    const decimalPart = Math.round((normalized - integerPart) * 100);

    let result = this.integerToFrenchWords(integerPart);
    if (negative) {
      result = `moins ${result}`;
    }

    if (decimalPart > 0) {
      result += ` virgule ${this.integerToFrenchWords(decimalPart)}`;
    }

    return result.trim().replace(/\s+/g, ' ');
  }

  integerToFrenchWords(number: number): string {
    if (!Number.isFinite(number) || !Number.isSafeInteger(number)) {
      throw new Error('Le nombre doit etre un entier numerique valide');
    }

    if (number === 0) {
      return 'zero';
    }

    if (number < 0) {
      return `moins ${this.integerToFrenchWords(-number)}`;
    }

    let value = number;
    let result = '';
    let scaleIndex = 0;

    while (value > 0) {
      const chunk = value % 1000;
      if (chunk !== 0) {
        const chunkWords = this.convertChunk(chunk);
        const scaleWord = UtilService.SCALES[scaleIndex] || '';
        const piece = this.buildScalePiece(chunk, chunkWords, scaleWord, scaleIndex);

        if (piece) {
          result = result ? `${piece} ${result}` : piece;
        }
      }

      value = Math.floor(value / 1000);
      scaleIndex++;
    }

    return result.trim().replace(/\s+/g, ' ');
  }

  private buildScalePiece(
    chunk: number,
    chunkWords: string,
    scaleWord: string,
    scaleIndex: number
  ): string {
    if (scaleIndex === 0) {
      return chunkWords;
    }

    if (scaleIndex === 1) {
      if (chunk === 1) {
        return 'mille';
      }
      return `${chunkWords} ${scaleWord}`;
    }

    if (chunk > 1) {
      return `${chunkWords} ${scaleWord}s`;
    }

    return `${chunkWords} ${scaleWord}`;
  }

  private convertChunk(chunk: number): string {
    const hundreds = Math.floor(chunk / 100);
    const rest = chunk % 100;
    let words = '';

    if (hundreds > 0) {
      if (hundreds === 1) {
        words = 'cent';
      } else {
        words = `${UtilService.UNITS[hundreds]} cent`;
      }

      if (rest === 0 && hundreds > 1) {
        words += 's';
      }
    }

    if (rest > 0) {
      words += words ? ` ${this.convertUnderHundred(rest)}` : this.convertUnderHundred(rest);
    }

    return words;
  }

  private convertUnderHundred(n: number): string {
    if (n <= 16) {
      return UtilService.UNITS[n];
    }

    if (n < 20) {
      return `dix-${UtilService.UNITS[n - 10]}`;
    }

    if (n < 70) {
      const ten = Math.floor(n / 10);
      const unit = n % 10;
      const tenWord = UtilService.TENS[ten];

      if (unit === 0) {
        return tenWord;
      }
      if (unit === 1) {
        return `${tenWord} et un`;
      }
      return `${tenWord}-${UtilService.UNITS[unit]}`;
    }

    if (n < 80) {
      if (n === 71) {
        return 'soixante et onze';
      }
      return `soixante-${this.convertUnderHundred(n - 60)}`;
    }

    if (n === 80) {
      return 'quatre-vingts';
    }

    return `quatre-vingt-${this.convertUnderHundred(n - 80)}`;
  }

  /* let res:string=""
  let plus:string=""
  let diz:string=""
  let s:string=""
  let un:string=""
  let mil:string=""
  let mil2:string=""
  let ent:string=""
  let deci:string=""
  let centi:string=""
  let pl:string=""
  let pl2:string=""
  let conj:string=""

  let t:string[]=["","un","deux","trois","quatre","cinq","six","sept","huit","neuf"];
  let t2:string[]=["dix","onze","douze","treize","quatorze","quinze","seize","dix-sept","dix-huit","dix-neuf"];
  let t3:string[]=["","","vingt","trente","quarante","cinquante","soixante","soixante","quatre-vingt","quatre-vingt"]; */



  // traitement des deux parties du nombre;
  decint(n: string): string {
    let mil: string = ""
    let un: string = ""
    let mil2: string = ""

    switch (n.length) {
      case 1: return this.dix(n);
      case 2: return this.dix(n);
      case 3: return this.cent(Number(n.charAt(0))) + " " + this.decint(n.substring(1));
      default: mil = n.substring(0, n.length - 3);
        if (mil.length < 4) {
          un = (Number(mil) == 1) ? "" : this.decint(mil);
          return un + this.mille(Number(mil)) + " " + this.decint(n.substring(mil.length));
        }
        else {
          mil2 = mil.substring(0, mil.length - 3);
          return this.decint(mil2) + this.million(Number(mil2)) + " " + this.decint(n.substring(mil2.length));
        }
    }
  }


  // traitement des nombres entre 0 et 99, pour chaque tranche de 3 chiffres;
  dix(n: string): string {
    let t: string[] = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
    let t2: string[] = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
    let t3: string[] = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];

    let plus: string = ""
    let diz: string = ""
    let s: string = ""

    if (Number(n) < 10) {
      return t[parseInt(n)]
    }
    else if (Number(n) > 9 && Number(n) < 20) {
      return t2[Number(n.charAt(1))]
    }
    else {
      plus = Number(n.charAt(1)) == 0 && Number(n.charAt(0)) != 7 && Number(n.charAt(0)) != 9 ? "" : (Number(n.charAt(1)) == 1 && Number(n.charAt(0)) < 8) ? " et " : "-";
      diz = Number(n.charAt(0)) == 7 || Number(n.charAt(0)) == 9 ? t2[Number(n.charAt(1))] : t[Number(n.charAt(1))];
      s = Number(n) == 80 ? "s" : "";

      return t3[Number(n.charAt(0))] + s + plus + diz;
    }
  }


  // traitement des mots "cent", "mille" et "million"
  cent(n: number): string {
    let t: string[] = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];

    return n > 1 ? t[n] + " cent" : (n == 1) ? " cent" : "";
  }

  mille(n: number) {
    return n >= 1 ? " mille" : "";
  }

  million(n: number) {
    return n >= 1 ? " millions" : " million";
  }


  // conversion du nombre
  trans(n: number) {

    var new_n: string = n.toFixed(2).toString();
    new_n = new_n.replace('.', ',');
    // vC)rification de la valeur saisie
    if (!/^\d+[.,]?\d*$/.test(new_n)) {
      return "L'expression entrC)e n'est pas un nombre."
    }

    // sC)paration entier + dC)cimales
    new_n = new_n.replace(/(^0+)|(\.0+$)/g, "");
    new_n = new_n.replace(/([.,]\d{2})\d+/, "$1");

    let n1: string = new_n.replace(/[,.]\d*/, "");

    let n2: any = n1 != new_n ? new_n.replace(/\d*[,.]/, "") : false;

    let ent: string = ""
    let deci: string = ""
    let centi: string = ""
    let conj: string = ""
    let dollar: string = ""

    let pl: string = ""
    let pl2: string = ""

    // variables de mise en forme
    ent = !n1 ? "" : this.decint(n1);
    deci = !n2 ? "" : this.decint(n2);
    if (!n1 && !n2) {
      return "ZC)ro Dollar. (Mais, de prC)fC)rence, entrez une valeur non nulle!)"
    }
    conj = n2 > 0 || !n1 ? "  et " : "";
    dollar = !n1 ? "" : !/[23456789]00$/.test(n1) ? " Dollar" : "(s) Dollar";

    centi = n2 > 0 ? " centime" : "";
    pl = Number(n1) > 1 ? "s" : "";
    pl2 = Number(n2) > 1 ? "s" : "";

    // expression complC(te en toutes lettres
    return (ent + dollar + pl + conj + deci + centi + pl2).replace(/\s+/g, " ").replace("cent s E", "cents E");

  }


  // conversion du nombre
  transBis(n: number) {

    var new_n: string = n.toFixed(2).toString();
    new_n = new_n.replace('.', ',');
    // vC)rification de la valeur saisie
    if (!/^\d+[.,]?\d*$/.test(new_n)) {
      return "L'expression entrC)e n'est pas un nombre."
    }

    // sC)paration entier + dC)cimales
    new_n = new_n.replace(/(^0+)|(\.0+$)/g, "");
    new_n = new_n.replace(/([.,]\d{2})\d+/, "$1");

    let n1: string = new_n.replace(/[,.]\d*/, "");

    let n2: any = n1 != new_n ? new_n.replace(/\d*[,.]/, "") : false;

    let ent: string = ""
    let deci: string = ""
    let centi: string = ""
    let conj: string = ""
    let dollar: string = ""

    let pl: string = ""
    let pl2: string = ""

    // variables de mise en forme
    ent = !n1 ? "" : this.decint(n1);
    deci = !n2 ? "" : this.decint(n2);
    if (!n1 && !n2) {
      return "ZC)ro Dollar. (Mais, de prC)fC)rence, entrez une valeur non nulle!)"
    }
    conj = n2 > 0 || !n1 ? "  et " : "";
    dollar = !n1 ? "" : !/[23456789]00$/.test(n1) ? " $" : " $";

    centi = n2 > 0 ? " centime" : "";
    pl = Number(n1) > 1 ? "" : "";
    pl2 = Number(n2) > 1 ? "" : "";

    // expression complC(te en toutes lettres
    return (ent + dollar + pl + conj + deci + centi + pl2).replace(/\s+/g, " ").replace("cent s E", "cents E");

  }



}
