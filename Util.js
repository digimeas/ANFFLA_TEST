// <!--    hide all this crap if no-scripts

//==================================================================================================
function byId(e)    { return document.getElementById(e); }
function byClass(e) { return document.getElementsByClassName(e); }

/// function idNum(id, a) { return Number(byId(id).getAttribute(a)); }
/// function  aNum( e, a) { return Number(e.getAttribute(a)); }

var BUG = true;
var bugElt = true,  bugConsole = false;
var bugStr="";
var BUGWhere = "";    //  byId("idTextOut");
function bug() {
  if(! BUG) return;
  let bw;  if("" == BUGWhere) bw = byId("idTextOut"); else bw = BUGWhere;
  for(let i=0, l=arguments.length; i<l; i++) {
    if(bugElt) {
      ///??? bw.innerHTML += arguments[i];                    //  write immediately to #idTextOut
      bw.value += arguments[i];                    //  write immediately to #idTextOut
      }
    if(bugConsole)
      bugStr += arguments[i];                          //  accumulate for a bugln() to console.log()
    }
  /// let bs=bugStr;
}
function bugln()  {
  if(! BUG) return;
  bug.apply(this, arguments);
  if(bugElt) {
    let bw;  if("" == BUGWhere) bw = byId("idTextOut"); else bw = BUGWhere;
    ///??? bw.innerHTML += "\n";
    bw.value += "\n";
    if(undefined != bw.scrollTop)
      bw.scrollTop += bw.scrollHeight;                   //  scroll to bottom
    }
  if(bugConsole)
    console.log(bugStr);
  bugStr = "";
}

function LOG()  {
  BUG = true;
  bugln.apply(this, arguments);
  BUG = false;
}

var bugWas = [];
function bush(tf) {
  if(undefined != tf) { bugWas.push(BUG);  BUG = tf; }
   else               { BUG = bugWas.pop(); }
}


//==================================================================================================
function doInit() {
  let Q = document.querySelectorAll("[initto]");
  for(let i=0; i<Q.length; i++) {
    let q = Q[i];
    let a = q.getAttribute("initto").trim();
    eval( " q."+ a +"; " );
    }
}


//==================================================================================================
function id(node) {                             //  what the heck is this?
  if(null == node)
    return "null";
  let str = node.tagName +":"+ node.id;
  return str;
}



var  treeIn="";
//==================================================================================================
function tree(elt) {
  if(! BUG)  return;
  let moms = new Array(66);
  let mom = elt.parentNode;
  let n = 0;
  do {                                           //  traverse the tree to root (trunk?)
/// bugln(mom.tagName);
    moms[n] = mom;
    n++;
    mom = mom.parentNode;
    } while("HTML" != mom.tagName.toUpperCase());
  bugln("\n<HTML>["+ document.children.length +"]");
  treeIn += "  ";
  for(let i=n-1; 0<=i; i--) {
    /// bugln(moms[i].tagName);
    mom = moms[i];
    bug(treeIn +"<"+ mom.tagName +">");
    let lk=mom.children.length;
    let la=0;  if(null != mom.attributes) la = mom.attributes.length;
    bug("[k "+ lk +": a "+ la +"]");
    for (let ia = 0; ia < la; ia++) {
      bug("  "+ mom.attributes[ia].name +":\""+ mom.attributes[ia].value +"\"");
      }
    bugln();
    treeIn += "  ";
    for (let ik = 0; ik < lk; ik++) {
      let kid = mom.children[ik];
      if(elt == kid)
        branch(elt);                   //  what we want to dump
       else
        leaf(kid);                     //  sibling/G*-aunt.  don't dump
      }
    bugln();
    treeIn += "  ";
    }
  /// branch(elt);
  treeIn = "";
}
//==================================================================================================
function leaf(node) {
  if(! BUG)  return;
  if("BR" == node.tagName.toUpperCase())
    bug(treeIn +"<BR>");
   else {
    bug(treeIn +"<"+ id(node) +"\">");
    let atts = node.attributes;
    let la = atts.length,  lk=node.children.length;
    /// bug(":"+ node.tagName);
    bugln("[k "+ lk +": a "+ la +"]");
    }
}
//==================================================================================================
function branch(node) {
  if(! BUG)  return;
  let la, lk, kids;
  switch(node.nodeType) {
    case 1:                                      //  element
    case 2:                                      //  attribite
      bug(treeIn +"<"+ id(node) +"\">");
      let atts = node.attributes;
      la = atts.length;  lk=node.children.length;
      /// bug(":"+ node.tagName);
      bug("[k "+ lk +": a "+ la +"]");
      for (let ia = 0; ia < la; ia++) {
        bug(" "+ node.attributes[ia].name +":\""+ node.attributes[ia].value +"\"");
        }
      if((undefined != node.value) && (null != node.value) && ("" != node.value)) {
        if(22 < node.value.length)
          bug("\n ");
        bug(" value:\""+ node.value  +"\"");
        }
      bugln();
      break;
    case 3:                                      //  text
    case 8:                                      //  comment
      let str =  node.nodeValue.trim();
      if(0 < str.length) {    //  don't print blank #texts/space fill
        bug(treeIn +"<"+ node.nodeName +":"+ node.nodeType +">");
        bug(str);
        bugln();
        }
      break;
    default:
    }    //  switch(node.nodeType)

  let  tiw=treeIn;
  treeIn += "  ";
  kids=node.childNodes;  lk=kids.length;
  for(let k=0; k<lk; k++) {
    branch(kids[k]);
    }
  treeIn = tiw;
}



