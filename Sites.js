// <!--    hide all this crap if no-scripts

    //  This is clumsy, but works when it's a local file,  i.e. w/out a server

    //  ALL the site (location/station) -specific names, landmarks, etc. are in this file.
    //  The main page is populated from here using javascript.


var                VETTER=0,                  SLIDE=1;
var siteNames  = ["Vetter",                  "Slide"];
var siteLabels = ["Vetter Mountain Lookout", "Slide Mountain Lookout"];
var siteName, siteLabel;

  //  panorama-image-dependant pixel-to-azimuth/bearing values.  set in LoadSite()
var  PX0;           //  pixel at 0 degrees azimuth
var  PX360;         //  number of pixels in 360 degrees
var  PXALL;         //  width in pxls

var  cardsPath, cardsExt;                        //  file path & ext to "card" imagefiles

var  idMap;                                      //  will point to byId("idMap")
var  areaX2K=[0];                                //  permutation vector to let BrgBtns cycle through areas
var  areaXK=[0];                                 //  [X-coord + index k] => [sorted X]

var  X2KNorthish;                                //  "X2K"-index of first area whose bearing > 0 deg

/*  try to get my iphone4 to read this
var IntroLoaded=false;
//==========================================================================================
function preLoadIntro(huh) {                            //  try to get my iphone4 to read this

  if(true) {
    BUGWhere = byId("idFTextOut");
    bugln("  preLoadIntro(): in.  huh='", huh, "'");

    if(IntroLoaded) return;
    IntroLoaded = true;

    LoadIntro();
    }
   else
    return;
}
/* */

//==========================================================================================
function LoadIntro() {                           //  creates the opening site-selection page

/// BUGWhere = byId("idFTextOut");       //  iphone4
/// bugln("  LoadIntro(): in");

  let d = byId("divSiteList");                   //  populate #divSiteList

/*            Apple.  How couldst thou?
  let  n=0;
  while(null == d) {
    d = byId("divSiteList");
    n++;
    }
  bugln("  n=", n);
/* */


/// LoadSite(siteNames[1], siteLabels[1]);

    //   use visible text links instead of menu.
  for(let i=0, len=siteNames.length; i<len; i++) {         //  populate with links to sites
    let astr = "<A class='aIntro' href=\"javascript:LoadSite('"+ siteNames[i] +"', '"+ siteLabels[i] +"')\">";
    astr += siteLabels[i] +"</a> <br/>";
    // bugln(" astr=", astr);
    d.innerHTML += astr;
    }


  if(false)
    DumpBrowserStuff( byId("divIntro") );        //  browser stuff.  not very usefull


}    //  function LoadIntro()



