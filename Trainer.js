// <!--    hide all this crap if no-scripts

  /// //  (a little) From: http://www.codeLifter.com  (the "IE" stuff)
  //  (a lot) From: http://stackoverflow.com/questions/12661124/how-to-apply-hovering-on-html-area-tag

var  msX=0, msY=0;                               //  mouse coords at last exit from mouseMove()
var  imgLeft=0, imgTop=0;                        //  total left/top position offsets for #imgPano

var  divPano,  imgPano,  cvsPano, ctxPano;      //  imgPano <DIV>, and canvas & its DC handle
var  Rose, cvsRose, ctxRose;
var    RoseWH=50;                                //  update <IMG> width & height too!!!

var  Areas,  NAreas;                             //  <MAP>'s kids

  //  used when creating new shapes/areas
var  Editing=false, makingShape="",  Made=false;
var  shapeNpts=0,  shapeXpts=0;                  //  points so far this shape,  maX points for shape
var  shapePts=[];                                //  x0,y0, ... xn-1,yn-1 - (100/2) should be enough corners(?)
var  editingTip="";

  //  used when moving them around
var  Moving=false,  moveArea=null;

var  deletedAreas=[];
var  delMap;

var  ShowAll   = true;                           //  default to display all areas/shapes
var  ShowHints = true;                           //  and hints (<AREA> tooltips)
var  ShowTips  = false;                          //  and extra usage tooltips
var  ShowAllWas = ShowAll,  ShowHintsWas = ShowHints;

var  sounding = false;                           //  shhh!

var  BrgBtnNdx;                                  //  for BrgBtn cycle buttons

  //  these DOMO's get hit a lot, so remember them to speed things up
var idTextOut, divTeaser, divCards, Cards, divMovie, Movie, Sounder, divTitle, TitleText,  BrgOut,  Toast;



//==================================================================================================
function imgLoaded() {                           //  setup canvas after panorama img has loaded
  let x, y,  w, h;

  /// bugln("\nimgLoaded: in");

  //  these DOMO's get hit a lot, so remember them to speed things up
  idTextOut = byId("idTextOut");
  divTeaser = byId("divTeaser");
  divCards  = byId("divCards");
  Cards     = byId("Cards");
  divMovie  = byId("divMovie");
  Movie     = byId("Movie");
  divTitle  = byId("divTitle");
  TitleText = byId("TitleText");
  Sounder   = byId("Sounder");
  BrgOut    = byId("BrgOut");
  Toast     = byId("Toast");

  delMap = document.createElement("MAP");
  delMap.name = "delMap";                        //  name used in "usemap"
  delMap.id   = "delMap";                        //  #id used to find <AREA>a

  divPano = byId("divPano");

    //  set stuff common to all sites.  (especially "onload" before "src", dummy.  you know who you are.)
  divPano.onscroll      = divPanoScroll;           //  update azimuth/bearing display
  divPano.onwheel       = divPanoWheel;            //  scroll the pano

    // get image's position and width+height
  imgPano = byId("imgPano");
  x = imgPano.offsetLeft;
  y = imgPano.offsetTop;
  w = imgPano.width;
  h = imgPano.height;

  imgPano.onmousemove   = imgMouseMove;            //  update azimuth/bearing display
  imgPano.onmouseout    = imgMouseOut;             //  restore azimuth/bearing display
  imgPano.onclick       = imgClick;                //  clicked outside of an <AREA>
  /// imgPano.oncontextmenu = imgRtClick;               //  use ctrlKey-click instead.  removes last shape point  ///  TODO bubbling???
  /// imgPano.addEventListener("contextmenu", imgRtClick, false);    //  dumm ol FF sometimes pops menu anyway
  imgPano.ondblclick    = imgDblClick;             //  end a 'poly' string

  byId("divNewStuff").action = "mailto:ANFFLA@digimeas.com?subject=New%20Landmark%20Data%20for%20"+ siteName +"!";    //  OK! We have, as of this moment, officially jumped the shark!
  byId("divNewStuff").formAction = "mailto:ANFFLA@digimeas.com?subject=New%20Landmark%20Data%20for%20"+ siteName +"!";    //  OK! We have, as of this moment, officially jumped the microshark!

    // place canvas in front of the image
  cvsPano = byId("cvsPano");
  cvsPano.style.zIndex = 1;

    // position canvas over the image
  cvsPano.style.left = x+"px";
  cvsPano.style.top  = y+"px";
  cvsPano.setAttribute("width",  w+"px");
  cvsPano.setAttribute("height", h+"px");

    // set the "default" values for the color/width of fill/stroke operations
  ctxPano = cvsPano.getContext("2d");
  ctxPano.strokeStyle = "#008000";
  ctxPano.lineWidth   = 2;                       //  TODO  gush w/ different pens etc
  ctxPano.lineJoin    = "round";    //  'miter'ed acute joints extend way past the coord and don't clear() well
  /// ctxPano.globalCompositeOperation="xor";    ///???
  /// ctxPano.globalAlpha = .5;


    //  find total left/top position offsets for #imgPano.  Why isn't there a 'elt.Left' & 'elt.Top'?
  let os = getOffsets( imgPano );
  imgLeft = os.Left;  imgTop = os.Top;

  Rose = byId("Rose");
  cvsRose = byId("cvsRose");
  cvsRose.setAttribute("width",  RoseWH+"px");
  cvsRose.setAttribute("height", RoseWH+"px");
  cvsRose.style.zIndex = 5;
  ctxRose = cvsRose.getContext("2d");
  ctxRose.drawImage(Rose, 0, 0,  RoseWH, RoseWH);
  /// ctxRose.globalCompositeOperation="xor";          ///  TODO
  // ctxRose.globalAlpha = .5;

  Areas = byId("idMap").children;
  NAreas = Areas.length;

      //  init az/brg display.
  bush(false);
  if(false) {                                     //  open on 1st <AREA> in the list
    let a0 = Areas[0];
    BrgBtnNdx = Number(a0.getAttribute("x2k"));      //  X-coord-sorted index of 1st area
    ScrollPanoToX( a0.getAttribute("x") );
    /// bug(area2Str(a0));
    /// bug("  BrgBtnNdx=", BrgBtnNdx);
    }
   else if(true) {                              //  open on due North
    ScrollPanoToX( PX0 );
    BrgBtnNdx = X2KNorthish;           //  next area to the "right" of North
    /// bug("\n  X2K=", X2KNorthish, " => ","  BBN=", BrgBtnNdx);
    /// bug("   => ", area2Str(Areas[areaX2K[BrgBtnNdx]]));
    }
  /*
   else if(false) {  NotYet                      //  open on due somewhere else
    ScrollPanoToX( Az2X( SomeEnchantedBearing ) );    //  N.B.  doesn't exist yet!!!
    BrgBtnNdx = ???;                             //  next area to the "right" of SomeEnchantedBearing
    }                                            //  else open on X=0
  /* */

  divPanoScroll();                               //  update az/brg display w/new bearing
  bush();


  doInit();
    //  call HandleShowHints() before HandleShowAll()
  /// HandleEditAreas(Editing);
  /// HandleShowText(Editing);
  HandleShowHints(ShowHints);                    //  setup the menus per default values
  HandleShowAll(ShowAll);                        //  changes ShowHints
  HandleShowTips(ShowTips);                      //      ditto


  if(idTextOut.checked)                          //  if alerts about the input have been written to #idTextOut ...
    idTextOut.scrollIntoView(false);

  HandleResize();

  /*
  let str = "";
  str += "Total width*height: " + screen.width + "*" + screen.height;
  str += " Available width*height: " + screen.availWidth + "*" + screen.availHeight;
  bugln(str);
  str = "Window inner-width*height: " + window.innerWidth + "*" + window.innerHeight;
  bugln(str);
  /* */

  //  whew!  done making page.  ready for some (inter-)action

if(false)branch(byId("BODY"));

  /// bugln("  imgLoaded: out");
}


