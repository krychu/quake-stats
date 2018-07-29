import { htmlToElement, setAttributeIfDifferent, setPropertyIfDifferent, roundString, roundPercentageString } from "../utils";
import './GamesChart.scss';
import SVG from "svg.js";

export class GamesChart extends HTMLElement {

  constructor() {
    super();
  }

  connectedCallback() {
    // if ( !this.childElementCount ) {
    //   this.appendChild( this._domCreateContainer() );
    // }

    SVG()

    this._recreateGames( this.player, this.gameCnt );
  }

  disconnectedCallback() {
    // ?
  }

}