//==========================================================================================
function LoadSite(site, label) {                //  load the <MAP> and <IMG> code

  let  areaText;                                 //  text of what will become the "usemap" attribute of #imgPano

  /// BUGWhere = byId("idTextOut");

  siteName =  site;
  siteLabel = label;
  document.title = label;                        //  relabel browser tab

  byId("divIntro").style.display = "none";       //  hide #divIntro
  byId("divWork").style.display  = "block";      //  show #divWork

  switch( site ) {
    case siteNames[VETTER]: {    //=========================================================================

      //  Headers
    byId("idH1").innerHTML = siteLabels[VETTER];           //  Title
    byId("idH2").innerHTML = "Landmark Trainer";           //  Porpoise
    byId("idH3").style.display = "none";                   //  -or- innerHTML = "A Third Header";

    cardsPath = "Vetter/Cards/";                           //  set defaults for paths & exts to 'card' files
    cardsExt  = ".jpg";                                    //  N.B. the '/'s and the '.'
    /// mediaPath = "SetL/";                                   //  explicitify it in "Sources"

      //  panorama-image-dependant pixel-to-azimuth/bearing values
      //    "Pano/Pano0H500s.jpg" => [5578 x 500]
      //    Overlaps ~[0: 733] & ~[4845: 5577] pxls => [~145: ~199] deg
    PX0   = 2890;    //  pxl loc at ~0 az.     N.B. "Pano/Pano0H500s.jpg" IMG ONLY !!!!!!!
    PX360 = 4845;    //  num pxls in 360 deg   N.B. "Pano/Pano0H500s.jpg" IMG ONLY !!!!!!!
    PXALL = 5578;    //  width of pano

      //  start the panorama <IMG> load early.  attach the <MAP> to it after the <MAP> has been created
    byId("imgPano").width = PXALL;
    byId("imgPano").src = "Vetter/Pano/Vetter.jpg";           // PANOrama, centered at 0 az, 500 pxls High, Sharpened

      //  if there's xtra stuff, do it here.
    if(true) {                                   //  if there's xtra stuff, this is a good place.
      byId("idXtraLink").innerHTML = "Interesting Vetter links";
      byId("idXtraLink").href      = "Vetter/Links/VetterLinks.html";
      byId("idXtraLink").title     = "Opens in a new tab";
      }
     else                                        //  else hide it
      byId("idXtraLink").style.display = "none";

    byId("idThanks").innerHTML = "Info cards courtesy ANFFLA Vetter Mountain Lead Jim Fleming";

    byId("idSched").href="http://www.anffla.org/members/";   /// vetter-mountain-schedule/";


        /*
        Below is a list of the <AREA>s that populate the <MAP>
        Minimum input for the <AREA>s with a pop-up image ('card') is "shape", "coords" and "alt" fields.
        "Alt" text is assumed to be the path to a pic to pop into #Cards when the area is clicked.
          (filename = cardsPath + alt + cardsExt)
        Bonus:
          "Shapes" only need the first four letters correct; 'circ', 'CIRC, 'circus', 'circular' all resolve to 'circle'.
          "Title"s can be set for <AREA>s with or without pix, to show when hovering.
          A "type" of "video/mp4" will show the movie specified in "Sources", instead of a pic.
          A "type" of "audio/mpeg" will play the "Sources" when the <AREA> is hovered over.
            (N.B.  Sources is non-standard.)
        New and Cool:
          If 'coords' is absent and the first word the "alt" or "title" is the azimuth/bearing of the landmark,
            (e.g. <area  alt='354 Pacifico Mtn'>)
            a 'rect' with a coords with correct X-values string is created
        /* */

      areaText = "";
        //  following are from Jim Fleming's landmark cardfile

        //  The panorama will start centered on the first area in the list
      areaText += "<area shape='rect' coords='2790, 203,  2832, 215'  alt='354 Pacifico Mtn'>";

      areaText += "<area shape='rect' coords='2940, 223,  2990, 236'  alt='005 Mt Hillyer'>";
      areaText += "<area shape='rectangle' coords='3065, 230,  3100, 245'  alt='014 Bare Mtn'>";
      areaText += "<area shape='POLYgon' coords='3285,305, 3060,290, 3060,270, 3285,285'  alt='022 Lower Chilao CG'>";
      areaText += "<area shape='rect' coords='3355, 235,  3404, 249'  alt='036 Winston Ridge'>";
      areaText += "<area shape='rect' coords='3455, 225,  3512, 243'  alt='043 Pleasant View Ridge'>";
      areaText += "<area shape='rect' coords='3645, 212,  3730, 235'  alt='059 Waterman Mtn'>";
      areaText += "<area shape='rect' coords='3675, 265,  3755, 290'  alt='060 Mt Mooney'>";
      areaText += "<area shape='POLY' coords='3788,242, 3808,242, 3798,255'  alt='067 Dawson Saddle'>";
      areaText += "<area shape='rect' coords='3879, 225,  3915, 241'  alt='074 Twin Peaks (West Peak)'>";
      areaText += "<area shape='rect' coords='3986, 250,  4005, 260'  alt='082 South Mt Hawkins'>";
      areaText += "<area shape='rect' coords='4005, 249,  4019, 259'  alt='084 Pine Mtn'>";
      areaText += "<area shape='rect' coords='4021, 247,  4041, 257'  alt='085 Dawson Peak'>";
      areaText += "<area shape='rect' coords='4080, 245,  4108, 255'  alt='088 Mt San Antonio'>";
      areaText += "<area shape='rect' coords='4085, 255,  4110, 265'  alt='089 Iron Mtn (Big Iron)'>";
      areaText += "<area shape='rect' coords='4150, 255,  4170, 265'  alt='093 Telegraph Peak'>";
      areaText += "<area shape='rect' coords='4178, 257,  4197, 268'  alt='095 Timber Mtn'>";
      areaText += "<area shape='rect' coords='4525, 285,  4560, 298'  alt='123 Pine Mtn (Front Range)'>";

          //  overlap of pano image either side of 180.  Should have overlapped at 0?  Next time?
          //  pano overlaps ~145 deg to ~199 deg but the imagemap coords are in pixels,
          //    (0:
          //    so need to duplicate <AREA>s in this range by adding PX360 (=4845) to AZ coords
      areaText += "<area shape='rect' coords='  10, 237,    45, 251'  alt='146 Monrovia Peak'>";
      areaText += "<area shape='rect' coords='4855, 260,  4890, 275'  alt='146 Monrovia Peak'>";
      areaText += "<area shape='rect' coords=' 230, 249,   258, 263'  alt='162 Clamshell Peak'>";
      areaText += "<area shape='rect' coords='5075, 267,  5103, 280'  alt='162 Clamshell Peak'>";
      areaText += "<area shape='rect' coords=' 275, 255,   305, 271'  alt='166 Mt Sally'>";
      areaText += "<area shape='rect' coords='5120, 270,  5150, 285'  alt='166 Mt Sally'>";
      areaText += "<area shape='rect' coords=' 670, 210,   785, 225'  alt='194 Mt Wilson'>";
      areaText += "<area shape='rect' coords='5515, 210,  5577, 225'  alt='194 Mt Wilson'>";    // R=5577 is rh edge of pano pic
      areaText += "<area shape='RECT' coords=' 540, 295,   580, 310'  alt='185 Shortcut Saddle (on ACH)'>";
      areaText += "<area shape='RECT' coords='5385, 295,  5425, 310'  alt='185 Shortcut Saddle (on ACH)'>";

      areaText += "<area shape='rect' coords=' 912, 208,   940, 221'  alt='213 Occidental Peak'>";
      areaText += "<area shape='rect' coords='1024, 207,  1044, 219'  alt='221 Mt Markham'>";
      areaText += "<area shape='rect' coords='1055, 195,  1095, 210'  alt='224 San Gabriel Peak'>";
      areaText += "<area shape='rect' coords='1116, 201,  1153, 216'  alt='228 Mt Disappointment'>";
      areaText += "<area shape='rect' coords='1173, 204,  1220, 217'  alt='233 Mt Deception'>";
      areaText += "<area shape='rect' coords='1239, 221,  1320, 239'  alt='238 Barley Flats'>";
      areaText += "<area shape='rect' coords='1325, 200,  1355, 215'  alt='244 Mt Lawlor'>";
      areaText += "<area shape='rect' coords='1385, 215,  1430, 230'  alt='248 Lawlor-Strawberry Saddle'>";
      areaText += "<area shape='rect' coords='1500, 195,  1525, 210'  alt='256 Strawberry Peak'>";
      areaText += "<area shape='rect' coords='1560, 208,  1587, 220'  alt='260 Josephine Peak'>";
      areaText += "<area shape='rect' coords='1645, 218,  1700, 228'  alt='269 Yerba Buena Ridge'>";
      areaText += "<area shape='rect' coords='1733, 212,  1755, 223'  alt='274 Fox Mtn'>";
      areaText += "<area shape='rect' coords='1774, 206,  1796, 216'  alt='277 Condor Peak'>";
      areaText += "<area shape='rect' coords='1862, 204,  1894, 214'  alt='285 Iron Mtn (near Condor Peak)'>";
      areaText += "<area shape='rect' coords='2080, 195,  2110, 210'  alt='300 Mt Gleason'>";
      areaText += "<area shape='rect' coords='2426, 201,  2473, 216'  alt='327 Roundtop'>";
      areaText += "<area shape='rect' coords='2497, 201,  2545, 214'  alt='332 Granite Mtn'>";
      areaText += "<area shape='rect' coords='2601, 263,  2644, 286'  alt='340 Loomis Ranch'>";
      //  FIRST!  areaText += "<area shape='rect' coords='2790, 203,  2832, 215'  alt='354 Pacifico Mtn'>";
      areaText += "<area shape='rect' coords='2810, 251,  2866, 267'  alt='356 Upper Chilao Flat - Fire Stn'>";
        //  recentest (2016) adds
      areaText += "<area shape='RECT'  coords='4072, 268,  4096, 281'  alt='089 Devil Peak'>";
      areaText += "<area shape='RECT'  coords='4163, 278,  4189, 289'  alt='095 Rattlesnake Peak'>";
      //  in overlap. see above.   areaText += "<area shape='RECT'  coords='567, 289,  606, 303'  alt='185 Shortcut Saddle (on ACH)'>";
      areaText += "<area shape='RECT'  coords='984, 216,  1007, 228'  alt='220 Eaton Saddle'>";
      areaText += "<area shape='RECT'  coords='1621, 214,  1641, 225'  alt='265 Santa Susana Pass'>";
      areaText += "<area shape='RECT'  coords='1701, 213,  1721, 224'  alt='272 Oat Mountain'>";
      areaText += "<area shape='RECT'  coords='1829, 205,  1850, 217'  alt='281 Mendenhall Peak'>";
      areaText += "<area shape='RECT'  coords='2151, 230,  2180, 241'  alt='306 Iron Mountain (above Monte Cristo)'>";
      areaText += "<area shape='RECT'  coords='2279, 222,  2299, 233'  alt='315 Rabbit Peak'>";
          //  above are from Jim Fleming's landmark cardfile

          //  below are a few likelys(?) and some messing
      areaText += "<area shape='circle' coords='3941, 286,    8'              title='078 Stoney Ridge Observatory'>";
      areaText += "<area shape='poly' coords='830,298, 783,296, 786,312'      title='204 Upper Big Tujunga Canyon Road Turnoff'>";
      areaText += "<area shape='rect' coords='4580, 445,  4640, 465'          title='129 (shhh!  secret hideout)'>";

          //  and some others that include "media" other than 'cards'
          //  this is a movie of a Sheriffs chopper taking off from the bugout pad
          //  (the usual usage would be href=someMedia.url, but where to play it?  Too tricky in this mess.
          //    so use the NON-STANDARD "Sources" attribute to point to the file.)
      areaText += "<area shape='poly' coords='1338,401, 1275,411, 1267,424, 1282,435, 1360,434, 1407,420, 1380,397'" +
                     " type=' video/mp4; video/ogg'   Sources=' Vetter/SetL/Helo.mp4; SetL/Helo.ogg'" +
                     " title='244 To Bug-Out from!'  >";

          //  this pops a pic (hence the alt text) when clicked, AND plays a sound when hovered.  (Also, alt <> title; just for S + G)
      areaText += "<area shape='rect' coords='2350, 379,  2425, 420'  alt='322 Roscoe lives here' title='Carefull where you step!'" +
                     " type='audio/mpeg'  Sources='Vetter/SetL/Rattler.mp3'>";


          /*  test various <AREA> shortcuts and errors
      areaText += "<area  coords=''                                 title='350 Empty coords'>";    //  FF/Chrome OK - makes 'coords'.  Edge/IE FAIL => (0,0,0,0)
      areaText += "<area                                            title='355 No coords'>";       //  FF/Chrome/Edge/IE  OK - makes 'coords'
      areaText += "<area                                            title='    No coords'>";       //  FAIL - not alt/title='AZ some text'
      areaText += "<area  shape='grabage' coords='100,50, 200,100'  title='340 bad shape'>";       //  FF/Chrome FAIL - bad 'shape'.  Edge/IE => 'rect'
      areaText += "<area  shape='rect' coords='100,50, 200,100'>";                                 //  FAIL - no 'title' or 'alt'
      areaText += "<area  shape='rect' coords='100,50, 200'         title='342 bad coords'>";      //  FF/Chrome FAIL - bad 'coords'.  Edge/IE => (x,x,x,0)
      areaText += "<area                                            title='5   No coords'>";       //  as above
      areaText += "<area  coords=''                                 title='010 Empty coords'>";    //  as above
          /*  test multiple video 'Sources'
      areaText += "<area " +
                     " type=' video/mp4; video/ogg'   Sources=' Vetter/SetL/HeloS.mp4; SetL/HeloS.ogg; '" +    //  N.B. one to many ';'s
                     " title='244 To Bug-Out from!'  >";
          /* */
/* */

          /*  messing
      areaText += "<area shape='poly'"+
                  "  coords='4334,374,4346,428,4384,395,4369,438,4421,443,4386,458,4400,495,4359,470,"+
                            "4348,499,4325,474,4290,497,4301,473,4249,468,4295,455,4257,434,4310,439,"+
                            "4287,392,4328,432'               title='107 Spotted! Black Beauty!'>";
      areaText += "<area shape='circle' coords='4335, 454,  42'   title='107 Spotted! Black Beauty!'"+
                  "  href='javascript:alert(\"107 Black Beauty! Spotted!\");'>"
          /* */

      //  create the <MAP> element.
    idMap = document.createElement("MAP");                 //  to contain the <AREA>s
    idMap.name = "Map";                                   //  name used in "usemap"
    idMap.id    = "idMap";                                 //  #id used to find <AREA>a
    idMap.innerHTML = areaText;                            //  put the <AREA>s inside
                                                           //  now they're individually processable
/// bugln("\n  LoadSite");
/// branch(idMap);

    FinishLoad();

    break;
    }    //  case siteNames[VETTER]:


    case siteNames[SLIDE]: {    //=========================================================================

      //  Headers
    byId("idH1").innerHTML = siteLabels[SLIDE];            //  Title
    byId("idH2").innerHTML = "Landmark Trainer";           //  Porpoise
    byId("idH3").style.display = "none";                   //  or innerHTML = "A Third Header";

    cardsPath = "Slide/Cards/";                           //  set defaults for paths & exts to files
    cardsExt  = ".jpg";                                    //  N.B. the '/'s and the '.'
    /// mediaPath = "SetL/";                                   //  explicitify it in "Sources"

      //  panorama-image-dependant pixel-to-azimuth/bearing values
      //    "Pano/Slide.jpg" => [5218 x 500]
      //    Overlaps ~[0: 960] & ~[4240: 5218] pxls => [~108: ~191] deg
    PX0   = 2960;    //  pxl loc at ~0 deg Az.     N.B. "Pano/Slide.jpg" IMG ONLY !!!!!!!
    PX360 = 4241;    //  num pxls in 360 deg
    PXALL = 5218;    //  width of pano

      //  start the panorama <IMG> load early.  attach the <MAP> to it after the <MAP> has been created
    byId("imgPano").width = PXALL;
    byId("imgPano").src = "Slide/Pano/Slide.jpg";           // PANOrama, centered at 0 az, 500 pxls High, Sharpened

    if(true) {                                               //  if there's xtra stuff, this is a good place.
      byId("idXtraLink").innerHTML = "Interesting Slide links";
      byId("idXtraLink").href      = "Slide/Links/SlideLinks.html";
      byId("idXtraLink").title     = "Opens in a new tab";
      }
     else
      byId("idXtraLink").style.display = "none";             //-else- hide it

    byId("idThanks").innerHTML = "Info cards courtesy ANFFLA Slide Mountain Lookout Kevin Johnson";

    byId("idSched").href="http://www.anffla.org/members/";   /// slide-mountain-schedule/";


        /*
        Below is a list of the <AREA>s that populate the <MAP>
        Minimum input for the <AREA>s with a pop-up image ('card') is "shape", "coords" and "alt" fields.
        "Alt" text is assumed to be the path to a pic to pop into #Cards when the area is clicked.
          (filename = cardsPath + alt + cardsExt)
        Bonus:
          "Shapes" only need the first four letters correct; 'circ', 'CIRC, 'circus', 'circular' all resolve to 'circle'.
          "Title"s can be set for <AREA>s with or without pix, to show when hovering.
          A "type" of "video/mp4" will show the movie specified in "Sources", instead of a pic.
          A "type" of "audio/mpeg" will play the "Sources" when the <AREA> is hovered over.
            (N.B.  Sources is non-standard.)
        New and Cool:
          If 'coords' is absent and the first word the "alt" or "title" is the azimuth/bearing of the landmark,
            (e.g. <area  alt='354 Pacifico Mtn'>)
            a 'rect' with a coords with correct X-values string is created
        /* */

      areaText = "";
        //  following are from Kevin Johnson's landmark cardfile

        //  The panorama will start centered on the first area in the list
      areaText += "<area shape='rect' coords='2789, 304, 2829, 289'  alt='349 Smokey Bear Interchange'>";

      areaText += "<area shape='rect' coords='3062, 337, 3102, 322'  alt='009 West Fork Liebre Gulch'>";
      areaText += "<area shape='rect' coords='3197, 263, 3237, 248'  alt='021 Bald Mountain'>";
      areaText += "<area shape='rect' coords='3257, 382, 3297, 367'  alt='027 Vista del Lago Heliport'>";
      areaText += "<area shape='rect' coords='3301, 340, 3341, 325'  alt='027 Liebre Gulch (Proper)'>";
      areaText += "<area shape='rect' coords='3258, 310, 3298, 295'  alt='028 Liebre Gulch Bridge'>";
      areaText += "<area shape='rect' coords='3562, 239, 3602, 224'    title='048 Liebre Mountain'>";
      areaText += "<area shape='rect' coords='3513, 350, 3553, 335'  alt='050 Posey Canyon'>";
      areaText += "<area shape='rect' coords='3607, 284, 3647, 269'  alt='058 Reservoir Summit'>";
      areaText += "<area shape='rect' coords='3800, 252, 3840, 237'  alt='073 Burnt Peak'>";
      areaText += "<area shape='rect' coords='3902, 260, 3942, 245'  alt='081 Sawtooth Mountain'>";
      areaText += "<area shape='rect' coords='3853, 264, 3893, 249'  alt='083 Redrock Mountain'>";
      areaText += "<area shape='rect' coords='3769, 387, 3809, 372'  alt='087 Cherry Canyon'>";
      areaText += "<area shape='rect' coords='3966, 340, 4006, 325'  alt='100 Osito Canyon'>";
      areaText += "<area shape='rect' coords='3966, 474, 3968, 469'    title='100 Frenchmans Flat'>";  //  N.B. no "'"s in filenames etc.
      areaText += "<area shape='rect' coords='4167, 265, 4207, 250'  alt='101 Warm Springs Mountain'>";

        //  Panorama overlaps ~[0: 960] & ~[4240: 5218] pxls => [~108: ~191] deg
        //  so duplicate these by adding PX360=4241 to each X-coord
        //    usually the Y-coord has to be adjusted, too.
      areaText += "<area shape='rect' coords='4239, 252, 4279, 237'    title='110 Mount Baldy'>";
      areaText += "<area shape='rect' coords='  -2, 182,   39, 167'    title='110 Mount Baldy'>";
      areaText += "<area shape='rect' coords='185, 191, 225, 176'    alt='126 Mount Wilson'>";
      areaText += "<area shape='rect' coords='4428, 254, 4468, 239'  alt='126 Mount Wilson'>";
      areaText += "<area shape='rect' coords='238, 192, 278, 177'    alt='130 Mount Lukens'>";
      areaText += "<area shape='rect' coords='4482, 258, 4522, 243'  alt='130 Mount Lukens'>";
      areaText += "<area shape='rect' coords=' 313, 221,  353, 206'  alt='135 Townsend Peak'>";
      areaText += "<area shape='rect' coords='4554, 282, 4594, 267'  alt='135 Townsend Peak'>";
      areaText += "<area shape='rect' coords=' 273, 196,  313, 181'  alt='138 Contract Point'>";
      areaText += "<area shape='rect' coords='4517, 261, 4557, 246'  alt='138 Contract Point'>";
      areaText += "<area shape='poly' coords=' 365, 202,  351, 218,  379, 218'   title='139 Slide Mountain Helicopter Pad'>";
      areaText += "<area shape='poly' coords='4602, 268, 4588, 284, 4616, 284'   title='139 Slide Mountain Helicopter Pad'>";
      areaText += "<area shape='rect' coords=' 491, 212,  531, 197'  alt='148 Whitaker Peak'>";
      areaText += "<area shape='rect' coords='4744, 267, 4784, 252'  alt='148 Whitaker Peak'>";
      areaText += "<area shape='rect' coords=' 395, 216,  484, 203'    title='    Whitaker Ridge'>";
      areaText += "<area shape='rect' coords=' 539, 214,  598, 202'    title='    Whitaker Ridge'>";
      areaText += "<area shape='rect' coords='4633, 272, 4736, 259'    title='    Whitaker Ridge'>";
      areaText += "<area shape='rect' coords='4789, 268, 4859, 254'    title='    Whitaker Ridge'>";
      areaText += "<area shape='rect' coords=' 752, 242,  792, 227'  alt='171 Lake Piru'>";
      areaText += "<area shape='rect' coords='5004, 297, 5054, 282'  alt='171 Lake Piru'>";

      areaText += "<area shape='rect' coords='1668, 174, 1708, 159'  alt='252 Cobblestone Mountain'>";
      areaText += "<area shape='rect' coords='1777, 192, 1817, 177'  alt='260 Dome Mountain'>";
      areaText += "<area shape='rect' coords='2052, 200, 2092, 185'  alt='284 Alamo Mountain'>";
      areaText += "<area shape='rect' coords='2088, 201, 2128, 186'  alt='287 Black Mountain'>";
      areaText += "<area shape='rect' coords='2381, 292, 2421, 277'  alt='312 Hard Luck Campground'>";
      areaText += "<area shape='rect' coords='2378, 228, 2418, 213'  alt='313 Frazier Mountain'>";
      areaText += "<area shape='rect' coords='2660, 285, 2700, 270'  alt='334 Freeman Canyon (at Kinsey Ranch)'>";
      areaText += "<area shape='rect' coords='2795, 318, 2835, 303'  alt='346 Coyote Canyon'>";
      areaText += "<area shape='rect' coords='2886, 317, 2926, 302'  alt='355 Apple Canyon'>";
          //  above are from Kevin Johnson's landmark cardfile


          //  below are a few likelys (not yet) and some messing
       areaText += "<area shape='circle'  coords='119, 189,  6'  alt='119 Dragonfly (Not always there.)'>";


      //  create the <MAP> element.
    idMap = document.createElement("MAP");                 //  to contain the <AREA>s
    idMap.name = "Map";                                    //  name used in "usemap"
    idMap.id    = "idMap";                                 //  #id used to find <AREA>a
    idMap.innerHTML = areaText;                            //  put the <AREA>s inside
/// bugln("\n  LoadSite:");
/// branch(idMap);

    FinishLoad();

    break;
    }    //  case siteNames[SLIDE]:


  default: {    //  =======================================================================
    LOG("\n! Error:  LoadSite():switch(site): site = "+ site);
    HandleShowText(true);
    }

  }    //  switch( site )

}    //  function LoadSite(site)