//==================================================================================================
  //  called when an <AREA> is clicked.  Displays a pic or the #Teaser or a movie or a ...
function flashCard(elt, evt) {                   //  evt is optional
/// bugln("flashCard() elt = "+ elt, " id=", elt.id);
/// bugln("document.activeElement="+ document.activeElement);
/// bugln("document.activeElement.tagname="+ document.activeElement.tagname);
/// bugln();

  if(null === elt) {
    LOG("\n! ERROR: flashCard: elt == null.  Caller=", flashCard.caller.name);
    return -1;                   //  TODO  error bugtrack???
    }

  bush(false);
  bug("  FC: elt=", elt);
  if(undefined != elt) {                         //  clicked on an area
    bug("  FC: BrgBtnNdx=", BrgBtnNdx);
    if(elt.getAttribute("x2k") != BrgBtnNdx)     //  erase 'previous' area
      areaClear(Areas[areaX2K[BrgBtnNdx]]);
    BrgBtnNdx = Number(elt.getAttribute("x2k"));    //  X-coord-sorted index
    bugln(" => ", BrgBtnNdx);

    if(Editing) {
       //  By 'shift-clicking' an area it can be picked up.  Another click drops it.
      if(! Moving) {
        if((undefined != evt) &&  evt.shiftKey) {    //  shift-click to 'pick up' an area
          HandleShowAll(true);                       //  light em up
          if(evt.ctrlKey) {                          //  but, ctrl-shift-click deletes an area
            areaDelete(elt);
            areaDrawAll(true);
            StartTheToast();
            return;
            }
          HandleShowText(true);                    //  make sure the new position text data is visible
          LOG("  Moving '"+ elt.getAttribute("hintTitle") +"'.  Click new location.");
          moveArea = elt;
          Moving = true;
          return;
          }
        }
       else {                                      //  Moving and got the 2nd click.  Drop it.
        areaDrawAll(true);
        moveArea.title = moveArea.getAttribute("hintTitle");    //  oopsie! the 'hints' showed up in the 'title' {chagrin face}
        LOG("    Moved to   ", area2Str(moveArea) +"\n");      //  the new coords
        Moving = false;
        Made = true;
        DisplayClass("Made", "block");             //  make sure the 'mailto:' button is visible
        /// idTextOut.scrollIntoView(false);
        StartTheToast();
        return;
        }    //  if(Moving)
      }    //  if(Editing)
    }    //  if(undefined != elt)
  bush();


    //  if we're making shapes don't pop pix ???  Why not???
  if("" != makingShape) {                        //  in shape-making mode, and a shape-type has been selected
    if(0 == shapeNpts) {                         //  this click is 1st point; don't allow to be in a shape. also allows moves.
      ///  let it go  HandleShapeSelect("");          ///  process as area click
      }
     else {                                      //  not 1st point.
      shapeCont();                               //  process as first/next point.
      }
    }

    //  not picking (or just-now turned off).  Display something in upper-right column
    //    first, hide everything
  divTeaser.style.display = "none";      //  hide #Teaser
  divCards.style.display  = "none";      //  hide #Cards
  Cards.src = "";
  divMovie.style.display  = "none";      //  hide #Movie
  Movie.removeAttribute("autoplay");     //  and stop playing it
  Movie.pause();                         //  and stop playing it
  divTitle.style.display  = "none";      //  hide #TitleText

  StopTheToast();                                //  got a click.  abort if still popped

  if(undefined == elt) {                                   //  no <AREA> selected.   display #Teaser
    divTeaser.style.display = "inline-block";      //  show #Teaser
    }
   else if("" != elt.alt) {                                //  got a #Card image
    divCards.style.display  = "inline-block";       //  show #Cards
    Cards.src = cardsPath + elt.alt + cardsExt;
    }
   else {                                                  //  it's something, but what?
    let type = elt.getAttribute("type");
    if(null != type) {
      if("video" == type.trim().substr(0,5)) {             //  got a #Movie
        divMovie.style.display = "inline-block";    //  Let's see a #Movie
        Movie.innerHTML  = elt.getAttribute("Sources");    //  N.B. "Sources" is NON-STANDARD
        Movie.muted = false;
        Movie.load();   //  (re)-load
        Movie.play();   //  start playing
        /// branch(divMovie);
        }
      }
     else /*if("" != elt.title)*/ {                        //  nothing in particular, I guess
       TitleText.innerHTML = elt.getAttribute("hintTitle");   //  show the hintTitle
       divTitle.style.display  = "inline-block";
       }
    }
}

var Toasted=false;
//==================================================================================================
function StartTheToast() {                       //  sloooowly
  if(Toasted)
    return;
  Toasted = true;
  FadeIn(PopTheToast,   700, 12000, 1000,   Toast);
}
var dwas = -1;
//==================================================================================================
function PopTheToast(d) {
    /*  this is slidier
  let q2 = 100*(Number(byId("divPix").clientWidth) + Number(Toast.clientWidth)) / Number(byId("divPix").clientWidth) / 2;
  if(dwas < d)
    Toast.style.left = Number(101 - q2*d*d) + "%";
   else
    Toast.style.left = Number(100 - q2 - q2*(1-d)*(1-d)) + "%";
  dwas = d;
  Toast.style.top = "85%";
    /* */
    /*  but this is toastier  */
  Toast.style.top = Number(101 - 20*d*d) + "%";
  Toast.style.opacity = d*d;
}
//==================================================================================================
function StopTheToast() {                        //  rpdly
  let f = Toast.getAttribute("FaderIndex");
  if(null != f) {
    let fo = Faders[f];
    if(fo.done) {
      return;
      }
    FadeOut(fo,  500);
    Toast.removeAttribute("FaderIndex");
    }
}
//==================================================================================================
  // called when the "not-visible button" is clicked
function showBug(e) {                            //  un/hide area/shape maker, and other stuff
  if(e.ctrlKey) {
    DisplayClass("clsDebugs");                   //  toggle hidedness
    ShowAll = true;
    }
  if(e.shiftKey) {
    Toasted = false;
    StartTheToast();
    HandleShowText(true);
    /// idTextOut.scrollIntoView(false);
    Toasted = false;
    }
}