//==================================================================================================
function getOffsets(elt) {
    //  find total left/top position offsets.  Why isn't there a 'elt.Left' & 'elt.Top'?
  let mom,  posBug=false;
  mom = elt;
  let left=0, top=0;
  while(null != mom) {                           //  until mom is the document root
    left += mom.offsetLeft;
    top += mom.offsetTop;
    if(posBug) {
      bug("  ", id(mom), "  osLeft=", mom.offsetLeft, " => ", left,
                        "    osTop=", mom.offsetTop,  " => ", top);
      bug("    cLeft=", mom.clientLeft, "  cTop=", mom.clientTop);
      bugln("    oMom=", id(mom.offsetParent));
      }
    mom = mom.offsetParent;
    }
  return {Left:left, Top:top};
}



//==================================================================================================
function DumpBrowserStuff(where) {
    where.innerHTML += "<br> <div id='divIBug'></div>";
    BUGWhere = where;
    BUGWhere.setAttribute("style", "color:#AA0000; min-height:30px;");
    bugln("<p>"+ document.URL +"</p>  <br><br>");

    bugln("<p>Browser CodeName: " + navigator.appCodeName + "</p>");
    bugln("<p>Browser Name: " + navigator.appName + "</p>");
    bugln("<p>Browser Version: " + navigator.appVersion + "</p>");
    /// bugln("<p>Cookies Enabled: " + navigator.cookieEnabled + "</p>");
    bugln("<p>Browser Language: " + navigator.language + "</p>");
    /// bugln("<p>Browser Online: " + navigator.onLine + "</p>");
    bugln("<p>Platform: " + navigator.platform + "</p>");
    bugln("<p>User-agent header: " + navigator.userAgent +  "</p>");
    bugln("<p>product: " + navigator.product + "</p>");
    /// bugln("<p>javaEnabled(): " + navigator.javaEnabled() + "</p>");
    bugln("<br>");
    ///  bugln("<p>IE: " + IE + "</p>");
    BUGWhere = "";
}



var Faders = [],  FADESTEP = 50;
//==================================================================================================
function FadeIn(FF,  fa, fs, fd,   FT) {        //  (FadeFunction,  attack, sustain, decay,  [FadeTarget])
  let  fo = new Object(),  t = FADESTEP;
  fo.A = fa/t;  fo.S = fs/t;  fo.D = fd/t;       //  a,s,d in milliseconds
  fo.a = fa/t;  fo.s = fs/t;  fo.d = fd/t;
  /// fo.t0 = new Date();  fo.t0 = fo.t0.getTime();
  fo.done = false;
  let f = setInterval(Fade, t,   FF, fo);        //  FF() souldn't need/use fo!?
  fo.f = f;                                      //  prob OK.  nobody needs f till later.
  Faders[f] = fo;
  if(undefined != FT)
    FT.setAttribute("FaderIndex", f);
  return f;
}
//==================================================================================================
function Fade(FF,  fo) {
  let p;
  if(0 < fo.a) {                       //  ATTACKING
    p = 1.0 - fo.a/fo.A;
    fo.a--;
    /// fo.ta = new Date();  fo.ta = fo.ta.getTime();     //  last a
    }
   else if(0 < fo.s) {                 //  ssssuuuuuusssstttaiiinniinnggg
    p = 1.0;
    fo.s--;
    /// fo.ts = new Date();  fo.ts = fo.ts.getTime();     //  last s
    }
   else if(0 < fo.d) {                 //  dcyng
    p = fo.d/fo.D;
    fo.d--;
    /// fo.td = new Date();  fo.td = fo.td.getTime();     //  last d
    }
   else {                              //  all done
    /// let now = new Date();  now = now.getTime();
    /// bugln("  clearing ", fo.f, "  now=", now, "  dt0=", now-fo.t0);    /// , "  dta=", now-fo.ta, " dts=", now-fo.ts, " dtd=", now-fo.td);
    clearInterval( fo.f );
    fo.done = true;
    p = 0.0;                           //  ensure it's put away
    }
  fo.p = Number( p );                  //  save 'p' in case of a FadeOut()
  FF( Number( p ) );
}
//==================================================================================================
function FadeOut(fo,  ft) {            //  (fade object, fade time for p=100%)
  /// bug("    FO: f=", [fo.a, fo.s, fo.d]);
  fo.a = 0;  fo.s = 0;                 //  no attack or sustain, just rapid decay
  fo.D = Math.floor(fo.p*ft / FADESTEP + .5);    //  we have p% of fade time to finish
  fo.d = Math.floor(fo.p*fo.D + .5);             //  and we're already p% there
}


//  hide all this crap if no-scripts  -->