//==================================================================================================
function FinishLoad() {                                    //  after <BODY> loads, load <MAP>

bush(false);
  LOG();    //  stet

/// bugln("\n  FinishLoad in:");
/// branch(idMap);

    //  firefox and its caching! sheesh
  byId("idTextOut").value = "          New Landmark data are shown here \n" +
                            "          (You may have to copy/paste this stuff into your email)";

    //  add some useful attribs to the <AREA>s
  let areas = idMap.children;
/// bugln("  areas.length=", areas.length);
  let k=0, len = areas.length;

K_LOOP:                                          //  200+ lines of awesomeness!!!
  while(k < areas.length) {                      //  length might change
    if(len != areas.length) {
bugln("\n  k=",k," len=",len, " a.len=",areas.length);
      len = areas.length;
      }
    let  x=0;
      /*    ///
      bugln("\n  K_LOOP:");
      bugln(k +": "+ areas[k].value);
      bugln(k +": <"+ areas[k].shape +" N="+ areas[k].attributes.length +"> alt='"+ areas[k].alt +"' type='"+ areas[k].type +"'");
      for(let i=0, ilen=areas[k].attributes.length; i<ilen; i++)
        bug("  (", i +": '"+ areas[k].attributes[i].nodeName +"': '"+ areas[k].attributes[i].value +"')");
      bugln();
      /*   */
/// bug( k, ": ");
/// branch(areas[k]);
/// bugln("  k=", k, "  alt=", areas[k].alt, "  shape=", areas[k].shape, "  coords=", areas[k].coords);


      //  setup "alt"s and "title"s for display and hinting, and check that things look OK
      //    "alt"s are used here to name 'cards' pix to popup when the <AREA> is clicked.
      //    "title"s are shown when hovered (tooltip)
      //      elts w/out "title"s get their "alt" text
      //    "title"s have to be erased when not 'hinting', so they're saved in "hintTitle".  N.B. "hintTitle" is NON-STANDARD.
bush(false);
if(BUG)bugln("\n    AREA["+ k +"] "+ area2Str(areas[k]));
    if(null == areas[k].getAttribute("alt")) {                       //  no "alt"
      bug(" null=alt");
      areas[k].setAttribute("alt", "");
      }
    bug("  alt='", areas[k].alt, "'");
    if(null == areas[k].getAttribute("title")) {                     //  no "title".
      bug(" null=title");
      areas[k].setAttribute("title",   areas[k].getAttribute("alt"));    //  give it one.
      }
    bug("  title='", areas[k].title, "'");
    if("" != areas[k].getAttribute("title")) {                       //  has something in "title"
      bug(" ''!=title");
      areas[k].setAttribute("hintTitle", areas[k].getAttribute("title"));    //  save for hinting.  N.B. "hintTitle" is NON-STANDARD.
      }
     else {
LOG("! Removing <AREA> "+ k +": "+ area2Str(areas[k]) +"  Needs an 'ALT' and/or 'TITLE' (else1)");    //  something's wrong.
      idMap.removeChild(areas[k]);
      HandleShowText(true);
      continue  K_LOOP;
      }
    if(BUG)bug("  hintTitle='", areas[k].getAttribute("hintTitle"), "'");
    if(BUG)bugln("   alt='", areas[k].alt, "'  title='", areas[k].title, "'  hT='", areas[k].getAttribute("hintTitle"), "'");
    if(! ShowHints)                                                  //  buuut ...
      areas[k].setAttribute("title", "");                            //  => how to turn off tooltip
bush();


bush(false);
      //  test that "coords='coord string'" exists.
      //    if not try to parse 'alt'/title' string to get AZ, and create a 'coord string'
    if((null == areas[k].coords) || ("" == areas[k].coords)) {       //  ad hoc <AREA>?  try to create
      LOG("? For <AREA> "+ k +": "+ area2Str(areas[k]) +", 'COORDS'='"+ areas[k].coords +"' ...");
      let at = "";
      bug("  let at='"+ at +"'");
      if("" != areas[k].alt) {                                       //  prefer 'alt'
        at = areas[k].alt;
        bug("  AT = alt = '", at, "'");
        }
       else if("" != areas[k].getAttribute("hintTitle")) {           //  'hintTitle' as fallback
        at = areas[k].getAttribute("hintTitle");
        bug("  AT = hintTitle = '", at, "'");
        }
       else  {                                   //  no 'alt' nor 'title'.  how'd we get here?
        LOG("! Removing <AREA> "+ k +": "+ area2Str(areas[k]) +"  Needs an 'ALT' and/or 'TITLE' (else2)");
        idMap.removeChild(areas[k]);
        HandleShowText(true);
        continue  K_LOOP;
        }
      if("" == at) {                             //  empty 'alt' and/or 'title'?  Really?  How did we get here?
        LOG("! Removing <AREA> "+ k +": "+ area2Str(areas[k]) +"  Needs an 'ALT' and/or 'TITLE' (''==at)");
        idMap.removeChild(areas[k]);
        HandleShowText(true);
        continue  K_LOOP;
        }
      let A = at.trim().split(" ");              //  try to extract the bearing value
      bugln("  A='", A, "'", "   A[0]='", A[0], "'");    //  which should be the first word
      if(isNaN(A[0])) {
        LOG("! Removing <AREA> "+ k +": "+ area2Str(areas[k]) +"  AT='", at, "' doesn't conform to 'AZ  some description text'");
        idMap.removeChild(areas[k]);
        HandleShowText(true);
        continue  K_LOOP;
        }
      let az = Number(A[0]);                     //  assume at = "Az  some description text", so Az => A[0]
      x  = Math.floor(az*PX360/360) + PX0;       //  Az to X
      if(PX360 < x)
        x -= PX360;
      if((0 < x) && (x < PXALL)) {               //  X fits in pano
        areas[k].shape  = "rect";
        areas[k].coords = LTRB(x-20, 5, x+20, 20);    //  floating above nominal bearing position
        }
       else {
        LOG("! Removing <AREA> "+ k +": "+ area2Str(areas[k]) +"  AT='", at, "' (x=", x, ") doesn't conform to 'AZ  some description text'");
        idMap.removeChild(areas[k]);
        HandleShowText(true);
        continue  K_LOOP;
        }
        //  we made it.  Fix it up
      LOG("    Fixed as "+ area2Str(areas[k]));
      HandleShowText(true);
      }    //  if((null == areas[k].coords) || ("" == areas[k].coords))
bush();


bush(false);
      //  'type' indicates there's extra media for this <AREA>.
    let type = areas[k].getAttribute("type");
    if(null != type) {
        //  create the <SOURCE> elements for <AUDIO> and <VIDEO> tags
      if("audio" == type.trim().substr(0,5).toLowerCase()) {
        let elt  = document.createElement("SOURCE");     ///  multiple sources here, too ???
        elt.src  = areas[k].getAttribute("Sources");     //  don't know how to test this.  just trust.
        elt.type = "audio";    ///  was type;
        byId("Sounder").appendChild(elt);
        }
       else if("video" == type.trim().substr(0,5).toLowerCase()) {
        let Types = type.split(";");
        bugln("  Types='", Types, "'");
        let Srcs = areas[k].getAttribute("Sources").trim().split(";");
        bugln("  Srcs='", Srcs, "'");
        let srcs = "";
        for(let i=0; i<Math.min(Types.length, Srcs.length); i++) {    // min if e.g. Types='a; b;' (<- ';') and Srcs='a.aaa; b.bbb' (<- no ';')
          if(("" == Types[i]) || ("" == Srcs[i]))
            continue;
          byId("Movie").removeAttribute("autoplay");         //  Firefox autoplays when 'served' sometimes
          srcs += "<SOURCE type='"+ Types[i].trim() +"' src='"+ Srcs[i].trim() +"'>";
          }
        /// branch(byId("Movie"));
        areas[k].setAttribute("type", "video");              //  all we need anymore
        areas[k].setAttribute("Sources", srcs);              //  N.B.  "Sources" in NON-STANDARD
        if(BUG)bugln("  Srcs='", areas[k].getAttribute("Sources"), "'");
        }
       else {                                    //  unknown 'type'.  assume it's a <AREA  alt='brg description'>
        LOG("! FinishLoad(): AREA["+k+"] 'TYPE'='"+ type +"' ...");
        HandleShowText(true);
        }    //  else (type)
      }    //  if(null != type)
bush();

      //  standardize shapes
      //    FF & Chrome recognize 4-letter 'shape' names and allow (re-)capitilization
      //    Edge forces 'rect', 'circle', and 'poly' (sometimes !?)
      //    TODO  check edge and IE?
      //  and
      //  trivial check for correct-ish 'coords'
      //  prepare a permutation vector of <AREA>s indices sorted by X-coordinate so BrgBtns can cycle through areas
    let   C = areas[k].coords.split(",");
    let s4L = areas[k].shape.trim().substr(0,4).toLowerCase();        //  1st 4 non-white chars, lower case
/// branch(areas[k]);
/// bugln("  k=", k, "  alt=", areas[k].alt, "  shape=", areas[k].shape, " => ", s4L);
/// branch(areas[k]);
    switch(s4L) {
      case "rect":
        areas[k].shape = "rect";
          //  ensure coords are (left, top, right, bottom).  SOME browsers notice!
        /// bug("  coords["+k+"]="+ areas[k].coords);
        if(4 != C.length) {
          LOG("! Removing <AREA> "+ k +": "+ area2Str(areas[k]) +"  COORDS='", areas[k].coords, "' don\'t work with shape='rect'.");
          idMap.removeChild(areas[k]);
          HandleShowText(true);
          continue  K_LOOP;
          }
        areas[k].coords = LTRB2str( LTRB(areas[k].coords) );    //  LTRB, get it?
        /// bugln("  =>  "+ areas[k].coords);
        x = Math.floor((Number(C[0]) + Number(C[2]))/2);
        break;
      case "circ":
        if(3 != C.length) {
          LOG("! Removing <AREA> "+ k +": "+ area2Str(areas[k]) +"  COORDS='", areas[k].coords, "' don\'t work with shape='circle'.");
          idMap.removeChild(areas[k]);
          HandleShowText(true);
          continue  K_LOOP;
          }
        areas[k].shape = "circle";
        x = C[0];
        break;
      case "poly":
        if((C.length <= 5) || (Math.floor(C.length/2)*2 != C.length)) {    //  less than 3 pts, or odd number [x,y, x,y, ... x]
          LOG("! Removing <AREA> "+ k +": "+ area2Str(areas[k]) +"  COORDS='", areas[k].coords, "' don\'t work with shape='poly'.");
          idMap.removeChild(areas[k]);
          HandleShowText(true);
          continue  K_LOOP;
          }
        areas[k].shape = "poly";
        let xn=666666, xx=0;
        for(let i=0; i<C.length; i+=2) {
          xn = Math.min(xn, Number(C[i]));  xx = Math.max(xx, Number(C[i]));  }
        x = Math.floor((xn + xx)/2);
        break;
      default: {
        LOG("! Removing <AREA> "+ k +": "+ area2Str(areas[k]) +"  'SHAPE='", areas[k].shape, "' not one of 'rect', 'circle' or 'poly'.");
        idMap.removeChild(areas[k]);
        HandleShowText(true);
        continue  K_LOOP;
        }
      }    //  switch(s4l)
    areas[k].setAttribute("x", x);                         //  mean(x)   N.B.  NON-STANDARD

      //  areaXK (= [X*1000 + k]) when done, subtract X*1000 to get X-sorted k's
    areaXK[k] = x*1000 + k;                                //  will be in sorted X-order. 1000 areas should be enough???

      //  setup event handlers
    SetupAreaEvents(areas[k]);

/// bugln("    end of loop k=", k);
    k++;
    }    //  K_LOOP:  while(k < areas.length)       Finally!  Almost done!
/// bugln("  areas.length=", areas.length);
/// bugln("\n  FinishLoad post-K_LOOP");
/// branch(idMap);


    //  sort areaXK and extract the permutated vector
  bush(false);
  bugln("  areaXK.length=", areaXK.length);
  areaXK.sort(function(a, b){return a-b;});                //  sort in-place on area X-coord (defaults to ALPHA !?!?)
  ///??? OR areas.sort(function(a, b){return Number(a.getAttribute("x")) - Number(b.getAttribute("x"));}); ???
  for(let x2k=0, len=areas.length; x2k<len; x2k++) {
    let xk = areaXK[x2k];                                  //  still [x*1000 + k]
    let xx =  Math.floor(xk/1000);                         //  original x
    let k = xk - xx*1000;                                  //  remove x*1000 to get X-sorted index
    if((k < 0) || (len <= k)) bugln("! k=", k, " x2k=", x2k, " len=", len, " areaXK=", areaXK[x2k]);
    areaXK[x2k] = xx;                                      //  re-porpoise as sorted X
    areaX2K[x2k] = k;                                      //  X-sorted order -> area input order
      //  the <AREA> doesn't know its original order.  save its sorted order to keep BrgBtnNdx current
    bug("  XK: x2k=", x2k, " k=", k, "  xk=", xk);
    /// bugln("  ", area2Str(areas[k]));
    areas[k].setAttribute("x2k", x2k);                         //  input order -> sorted    N.B.  NON-STANDARD
    }
  bugln("  XK=", areaXK);
  bugln("  X2K=", areaX2K);
  bush();

    //  find "X2K"-index of first area whose bearing > 0 deg
  X2KNorthish = areaXK.findIndex( function (x) { return PX0 < x; } );
    bush(false);
    bugln("  PX0=", PX0, " X2KNorthish=", X2KNorthish, " => ", areaX2K[X2KNorthish]);
    bugln(" => ", area2Str(areas[areaX2K[X2KNorthish]]));
    if(BUG)bugln("  branch=");
      if(BUG)branch(areas[areaX2K[X2KNorthish]]);
    bush();

  document.body.appendChild(idMap);                        //  NOW add it to the page.  why???

  byId("imgPano").setAttribute("usemap", "#Map");          //  attach the <MAP> to the panorama image

/*
bugln("\n  FinishLoad XK");
branch(idMap);
bugln("\n  FinishLoad tree");
tree(idMap);
bugln("\n  FinishLoad imgPano");
tree(byId("imgPano"));
/* */

  byId("idModTime").innerHTML = "Last modified:"+ document.lastModified;

bush();
}    //  function FinishLoad()

//  hide all this crap if no-scripts  -->