//==================================================================================================
function area2Str(elt) {
if((undefined == elt) || (null == elt)) {
  LOG("! ERROR - area2Str(): elt=='", elt, "'.  caller=", area2Str.caller.name);
  return;
  }
  let str = "";
  str += "<area shape='"+ elt.shape +"' coords='"+ elt.coords +"'";
  if("" != elt.alt)  str += " alt='"+ elt.alt +"'";
  /// if("" != elt.title)  str += " title='"+ elt.title +"'";            //  might not be hinting, so ...
  ///  else
  str += " title='"+ elt.getAttribute("hintTitle") +"'";     /// this might not be right.  fix in post
  if(undefined != elt.type)  str += " type='"+ elt.type +"' medaFile='"+ elt.getAttribute("medaFile") +"'";
  str += ">";
  return str;
}

//==================================================================================================
function PlayMedia(element) {                    // if elt.type == "audio", play it.
  let type = element.getAttribute("type");
  if(null == type)
    return;
  switch(type.trim().substr(0,5).toLowerCase()) {
    case "audio":
      sounding = true;
      Sounder.type = element.getAttribute("type");
      Sounder.src  = element.getAttribute("Sources");        //  N.B. "Sources" is NON-STANDARD
      Sounder.play();
      break;
    case "video":
        //  plays in #divMovie instead of #Cards
      break;
    default:
      LOG("\n! Error:  PlayMedia(): case="+ type);
      HandleShowText(true);
      break;
    }
}


//==================================================================================================
function areaMouseIn(element) {                  //  hovering
  if(ShowHints) {                                //  if an <AREA> has a "title" it is displayed when hovered
    let str = element.getAttribute("hintTitle");    //  display the <AREA>s info
    if(ShowTips) {
      if(! Moving)
        str += "\n (Shift-click to 'pick up')";
       else
        str += "\n (Click to 'drop')";
      if(Editing) {
        if("" == makingShape)
          str += "\n (still making? pick a shape)";
         else
          str += "\n (still making)";
        }
      }    //  if(ShowTips)
    element.setAttribute("title", str);
    }    //  if(ShowHints)
   else                                          //  not ShowHints
    element.setAttribute("title", "");           //  turn off the tooltip

  areaDraw(element);

  PlayMedia(element);
}
//==================================================================================================
function areaMouseMove(event, elt) {             //  hovering
/// elt.setAttribute("title", elt.getAttribute("title"));    ///  this didn't work like I hoped
imgMouseMove(event);
}
//==================================================================================================
function areaMouseOut(element) {                 //  no longer hovering

  if(element.getAttribute("x2k") != BrgBtnNdx)    //  erase if not the 'current' area
    areaClear(element);

  if(ShowHints) {                                //  if an <AREA> has a "title" it is displayed when hovered
    element.setAttribute("title", element.getAttribute("hintTitle"));    //  restore normal title
    }
   else                                          //  not ShowHints
    element.setAttribute("title", "");           //  turn off the tooltip

  if(sounding) {
    Sounder.pause();
    Sounder.src = "";
    }
}

//==================================================================================================
function areaCursor(c) {                         //  re/set visual reminder for all the areas
  for(let i=0; i<NAreas; i++)
    Areas[i].style.cursor = c;
}


  //  process mouse clicks in #imgPano
//==================================================================================================
function imgClick(e) {                           //  clicked outside an area.  TODO??? use <AREA shape="default" ...> ???
/// bugln(" clk("+ e.clientX +") ");
/// bug(" Clk");
  let str="'";
  if(e.shiftKey) str += "S";
  if(e.ctrlKey)  str += "C";
  if(e.altKey)   str += "A";
  if(e.metaKey)  str += "M";
  bug3(str +"'");

  TipOfTheDay();
  if("" == makingShape) {                        //  not (or haven't started) making a shape
    flashCard();                                 //  show the #Teaser
    if(Editing) {                                 //  making but haven't selected a shape to Make
      byId("ShapeBox").style.backgroundColor = "orange";    //  remind user
      }
    }
   else {                                        //  making a new shape
    if(e.ctrlKey) {                              //  ctl-click; erase last point
      if(0 < shapeNpts) {
        shapeClear(msX, msY);                    //  draws
        shapeNpts--;
        if(0 < shapeNpts) {                      // a poly with some points left
          shapeDraw(msX, msY);
          }
         else {                                  // a circle or rect with no points left
          areaDrawAll(true);
          }
        }
      }
     else if(e.shiftKey) {                       //  shift-click; this is the last point.  same as double-click
      shapeCont();                               //  process click as last point
      if("poly" == makingShape)
        shapeClose();
      }
     else                                        //  regular click
      shapeCont();                               //  process click as next point
    }
  TipOfTheDay();
}    //  imgClick(e)

//==================================================================================================
function imgDblClick(e) {                        //  end of "poly" point input?
/// bug(" dblClk");
  if(e.ctrlKey || e.shiftlKey)                   //  imgClick() has already been called,
    return;                                      //   so ignore 2nd-click if ctrl-key or shift-key
  if("poly" == makingShape)
    shapeClose();
}


//==================================================================================================
function bodyMouseMove(e) {                      //  brutality and buggery and rum!!!
  bug2(e.pageX);
  bug3(e.pageY);
}
//==================================================================================================
function imgMouseMove(e) {                       //  mouse is restless.  Watch its AZ
   /// bug(", "+ e.clientX);
/*
if(0 < scrn) {
  bugln(" scrn=", scrn, "  scrq=", scrq);
  scrn = 0;
  }
/* */

  let  x, y;
    //  update az/brg display
  x = e.pageX;
  x -= imgLeft;                                  //  account for container position
  x += divPano.scrollLeft;                       //  account for image scroll
  y = e.pageY;
  y -= imgTop;                                   //  account for container position

  bug0(x);
  bug1(y);

  if(x < 0) { x = 0; }
  if(y < 0) { y = 0; }
  UpdateBrgAz(x - imgLeft);                      //  mouse-X to divPix-x

    //  continuous feedback while moving areas
  if(Moving) {
    areaClear(moveArea, true);                   //  clear old position
    areaMove(moveArea, x-msX, y-msY);            //  TODO  just move a shape???  'title' stuff???
    /// areaDraw(moveArea);                      //  draw new one
    areaDrawAll(true);
    }

  if(Editing) {                                   //  making
    if("" == makingShape) {                      //  but haven't selected a shape to Make
      byId("ShapeBox").style.backgroundColor = "orange";    //  notify user
      }
    }

    //  continuous feedback while drawing shapes
  if(0 < shapeNpts) {
    shapeClear(msX, msY);                        //  clear old shape
    shapeDraw(x, y);                             //  draw new one
    areaDrawAll(true);
    }

  msX = x;  msY = y;
}    //  imgMouseMove(e)

//==================================================================================================
function imgMouseOut() {
    //  restore az/brg display to center of visible
  UpdateBrgAz();                                 //  mid-screen X to Az
}    //  imgMouseOut()


//==================================================================================================
function X2Az(x) {                     //  convert #imgPano X coord (pxl) to panorama Azimuth (deg)
    // az = 360 * (x + scroll - (px_at_0Az))/(px_in_360)
  let az = Number(360.0*(x - PX0)/PX360);
  if(az < 0.0)                                   //  [0 ..
    az += 360.0;
  if(360.0 <= Number(az))
    az -= 360.0;                                 //     .. 359.999]
  az = Math.floor(az + 0.5);                     //  integer round().  always positive, so OK
  if(360.0 == Number(az))
    az = 0.0;
  return az;
}
//==================================================================================================
/* --maybe later--???
  //  convert panorama Azimuth (deg) to #imgPano X coord (pxl)
function Az2X(az) {
    // az = 360 * (x + scroll - (px_at_0Az))/(px_in_360)
    // x = ((Az * (px_in_360)) / 360) - scroll + (px_at_0Az))/
  let  x  = az*PX360/360;
  if(x < 0.0)
    x += PX360;
  if(PX360 <= Math.floor(x))
    x -= 0;
  bugln("   A2X: "+ az +" => "+ x);
  return Math.floor(x);
}
/* */

//==================================================================================================
function UpdateBrgAz(x) {                        //  update az/brg display when scrolling #imgPano
  if(undefined === x)
    x = divPano.scrollLeft + divPano.clientWidth/2;    //  default to center of current
  if(x < 0) { x = 0; }                           //  let's keep it positive
  let az = X2Az( x );                            //  view X pxl -> Az deg
  if(Number(az) <  10) az = "0"+ az;
  if(Number(az) < 100) az = "0"+ az;             //  3 digits
  BrgOut.innerHTML = az;
  return az;
}

var Azwas=0;
//==================================================================================================
function divPanoScroll() {                       //  update az/brg display when scrolling #imgPano
    //  allow (nae, encourage!) continuous cylindrical scrolling (CCS (C))
    //  divPano.scrollLeft ==  0 when scrolled far right  (slider far left)
    //  divPano.scrollLeft == SR when scrolled far left   (slider far right)
  let SR = divPano.scrollWidth - divPano.clientWidth;    //  SL when slider at far right
    //  This effect is pretty cool when the window width is <= the pano overlap
    //    that is, when  divPano.clientWidth <= (PXALL - PX360)
  if(0 == divPano.scrollLeft) {                  //  |<- at the left wall, slider moving left
    divPano.scrollLeft = Math.min( SR - 1, PX360 );    //  transport right through it (rotate 360 ->)
    }
   else if(SR <= divPano.scrollLeft) {           //  at the right wall, slider moving right ->|
    divPano.scrollLeft = Math.max( 1, SR - PX360 );    //  if the window's too wide (see above) just 1
    }                   //  like those guys in 'Ghost', or some other fictional wall transfuser guys

  let az = UpdateBrgAz();                        //  set az for middle of view

  let wh2 = Number(RoseWH)/2;
  ctxRose.clearRect( 0, 0, RoseWH, RoseWH);
  ctxRose.translate( wh2, wh2);                  //  translate (0, 0) to center of Rose (or vice versa?)
  ctxRose.rotate((Azwas-az) * Math.PI/180);      //  incremental rotation about (0, 0)
  ctxRose.translate( -wh2, -wh2);                //  return to (0, 0) so ...
  ctxRose.drawImage(Rose, 0, 0,  RoseWH, RoseWH);    //  rotated image shows in right place.  Sheesh!

  Azwas = az;
}

//==================================================================================================
function divPanoWheel(e) {                       //  scroll #imgPano with wheel
    //  for every wheel scroll event:
    //    firefox sends "3 lines" (dY=3, mode=1) and
    //    chrome sends "100 pxl" (dy=100, mode=0)
    //    TODO Edge/IE???
    //  so just use five degrees per pulse.  seems to work ok

  if(e.altKey)                                   //  normally scroll pano horizontally w/ no vertical
    return;                                      //    +ALT => only scroll wheel window vertically

  e.preventDefault(true);                        //  prevents the window from jumping up and down
  ///???     e.stopPropagation();

  let dx = 5*PX360/360 * Math.abs(e.deltaY)/e.deltaY;    //  IE has no Math.sign()???
  ScrollPanoByX( dx );                           //  divPanoScroll() will handle 'too far' right or left
}

//==================================================================================================
function ScrollPanoToX(x) {
  let SL = x - divPano.clientWidth/2;            //  divPano.scrollLeft when x is centered
  let SR = divPano.scrollWidth - divPano.clientWidth;    //  max divPano.scrollLeft
  if(SL <= 0)                                    //  |<- at or past the left side
    SL = 1;
   else if(SR <= SL)                             //  at or past the right wall
    SL = SR - 1;
  divPano.scrollLeft = SL;                       //  X -> middle of view (hopefully)
}
//==================================================================================================
function ScrollPanoByX(dx) {
  divPano.scrollLeft += dx;
}

var  wN=-1;    //  how many buggerys
//==================================================================================================
function wheelNot(e, elt) {                    //  don't scroll parent(s)
    //  using regular mouse wheel, for each pulse
    //  FF reports dY = +/-3 lines  dX=dZ=0  Mode=1
    //  Chrome:    dY = +/-53px     dX=dZ=0  Mode=0  regardless of font-size
    //  IE:
  if(0 < wN) {
    wN--;
    bug("wN: "+ elt.id);
    bugln("  dM=", e.deltaMode,  "   dX=", e.deltaX, " dY=", e.deltaY, " dZ=", e.deltaZ, "   alt=", e.altKey);
    }

  if(e.altKey) {
    return;                                      //  ALT => only scroll whoel window vertically
    }

  // e.preventDefault(true);                        //  prevents the window from jumping up and down
  e.stopPropagation();

  let dX = e.deltaX;  ///???  if(1 == e.deltaMode) { dX *= 53/3; }  //  dX in pixels.   see above
  let dY = e.deltaY;                             //  assume pxls (Mode 0)
  if(1 == e.deltaMode) { dY *= 53/3; }           //  dY in pixels.   see above
  elt.scrollLeft += dX;
  elt.scrollTop  += dY;
  bug3(dY);
}


//==================================================================================================
function HandleResize() {                        //  window resized

  byId("Bearings").style.left = Number((byId("divPix").clientWidth - byId("Bearings").clientWidth)/2) + "px";

  byId("Toast").style.left = Number((byId("divPix").clientWidth - byId("Toast").clientWidth)/2) + "px";

}


//==================================================================================================
function HandleBrgBtns(i) {                      //  BrgBtns clicked

  if(Editing || Moving)                           //  finish that first
    return;                                      //  too complicated

  bush(false);
  bug("    HBB: BrgBtnNdx=", BrgBtnNdx, " x2k=", areaX2K[BrgBtnNdx]);
  if(ShowAll)
    areaDraw(Areas[areaX2K[BrgBtnNdx]]);         //  old color for old area
   else
    areaClear(Areas[areaX2K[BrgBtnNdx]]);        //  no color

  BrgBtnNdx += i;                                //  which way?
  if(NAreas <= BrgBtnNdx)
    BrgBtnNdx = 0;                               //  circulate!
   else if(BrgBtnNdx < 0)
    BrgBtnNdx = NAreas-1;
  bug("   => ", BrgBtnNdx, " x2k=", areaX2K[BrgBtnNdx]);

  let a = Areas[areaX2K[BrgBtnNdx]];             //  areaX2K is <AREA>s indexes sorted in X-coord order
  if(BUG)bugln(" => ", area2Str(a));
  bush();

  flashCard(a);                                  //  show #Card or "Title"
  areaDraw(a, "#00FF00");                        //  light it up

    //  scroll <AREA> into view
  ScrollPanoToX( a.getAttribute("x") );          //  put <AREA> in the center
}


  //  call HandleShowHints() before HandleShowAll()
//==================================================================================================
function HandleShowHints(hintq) {
  ShowHints = hintq;
  byId("idShowHints").checked = ShowHints;       //  visual
  if(! ShowHints)
    HandleShowTips(false);                       //  kinda makes sense
}
//==================================================================================================
function HandleShowTips(tipq) {
  ShowTips = tipq;
  /// byId("idShowTips").checked = ShowTips;         //  visual
  if(ShowTips)
    HandleShowHints(true);                       //  complimentary
}
//==================================================================================================
function HandleShowAll(showq) {
  ShowAll = showq;
  byId("idShowAll").checked = ShowAll;           //  change status
  if(ShowAll)
    HandleShowHints(true);                       //  circle jerk?

  areaDrawAll(ShowAll);
}

//==================================================================================================
function HandleShowText(textq) {
  if(Made)                                      //  there's new data
    textq = true;                               //  leave it open
  /// if(textq == byId("idShowText").checked)       //  no change, so ...
  ///   return;                                    //    stop bouncing the screen around
  byId("idShowText").checked = textq;           //  update status
  DisplayClass('clsTextOut', textq);
  /// if(textq)
  ///   idTextOut.scrollIntoView(true);
}

//==================================================================================================
function HandleEditAreas(editq) {

  Editing = editq;

  makingShape = "";                              //  reset the shape picked
  byId("rbUnShape").checked = true;              //  un-checks the real shape radio buttons :-)
  byId("ShapeBox").style.backgroundColor = "#EBE594";    //  set a reminder color to pick a shape

  imgPano.style.cursor = "auto";                 //  reset visual reminder
  areaCursor("pointer");                         //  'pointer' for all the <AREA>s

    //  update options menu display
  if(Editing) {
    DisplayClass("clsShapeShifter", "block");    //  un-hide all the makey-shapey stuff
    DisplayClass("clsTextOut", "block");
    DisplayClass("BrgBtns", "none");

    byId("makeInstructions").scrollIntoView(false);

    ShowAllWas   = ShowAll;
    ShowHintsWas = ShowHints;
    HandleShowAll(true);                         //  also does ShowHints
    HandleShowTips(true);                        //     ditto
    HandleShowText(true);

    imgPano.style.cursor = "not-allowed";        //  another visual reminder

    byId("idShowAll").disabled   =  true;        //  disable hiding when making
    byId("idShowHints").disabled =  true;
    /// byId("idShowTips").disabled  =  true;    //  allow to un-check tips
    byId("idShowText").disabled  =  true;

    imgPano.title = "(Pick a shape to make)";
    editingTip = "\n (Pick a shape to make)";

    byId("Bearing").title = "Still making";

    LOG();       //  stet
    }    //  if(Editing)

   else {                                        //  stopped Editing
    DisplayClass("clsShapeShifter", "none");     //  hide all the shapey-makey stuff
    DisplayClass("clsTextOut", "block");         //  leave this open
    if(Made) {
      DisplayClass("Made", "block");             //  do we need to report in?
      }
    DisplayClass("BrgBtns", "inline");
    /// idTextOut.scrollIntoView(false);

    HandleShowHints(ShowHintsWas);               //  restore checkedness
    HandleShowAll(ShowAllWas);                   //  also does ShowHints
    HandleShowTips(false);                       //     ditto
    HandleShowText(true);                        //  leave text area open

    byId("idShowAll").disabled   =  false;       //  turn these (back) on
    byId("idShowHints").disabled =  false;
    // byId("idShowTips").disabled  =  false;
    byId("idShowText").disabled  =  false;

    imgPano.title = "";

    byId("Bearing").title = "View direction (degrees)";

    }    //  else if(Editing)
}    //  function HandleOptionsMenu()


//==================================================================================================
function HandleShapeSelect(shapeq) {             //  response to #ShapeSelect.
  if(0 < shapeNpts)                              //  already "Make"-ing a shape
    shapeClose();                                //  finish current
  makingShape = shapeq;
  byId("ShapeBox").style.backgroundColor = "";             //  reset color
  if("" == makingShape) {
    byId("rbUnShape").checked = true;            //  un-checks the real shape radio buttons :-)
    imgPano.style.cursor = "auto";               //  reset visual reminder
    areaCursor("pointer");                       //  for all the areas too
    TipOfTheDay();
    }
   else {
    LOG("");                                     //  makes the display prettier
    imgPano.style.cursor = "crosshair";          //    set visual reminder
    areaCursor("crosshair");                     //  for all the areas too
    HandleShowAll(true);                         //  ShowAll the <AREA>s
    TipOfTheDay();                               //  do this before shapeOpen()
    shapeOpen();                                 //  wait for 1st click
    }
}

//==================================================================================================
function TipOfTheDay() {                         //  re/set visual reminder for all the areas
  if(ShowHints) {                                //  if an <AREA> has a "title" it is displayed when hovered
    let str = "";
    if(ShowTips) {
      if(Editing) {
        if(0 == shapeNpts) {
          if("circle" == makingShape)
            str += "(click for center)";
           else if("poly" == makingShape)
            str += "(click for first point)";
           else if("rect" == makingShape)
            str += "(click for first corner)";
           else
            str += "(Pick a shape)";
          }
         else {
          if("circle" == makingShape)
            str += "(click to set)";
           else if("poly" == makingShape)
            str += "(click for next point. Shift-click to end. \n   Ctrl-click to back up)";
           else if("rect" == makingShape)
            str += "(click to set)";
           else
            str += "(? 0<N shape="+ makingShape +"!?)";
          }
        }    //  if(Editing)
      }    //  if(ShowTips)
    imgPano.title = str;

    }    //  if(ShowHints)

   else
    imgPano.title = "";                          //  turn off the tooltip
}


  //  process 1st, [intermediate], and last points for new shapes
//==================================================================================================
  //  called to setup for a new shape for make.  No points picked yet.
function shapeOpen() {                           //  setup for a new area/shape
  if(0 < shapeNpts) {
    LOG("\n! Error:  shapeOpen(): shapeNpts = "+ shapeNpts +"\n");
    HandleShowText(true);
    shapeClose();
    }
  shapeNpts = 0;
  switch(makingShape) {
    case  "circle":  shapeXpts = 2;                   break;   //  center, radius
    case  "poly":    shapeXpts = shapePts.length/2;  break;   //  apices
    case  "rect":    shapeXpts = 2;                   break;   //  diametrical corners
    default:
      LOG("! ERROR: shapeOpen: makingShape="+ makingShape);
    }
}
//==================================================================================================
  //  process new shape point
function shapeCont() {                            //  continue/add to shape.
  let n2 = 2*shapeNpts;
  shapePts[n2] = msX;  shapePts[n2+1] = msY;
  // bug("("+ n2/2 +": "+ msX +", "+ msY +") ");
  shapeNpts++;
  if(shapeXpts <= shapeNpts)
    shapeClose();
}
//==================================================================================================
  //  got last shape point.  actually create the new <AREA>
    //-TODO-  should(?) check for zero dimensions, etc.  But it's just screen clutter, so let the user clean it???
function shapeClose() {                          //  guess
    //  <area shape='rect' coords='4043, 249,  4070, 258'  title='085 Dawson Pk'>
    //                             <-      cstr       ->          <-   tstr  ->
  let  cstr, tstr,  xavg;                        //  Coord and Title strings
  let  str = "<area shape=\'"+ makingShape +"\'  coords=\'";    //  start of <AREA> text
  let  A = document.createElement("AREA");       //  add the new area to the map
  switch(makingShape) {
                                                 //  standard shape names are 'circle', 'poly', 'rect' & 'default'
    case  "circle":                              //  center, rad
      cstr = cstrCirc(shapePts[0], shapePts[1],  shapePts[2], shapePts[3]);
      xavg = shapePts[0];
      tstr = X2Az(xavg) +" circle";              //  standard shape text
      A.shape = "circle";
      break;

    case  "poly":             //  apices
        //  dblClick registers multiple last points.  remove duplicate ADJACENT points
      let o=0;
      while(o < 2*shapeNpts-2) {        //  N.B. shapeNpts can change inside the while()!
        if((Math.abs(shapePts[o] - shapePts[o+2]) < 2) && (Math.abs(shapePts[o+1] - shapePts[o+1+2]) < 2)) {  //  ~duplicated adjacent points
          for(let i=o+2, n2=2*shapeNpts-2; i<n2; i++)               //  move higher points down
            shapePts[i] = shapePts[i+2];
          shapeNpts--;
          }
         else
          o += 2;
        }

      if(shapeNpts < 3) {                        //  need at least three points for a poly
        LOG("! Need at least 3 points for a 'poly'.");
        return;
        }

      let  xn=shapePts[0],  xx=xn;               //  get x-range for tstr
      for(let i2=2, n2=(2*shapeNpts); i2<n2; i2+=2) {
        xn = Math.min(xn, shapePts[i2]);  xx = Math.max(xx, shapePts[i2]);
        }
      cstr = shapePts.slice(0,2*shapeNpts).toString();
      xavg = (xn+xx)/2;
      tstr = X2Az(xavg) +" poly";
      A.shape = "poly";
      break;

    case  "rect":             //  diametrical corners
      cstr = LTRB(shapePts[0], shapePts[1],  shapePts[2], shapePts[3]);
      xavg = (shapePts[0]+shapePts[2])/2;
      tstr = X2Az(xavg) +" rect";
      A.shape = "rect";
      break;

    default:
      LOG("! shapeClose default: makingShape=", makingShape);
    }

  str += cstr +"\'  title=\'"+ tstr +"\'>";      //  complete <AREA> text
  LOG("  New area = "+ str);

  shapeNpts = 0;

    //  create new <AREA> and add it to the <MAP>
  A.coords = cstr;
  A.title  = tstr;                               //  it's a TITLE until we get a pic to pop; then a ALT.
  A.setAttribute("hintTitle",  A.title);         //  used for hinting.  N.B.  "hintTitle" is NON-STANDARD.

  areaAdd(A, xavg);                              //  complete the process

  areaDrawAll(true);

  Made = true;                                   //  we got new stuff!
  DisplayClass("Made", "block");                 //  make sure the mailto button is visible
  StartTheToast();

  TipOfTheDay();
}    //  function shapeClose()


  //  make strings of the shape coords  =============================================================
  //    circle:  (x0,y0, x1,y1) => (x0,y0, rad)
  //    rect:    (x0,y0, x1,y1) => (L,T,  w,h)
//==================================================================================================
function cstrCirc(x0, y0,  x1, y1) {             //    create 'circle' coordstr = "X, Y, Rad"
  let rad = Math.sqrt( Math.pow((x1-x0), 2) + Math.pow((y1-y0), 2) );
  let cstr = x0 +", "+ y0 +",  "+ Math.round(rad);
  return  cstr;
}
//==================================================================================================
function cstrRect(x0, y0,  x1, y1) {             //    create 'rect' coordstr = "L, T,  R, B"
  let left, right,  top, bot;
  if(x0 <= x1) { left = x0;  right = x1; }
   else {       left = x1;  right = x0; }   /// TODO replace w/ LTRB
  if(y0 <= y1) { top  = y0;  bot   = y1; }
   else {       top  = y1;  bot   = y0; }
  let cstr = left +", "+ top +",  "+ right +", "+ bot;
  return  cstr;
}


//==================================================================================================
function areaMove(elt,  dx, dy) {
  let  C = elt.coords.split(","),  cstr="";
  C[0]   = Number(C[0])   + dx;
  C[0+1] = Number(C[0+1]) + dy;
  cstr = C[0] +", "+ C[0+1];                     //  "x, y"
  if(3 == C.length)                             //  a 'circle'
    cstr += ", "+ C[2];                          //  "x, y" + ", r"
   else {
    for(let i2=2, n2=C.length; i2<n2; i2+=2) {
      C[i2]   = Number(C[i2])   + dx;
      C[i2+1] = Number(C[i2+1]) + dy;
      cstr +=  ", "+ C[i2] +", "+ C[i2+1];
      }
    }
  elt.coords = cstr;
  elt.setAttribute("x",  elt.getAttribute("x")+dx);
}

//==================================================================================================
function areaDraw(element, newclr) {                     //  called to draw an area
  let shape    = element.getAttribute("shape");
  let coordStr = element.getAttribute("coords");
  let oldclr;
  if(undefined != newclr) {
    oldclr = ctxPano.strokeStyle;
    ctxPano.strokeStyle = newclr;
    }
  switch(shape) {
    case "circle":  drawCirc(coordStr);  break;
    case "poly":    drawPoly(coordStr);  break;
    case "rect":    drawRect(coordStr);  break;
    default:
      LOG("! areaDraw: shape[", element.getAttribute("x2k"), "]="+ shape +"\n");
    }
  if(undefined != newclr)
    ctxPano.strokeStyle = oldclr;
}
//==================================================================================================
function areaDrawAll(q) {                         //  refresh all the areas
  if(undefined === q)
    q = true;

  if(q) {
    for(let i=0; i<NAreas; i++)
      areaDraw(Areas[i]);
    }
   else {
    ctxPano.clearRect(0, 0, cvsPano.width, cvsPano.height);
    }
}
//==================================================================================================
function areaClear(element, doit) {              //  clear an area.
  if((undefined != doit) && doit) {              //  allow override of ShowAll
      //  keep going
    }
   else if(ShowAll)                              //  don't erase if ShowAll
    return;

  let shape    = element.getAttribute("shape");
  let coordStr = element.getAttribute("coords");
  switch(shape) {
    case "circle":  undrawCirc(coordStr);  break;
    case "poly":    undrawPoly(coordStr);  break;
    case "rect":    undrawRect(coordStr);  break;
    default:
      LOG("! areaClear: shape="+ shape +"\n");
    }
}

//==================================================================================================
function SetupAreaEvents(A) {
  /// A.setAttribute("href", "javascript:flashCard(this)");              ///  seems to use 'document' as 'this'
  A.setAttribute("onclick",     "flashCard(this, event)");           //  needs <AREA>.  event is optional.
  /// A.setAttribute("ondblclick",     "imgDblClick(this)");
  A.setAttribute("onmouseover", "areaMouseIn(this)");                //  called to outline area
  A.setAttribute("onmouseout",  "areaMouseOut(this)");               //  un-outline
  A.setAttribute("onmousemove", "areaMouseMove(event, this)");       //  update az/brg display when mouse is in an area
  A.setAttribute("onwheel",     "divPanoWheel(event)");              //  scroll #divPano w/mouse wheel
}

//==================================================================================================
function areaAdd(A, xavg) {
  if(null == A) {
    LOG("\n! ERROR - areaAdd: null area.  caller=", areaAdd.caller.name);
    return -1;
    }

  SetupAreaEvents(A);

  bush(false);
  let ik = areaXK.findIndex( function (x) { return xavg < x; } );     //  insertion point for new area
  areaXK.splice(ik, 0,  xavg);
  areaX2K.splice(ik, 0,  NAreas);

  A.setAttribute("x",  xavg);
  A.setAttribute("x2k",  ik);
  if(BUG)bugln(area2Str(A));
  bush();

  byId("idMap").appendChild( A );                //  awww.  a new baby area!

bush(false);
bug("  areaAdd: pre-remap")
branch(idMap);
  Areas = byId("idMap").children;                ///  is this needed???  Doesn't look like it!!!
  NAreas = Areas.length;                        ///  just +1 ???
bugln();
branch(idMap);
bush();

  for(let ii=ik+1; ii<NAreas; ii++) {            //  update the <AREA>'s x2k to reflect the insertion
    Areas[areaX2K[ii]].setAttribute("x2k",  Number(Areas[areaX2K[ii]].getAttribute("x2k")) + 1);
    }
  BrgBtnNdx = ik;                                //  set the new area as current
  flashCard(Areas[areaX2K[BrgBtnNdx]]);          //  show it off!
}

//==================================================================================================
function areaDelete(A) {
  if(null == A) {
    LOG("\n! ERROR - areaDelete: null area.  caller=", areaDelete.caller.name);
    return -1;
    }

  LOG("! Deleting ", area2Str(A));
  areaClear(A, true);                            //  erase it while it still exists :-)

  bush(false);

  let x2k = Number(A.getAttribute("x2k"));       //  index into X-sorted list
  let   k = Number(areaX2K[x2k]);                //  index into <AREA> list
  areaXK.splice(x2k, 1);                         //  delete 1 elt and add nothin
  areaX2K.splice(x2k, 1);

  delMap.appendChild( A.cloneNode(true) );       //  save the <AREA> for ???

  byId("idMap").removeChild( A );                //  awww.

bush(false);
bug("  areaDelete: pre-remap")
branch(idMap);
  Areas = byId("idMap").children;                ///  is this needed???  Doesn't look like it!!!
  NAreas = Areas.length;                        ///  just -1 ???
bugln();
branch(idMap);
bush();

     //  update the x2ks  to reflect the deletion
  bugln("  k=", k);
  for(let i=0; i<NAreas; i++) {
    let Ax2k = Number(Areas[i].getAttribute("x2k"));
    if(x2k < Ax2k) {                             //  looping over AREA-order
      Areas[i].setAttribute("x2k",  Number(Ax2k) - 1);
      }
    if(k < Number(areaX2K[i])) {                 //  looping over X-order
      areaX2K[i]--;
      }
    }

  flashCard();                                   //  show teaser
  bugln();
  bush();
}



//==================================================================================================
function shapeDraw(x, y) {                       //  draw the shape being made
  let coordStr;
  switch(makingShape) {
    case "circle":
      drawCirc(shapePts[0], shapePts[1], x, y);
      break;
    case "poly":
      coordStr = shapePts.slice(0,2*shapeNpts).toString() +", "+ x +", "+ y;
      drawPoly(coordStr);
      break;
    case "rect":
      drawRect(shapePts[0], shapePts[1], x, y);
      break;
    default:
      LOG("! shapeDraw: makingShape="+ makingShape +"\n");
    }
}
//==================================================================================================
function shapeClear(x, y) {                      //  clears the bounding rectangle of [shapePts, (x, y)]
  let coordStr;
  switch(makingShape) {
    case "circle":
      coordStr = cstrCirc(shapePts[0], shapePts[1],  x, y);
      undrawCirc(coordStr);
      break;
    case "poly":
      coordStr = shapePts.toString() +",  "+ x +", "+ y;
      undrawPoly(coordStr);
      break;
    case "rect":
      coordStr = cstrRect(shapePts[0], shapePts[1],  x, y);
      undrawRect(coordStr);
      break;
    default:
      LOG("! shapeClear: makingShape="+ makingShape +"\n");
    }
}


//==================================================================================================
//  Stuff grabbed from http://stackoverflow.com/questions/12661124/how-to-apply-hovering-on-html-area-tag
//  Thanks http://stackoverflow.com/users/1630963/enhzflep !!!!!!
//  MUCHLY(!) modified.
//  The undraws are mine; clear surrounding rectangle.  original was to blank the whole canvas

  //  un/draw the area shapes  =====================================================================
//==================================================================================================
function undrawCirc(arg1, y0,   rad) {    //  ("x0, y0, rad") XOR (x0, y0,  rad)
  let  x0;
  if(1 == arguments.length) {                    //  then called with ("x0, y0, rad")
    let  C = arg1.split(",");
    x0 = Number(C[0]);  y0 = Number(C[1]);   rad = Number(C[2]);
    }
   else {                                        //  called with (x, y,  rad)
    x0  = arg1;
    }
  let  dr = ctxPano.lineWidth;
  let x=x0-rad-dr, y=y0-rad-dr,  w=2*(rad+dr), h=2*(rad+dr);
  ctxPano.clearRect(x, y,  w, h);   //  clear surounding square
}
//==================================================================================================
function drawCirc(arg1, y0,  x1, y1) {    //  ("x0, y0, rad") XOR (x0, y0,  x1, y1)
  let  x0,  rad;
  if(1 == arguments.length) {
    let  C = arg1.split(",");
    x0 = Number(C[0]);  y0 = Number(C[1]);  rad = Number(C[2]);
    }
   else {
    x0 = arg1;  rad = Math.sqrt( Math.pow((x1-x0), 2) + Math.pow((y1-y0), 2) );
    }
  ctxPano.beginPath();
  ctxPano.arc(x0, y0,  rad,  0, 2*Math.PI);
  ctxPano.stroke();
}

//==================================================================================================
function undrawPoly(arg1,  xt, yt) {             //  ("x0, y0, ... xn, yn")  XOR  (Array[], xt, yt)
  let C,  left, ctop,  right, cbot;              //  clear everything in bounding rectangle

  if(typeof arg1 === "string")                   //  one string: arg1 = "x0, y0, ... xn-1, yn-1"
    C = arg1.split(",");
   else                                          //  Array of [x0,y0, ..., xn-1, yn-1]
    C = arg1.slice(0, 2*shapeNpts);              //  don't include (potentially) deleted points

  left = right = C[0];
  ctop = cbot  = C[1];
  for(let i2=2, n2=C.length; i2<n2; i2+=2) {
    left = Math.min(left, C[i2]);    right = Math.max(right, C[i2]);
    ctop = Math.min(ctop, C[i2+1]);  cbot  = Math.max(cbot,  C[i2+1]);
    }

  if(3 == arguments.length) {                    //  and xt, yt
    left = Math.min(left, xt);  right = Math.max(right, xt);
    ctop = Math.min(ctop, yt);  cbot  = Math.max(cbot,  yt);
    }

  let  dr = 2*ctxPano.lineWidth;
  ctxPano.clearRect(left-dr, ctop-dr,  right-left+2*dr, cbot-ctop+2*dr);
}
//==================================================================================================
function drawPoly(arg1,  xt, yt) {               //  ("x0, y0, ... xn, yn")  XOR  (Array[], xt, yt)
  let  C;
  if(typeof arg1 === "string")                   //  one string: arg1 = "x0,y0, ..., xn,yn"
    C = arg1.split(",");                         //  use whole string
   else                                          //  Array of [x0,y0, ..., xn,yn]
    C = arg1.slice(0, 2*shapeNpts);              //  only shapeNpts pairs

  ctxPano.beginPath();
  ctxPano.moveTo(C[0], C[1]);
  for(let i2=2, n2=C.length; i2<n2; i2+=2) {
    ctxPano.lineTo(C[i2], C[i2+1]);
    }
  if(3 == arguments.length)                       //  and xt, yt
    ctxPano.lineTo(xt, yt);

  ctxPano.lineTo(C[0], C[1]);
  ctxPano.stroke();
}

//==================================================================================================
function LTRB(arg1, y0,  x1, y1) {               //  ensure (x0, y0,  x1, y1) is (Left, Top, Right, Bottom)    TODO
bush(false);
  let x0,   left, top,  right, bot,  swp;
  if(1 == arguments.length) {
    let  C = arg1.split(",");
    left  = Number(C[0]);  top = Number(C[1]);                   //  assumed order
    right = Number(C[2]);  bot = Number(C[3]);
    }
   else {
    x0 = arg1;
    left  = Number(x0);  top = Number(y0);
    right = Number(x1);  bot = Number(y1);
    }
  if(right < left) { swp = left;  left = Number(right);  right = Number(swp); }
  if(bot   < top)  { swp = top;   top  = Number(bot);    bot   = Number(swp); }
  if(BUG)bugln("  ltrb=", [left, top,  right, bot]);
bush();
  return [left, top,  right, bot];
}    /* */
//==================================================================================================
function LTRB2str(LTRB) {                 //  return [Left, Top, Right, Bottom] as a comma-string
  let str = LTRB[0] +", "+ LTRB[1] +", "+ LTRB[2] +", "+ LTRB[3];
  return str;
}

//==================================================================================================
function undrawRect(arg1, y0,  x1, y1) {         //  ("coordStr") XOR (corners)
  let C,  left, ctop,  right, cbot;
  if(1 == arguments.length)                      //  one string: arg1 = "left, top,  right, bot"
    C = LTRB(arg1);
   else                                          //  four args: x0, y0,  x1, y1
    C = LTRB(arg1, y0,  x1, y1);

  left  = Number(C[0]);  ctop = Math.min(Number(C[1]), Number(C[3]));
  right = Number(C[2]);  cbot = Math.max(Number(C[1]), Number(C[3]));
  let  dr = ctxPano.lineWidth;                    //  LW/2 too big, but handles funny corners and saves a /2
  ctxPano.clearRect(left-dr, ctop-dr,  right-left+2*dr, Math.abs(ctop-cbot)+2*dr);    //  (left, ctop, width, height)
}
//==================================================================================================
function drawRect(arg1, y0,  x1, y1) {           //  ("left, top,  right, bot") XOR (x0, y0,  x1, y1)
  let C,  left, ctop,  right, cbot;
  if(1 == arguments.length)                      //  one string: arg1 = "x0, y0,  x1, y1"
    C = LTRB(arg1);                               //  returns [left, top,  right, bot]
   else                                          //  four args: (x0, y0,  x1, y1)
    C = LTRB(arg1, y0,  x1, y1);

  left  = Number(C[0]);  ctop = Math.min(Number(C[1]), Number(C[3]));
  right = Number(C[2]);  cbot = Math.max(Number(C[1]), Number(C[3]));
  ctxPano.beginPath();
  ctxPano.strokeRect(left, ctop,  right-left, Math.abs(ctop-cbot));    //  (left, top, width, height)
  ctxPano.stroke();
}



//  Some util and bug stuff
//==================================================================================================
function DisplayClass(C, q) {                    //  (class [, un/hide | toggle])  un/hide whole class
  let  elts = byClass(C);
  let  Q;
  if(undefined === q)                            //  => toggle
    Q = ("block" == elts[0].style.display)? "none": "block";    //  inline-  use opposite of elt[0].
   else {                                        //  defined
    if(true === q)                               //  sometimes I forget
      Q = "block";                              //  assume
     else if(false === q)                       //  probably won't any more
      Q = "none";
     else                                        //  with all thes silly comments
      Q = q;                                     //  use it
    }
  for(let e=0, n=elts.length; e<n; e++)
    elts[e].style.display = Q;
}


  //  silly messing junk
//==================================================================================================
  //  displays the "not-visible button" when it is hovered
function XMe(e) {
  if((! e.shiftKey) && (! e.ctrlKey))
    return;
  let T = e.currentTarget;
  T.innerHTML = e.shiftKey ? " S " : " C ";
  T.focus();
  T.blur();
}
//==================================================================================================
function unXMe(e) {
  let T = e.currentTarget;
  T.innerHTML = " &puncsp; ";
  T.focus();
  T.blur();
}


//  hide all this crap if no-scripts  -->

