var MeiLib={};MeiLib.RuntimeError=function(e,t){this.errorcode=e;this.message=t};MeiLib.RuntimeError.prototype.toString=function(){return"MeiLib.RuntimeError: "+this.errorcode+": "+this.message?this.message:""};MeiLib.createPseudoUUID=function(){return("0000"+(Math.random()*Math.pow(36,4)<<0).toString(36)).substr(-4)};MeiLib.EventEnumerator=function(e){this.init(e)};MeiLib.EventEnumerator.prototype.init=function(e){if(!e)throw new MeiLib.RuntimeError("MeiLib.EventEnumerator.init():E01","node is null or undefined");this.node=e;this.next_evnt=null;this.EoI=true;this.children=$(this.node).children();this.i_next=-1;this.read_ahead()};MeiLib.EventEnumerator.prototype.nextEvent=function(){if(!this.EoI){var e=this.next_evnt;this.read_ahead();return e}throw new MeiLib.RuntimeError("MeiLib.LayerEnum:E01","End of Input.")};MeiLib.EventEnumerator.prototype.read_ahead=function(){if(this.beam_enumerator){if(!this.beam_enumerator.EoI){this.next_evnt=this.beam_enumerator.nextEvent();this.EoI=false}else{this.EoI=true;this.beam_enumerator=null;this.step_ahead()}}else{this.step_ahead()}};MeiLib.EventEnumerator.prototype.step_ahead=function(){++this.i_next;if(this.i_next<this.children.length){this.next_evnt=this.children[this.i_next];var e=$(this.next_evnt).prop("localName");if(e==="note"||e==="rest"||e==="mRest"||e==="chord"){this.EoI=false}else if(e==="beam"){this.beam_enumerator=new MeiLib.EventEnumerator(this.next_evnt);if(!this.beam_enumerator.EoI){this.next_evnt=this.beam_enumerator.nextEvent();this.EoI=false}else{this.EoI=true}}}else{this.EoI=true}};MeiLib.durationOf=function(e,t){IsSimpleEvent=function(e){return e==="note"||e==="rest"||e==="space"};var n=function(t,n){var r=$(e).attr("dur");if(!r)throw new MeiLib.RuntimeError("MeiLib.durationOf:E04","@dur of <note> or <rest> must be specified.");return MeiLib.dur2beats(Number(r),n)};var r=function(e,t,n){if(!n)n="1";var r=$(e).attr("dur");if(r)return MeiLib.dur2beats(Number(r),t);$(e).find("note").each(function(){lyr_n=$(this).attr("layer");if(!lyr_n||lyr_n===n){var e=$(this).attr("dur");if(!r&&e)r=e;else if(r&&r!=e)throw new MeiLib.RuntimeError("MeiLib.durationOf:E05","duration of <chord> is ambiguous.")}});if(r)return MeiLib.dur2beats(Number(r),t);throw new MeiLib.RuntimeError("MeiLib.durationOf:E06","@dur of chord must be specified either in <chord> or in at least one of its <note> elements.")};var i=function(e,t){var i=0;e.children().each(function(){var e;var s;var o=this.prop("localName");if(IsSimpleEvent(o)){e=n(this,t)}else if(o==="chord"){e=r(this,t)}else{throw new MeiLib.RuntimeError("MeiLib.durationOf:E03","Not supported element '"+o+"'")}i+=e});return i};var s=$(e).prop("localName");if(IsSimpleEvent(s)){return n(e,t)}else if(s==="mRest"){return t.count}else if(s==="chord"){return r(e,t)}else if(s==="beam"){return i(e,t)}else{throw new MeiLib.RuntimeError("MeiLib.durationOf:E05","Not supported element: '"+s+"'")}};MeiLib.tstamp2id=function(e,t,n){var r=Number(e);var i=0;var s=function(){return i+1};var o=function(){return r-s()};var u=new MeiLib.EventEnumerator(t);var a;var f;var l;var c;while(!u.EoI&&(f===undefined||f>0)){l=a;c=f;a=u.nextEvent();f=o();i+=MeiLib.durationOf(a,n)}if(f===undefined)return undefined;var h;if(f<0){if(l&&c<Math.abs(f)){h=l}else{h=a}}else{h=a}var p;p=$(h).attr("xml:id");if(!p){p=MeiLib.createPseudoUUID();$(h).attr("xml:id",p)}return p};MeiLib.tstamp2idInContext=function(e,t){var n;var r=false;for(var i=0;i<t.length&&!r;++i){Vex.LogDebug("<<<< Measure "+i+" >>>>");if(t[i].meter)n=t[i].meter;if(i===0&&!n)throw new MeiLib.RuntimeError("MeiLib.tstamp2id:E001","No time signature specified")}throw new MeiLib.RuntimeError("MeiLib.E002",'No event with xml:id="'+eventid+'" was found in the given MEI context.')};MeiLib.id2tstamp=function(e,t){var n;var r=false;for(var i=0;i<t.length&&!r;++i){Vex.LogDebug("<<<< Measure "+i+" >>>>");if(t[i].meter)n=t[i].meter;if(i===0&&!n)throw new MeiLib.RuntimeError("MeiLib.id2tstamp:E001","No time signature specified");var s=MeiLib.sumUpUntil(e,t[i].layer,n);if(s.found){r=true;return i.toString()+"m"+"+"+(s.beats+1).toString()}}throw new MeiLib.RuntimeError("MeiLib.id2tstamp:E002",'No event with xml:id="'+e+'" was found in the given MEI context.')};MeiLib.dur2beats=function(e,t){return t.unit/e};MeiLib.beats2dur=function(e,t){return t.unit/e};MeiLib.sumUpUntil=function(e,t,n){var r=function(t){var i=$(t);var s=i.prop("localName");if(s==="note"||s==="rest"){if(i.attr("xml:id")===e){return{beats:0,found:true}}else{var o=Number(i.attr("dur"));if(!o)throw new MeiLib.RuntimeError("MeiLib.sumUpUntil:E001","Duration is not a number ('breve' and 'long' are not supported).");var u=Number(i.attr("dots"));var a=MeiLib.dur2beats(o,n);return{beats:a,found:false}}}else if(s==="mRest"){if(i.attr("xml:id")===e){l=true;return{beats:0,found:true}}else{return{beats:n.count,found:false}}}else if(s==="layer"||s==="beam"){var a=0;var f=i.children();var l=false;for(var c=0;c<f.length&&!l;++c){var h=r(f[c]);a+=h.beats;l=h.found}return{beats:a,found:l}}else if(s==="chord"){var p=i.attr("dur");if(i.attr("xml:id")===e){return{beats:0,found:true}}else{var p=i.attr("dur");if(p){if(i.find("[xml\\:id='"+e+"']")){return{beats:0,found:true}}else{return{beats:MeiLib.dur2beats(p,n),found:l}}}else{var f=i.children();var l=false;for(var c=0;c<f.length&&!l;++c){var h=r(f[c]);a=h.beats;l=h.found}return{beats:a,found:l}}}}return{beats:0,found:false}};return r(t)};Node.prototype.attrs=function(){var e;var t={};for(e in this.attributes){t[this.attributes[e].name]=this.attributes[e].value}return t};Array.prototype.all=function(e){e=e||function(e){return e==true};var t;for(t=0;t<this.length;t++){if(e(this[t])===false){return false}}return true};Array.prototype.any=function(e){e=e||function(e){return e==true};var t;for(t=0;t<this.length;t++){if(e(this[t])===true){return true}}return false};MEI2VF={};MEI2VF.RUNTIME_ERROR=function(e,t){this.error_code=e;this.message=t};MEI2VF.RUNTIME_ERROR.prototype.toString=function(){return"MEI2VF.RUNTIME_ERROR: "+this.error_code+": "+this.message};MEI2VF.render_notation=function(e,t,n,r){var n=n||800;var r=r||350;var i;var s;var o;var u=[];var a=[];var f=[];var l={};var c=[];var h=[];var p=[];var d=[];var v=[];var m=20;var g=20;var y=0;var b=g;var w=0;var E=0;var S=0;var x=false;var T=true;var N=new Array;var C={};var k=function(e){Vex.Log("count_measures_siblings_till_sb() {}");if(e.length===0)return 0;switch($(e).prop("localName")){case"measure":return 1+k($(e).next());case"sb":return 0;default:return k($(e).next())}};var L=function(e){i=k(e);s=Math.round((n-g)/i);Vex.LogDebug("update_measure_width(): "+i+", width:"+s)};var A=function(e){L(e);Vex.LogDebug("startSystem() {enter}");if(T){S=0;b=g;E+=1;y=w+m*(y>0?1:0);T=false;x=false;$.each(N,function(e,t){if(t){t.renderWith.clef=true;t.renderWith.keysig=true;t.renderWith.timesig=true}})}else if(x){S=0;b=g;E+=1;y=w+m;x=false;$.each(N,function(e,t){if(t){t.renderWith.clef=true;t.renderWith.keysig=true}})}};var O=function(){if(u[u.length-1]){var e=u[u.length-1][0];b=e.x+e.width;Vex.LogDebug("moveOneMeasure(): measure_left:"+b)}else{b=g}};var M=function(){return T||x};var _=function(e,t){var n=D(e,t);if(!n)throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.MissingAttribute","Attribute "+t+" is mandatory.");return n};var D=function(e,t){var n=$(e).attr(t);return n};var P=function(e){e=typeof e==="number"&&arguments.length===2&&typeof arguments[1]==="object"?arguments[1]:e;var t=$(e).attr("pname");var n=$(e).attr("oct");if(!t||!n){throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.MissingAttribute","pname and oct attributes must be specified for <note>")}return t+"/"+n};var H=function(e){var t=$(e).find("syl");var n="";$(t).each(function(e,t){var r=$(t).attr("wordpos")=="i"||$(t).attr("wordpos")=="m"?"-":"";n+=(e>0?"\n":"")+$(t).text()+r});var r=t.attr("wordpos")=="i"||t.attr("wordpos")=="m"?"-":"";return n};var B=function(e,t){var n=$(e).find("dir");var r="";var i="";$(n).each(function(){var e=_(this,"startid");var n=_(t,"xml:id");var s=_(this,"place");if(e===n){r+=$(this).text().trim();i=s}});return[r,i]};var j=function(e,t){e={pitch:e.split("/")[0][0],octave:Number(e.split("/")[1])};t={pitch:t.split("/")[0][0],octave:Number(t.split("/")[1])};if(e.octave===t.octave){if(e.pitch===t.pitch){return 0}else if(e.pitch<t.pitch){return-1}else if(e.pitch>t.pitch){return 1}}else if(e.octave<t.octave){return-1}else if(e.octave>t.octave){return 1}};var F=function(e){e=String(e);if(e==="1")return"w";if(e==="2")return"h";if(e==="4")return"q";if(e==="8")return"8";if(e==="16")return"16";if(e==="32")return"32";if(e==="64")return"64";throw new Vex.RuntimeError("BadArguments",'The MEI duration "'+e+'" is not supported.')};var I=function(e,t){t=t||true;e=typeof e==="number"&&arguments.length===2&&typeof arguments[1]==="object"?arguments[1]:e;var n=$(e).attr("dur");if(n===undefined){alert("Could not get duration from:\n"+JSON.stringify(e,null,"	"))}var r=F(n);if(t===true&&$(e).attr("dots")==="1"){r+="d"}return r};var q=function(e){if(e==="n")return"n";if(e==="f")return"b";if(e==="s")return"#";if(e==="ff")return"bb";if(e==="ss")return"##";throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.BadAttributeValue","Invalid attribute value: "+e)};var R=function(e,t){var n=$(e).attr("stem.dir");if(n!==undefined){return n==="up"?Vex.Flow.StaveNote.STEM_UP:n==="down"?Vex.Flow.StaveNote.STEM_DOWN:undefined}else{var r=W($(t).attr("n"));if(r==="treble"){return j("a/5",P(e))===1?Vex.Flow.StaveNote.STEM_UP:Vex.Flow.StaveNote.STEM_DOWN}else if(r==="bass"){return j("c/3",P(e))===-1?Vex.Flow.StaveNote.STEM_DOWN:Vex.Flow.StaveNote.STEM_UP}}};var U=function(e){if($(e).attr("key.pname")!==undefined){var t=$(e).attr("key.pname").toUpperCase();var n=$(e).attr("key.accid");if(n!==undefined){switch(n){case"s":t+="#";break;case"f":t+="b";break;default:throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.UnexpectedAttributeValue","Value of key.accid must be 's' or 'f'")}}var r=$(e).attr("key.mode");if(r!==undefined){t+=r==="major"?"":"m"}return t}else{return"C"}};var z=function(e){var t=_(e,"clef.shape");var n=D(e,"clef.line");if(t==="G"&&(!n||n==="2")){return"treble"}else if(t==="F"&&(!n||n==="4")){return"bass"}else{throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.NotSupported",'Clef definition is not supported: [ clef.shape="'+t+'" '+(n?'clef.line="'+n+'"':"")+" ]")}};var W=function(e){if(e>=N.length)throw new MEI2VF.RUNTIME_ERROR("MEI2VF.staff_clef():E01","No staff definition for staff n="+e);var t=N[e].staffDef;return z(t)};var X=function(e){if($(e).attr("meter.count")!==undefined&&$(e).attr("meter.unit")!==undefined){return $(e).attr("meter.count")+"/"+$(e).attr("meter.unit")}};var V=function(e){var t=new Vex.Flow.Renderer(e,Vex.Flow.Renderer.Backends.CANVAS);o=t.getContext()};var J=function(e){return 100};var K=function(e){var t=0;var n;for(n=0;n<e-1;n++)t+=J(n);return t};var Q=function(e){var t=y+K(e);var n=t+J(e);if(n>w)w=n;return t};var G=function(e,t){if(!e){throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.BadArgument",'Cannot render staff without attribute "n".')}var n=N[e].staffDef;var r=new Vex.Flow.Stave(b,Q(e),t);if(N[e].renderWith.clef){r.addClef(z(n));N[e].renderWith.clef=false}if(N[e].renderWith.keysig){if($(n).attr("key.sig.show")==="true"||$(n).attr("key.sig.show")===undefined){r.addKeySignature(U(n))}N[e].renderWith.keysig=false}if(N[e].renderWith.timesig){if($(n).attr("meter.rend")==="norm"||$(n).attr("meter.rend")===undefined){r.addTimeSignature(X(n))}N[e].renderWith.timesig=false}r.setContext(o).draw();return r};var Y=function(){var t=$(e).find("scoreDef")[0];if(!t)throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.BadMEIFile","No <scoreDef> found.");it(t);$(e).find("section").children().each(nt);$.each(a,function(e,t){t.setContext(o).draw()});Z(h);Z(p);et(d)};var Z=function(e){$(e).each(function(e,t){var n=l[t.getFirstId()];var r=l[t.getLastId()];var i;if(n)i=n.vexNote;var s;if(r)s=r.vexNote;(new Vex.Flow.StaveTie({first_note:i,last_note:s})).setContext(o).draw()})};var et=function(e){$(e).each(function(e,t){var n=l[t.getFirstId()];var r=l[t.getLastId()];var i;if(n)i=n.vexNote;var s;if(r)s=r.vexNote;var u=mei2vexflowTables.positions[t.params.place];var a=mei2vexflowTables.hairpins[t.params.form];var f=0;var c=0;var h={height:10,y_shift:0,left_shift_px:f,r_shift_px:c};(new Vex.Flow.StaveHairpin({first_note:i,last_note:s},a)).setContext(o).setRenderOptions(h).setPosition(u).draw()})};var tt=function(){for(var e in C){var t=C[e];var n=t.vexType();var r=c[t.top_staff_n];var i=c[t.bottom_staff_n];if(n&&r&&i){var s=new Vex.Flow.StaveConnector(r,i);s.setType(t.vexType());s.setContext(o);s.draw()}}};var nt=function(e,t){switch($(t).prop("localName")){case"measure":var n;if(M()){A(t);n=true}else{O();n=false}ft(t);if(n){tt();n=false}ht(t,"tie",h);ht(t,"slur",p);ht(t,"hairpin",d);break;case"scoreDef":it(t);break;case"staffDef":at(t);break;case"sb":rt(t);break;default:throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.NotSupported","Element <"+$(t).prop("localName")+"> is not supported in <section>")}};var rt=function(e){x=true};var it=function(e){$(e).children().each(st)};var st=function(e,t){switch($(t).prop("localName")){case"staffGrp":ot(t);break;default:throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.NotSupported","Element <"+$(t).prop("localName")+"> is not supported in <scoreDef>")}};var ot=function(e){var t={};var n=e.attrs().symbol;$(e).children().each(function(e,n){var r=ut(e,n);Vex.LogDebug("process_staffGrp() {1}.{a}: local_result.first_n:"+r.first_n+" local_result.last_n:"+r.last_n);if(e===0){t.first_n=r.first_n;t.last_n=r.last_n}else{t.last_n=r.last_n}});Vex.LogDebug("process_staffGrp() {2}: symbol:"+n+" result.first_n:"+t.first_n+" result.last_n:"+t.last_n);C[t.first_n.toString()+":"+t.last_n.toString()]=new MEI2VF.StaveConnector(n,t.first_n,t.last_n);return t};var ut=function(e,t){switch($(t).prop("localName")){case"staffDef":var n=at(t);return{first_n:n,last_n:n};break;case"staffGrp":return ot(t);break;default:throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.NotSupported","Element <"+$(t).prop("localName")+"> is not supported in <staffGrp>")}};var at=function(e){var t=Number(e.attrs().n);var n=N[t];if(n){N[t].updateDef(e)}else{N[t]=new MEI2VF.StaffInfo(e,true,true,true)}return t};var ft=function(e){u.push($(e).find("staff").map(function(t,n){return lt(t,n,e)}).get())};var lt=function(e,t,n){var r,i,u;var a=Number(t.attrs().n);r=G(a,s);var f=$(t).find("layer").map(function(e,r){return ct(e,r,t,n)}).get();var l=[];$(f).each(function(){l.push({events:$(this.events).get().map(function(e){return e.vexNote?e.vexNote:e}),layer:this.layer})});var h=$.map(l,function(e){return Tt(null,e.events)});var p=(new Vex.Flow.Formatter).joinVoices(h).format(h,s).formatToStave(h,r);$.each(h,function(e,t){t.draw(o,r)});c[a]=r;return r};var ct=function(e,t,n,r){var i=r.attrs().n;if(!i)throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.extract_events:","<measure> must have @n specified");var s=n.attrs().n;if(!s)s="1";var o=t.attrs().n;if(!o)o="1";var u=N[s].staffDef;var a=i+":"+s+":"+o;if(v[a]){$(v[a]).each(function(e,n){var r=$(u).attr("meter.count");var i=$(u).attr("meter.unit");var s={count:Number(r),unit:Number(i)};n.setContext({layer:t,meter:s});v[a][e]=null});v[a]=null}return{layer:e,events:$(t).children().map(function(e,i){return xt(i,t,n,r)}).get()}};var ht=function(e,t,n){var r=function(e){var t=e.attrs().staff;if(!t){t="1"}var n=e.attrs().layer;if(!n){n="1"}return{staff_n:t,layer_n:n}};var i=function(e,t,n){var i=r(t);var s=$(n).find('staff[n="'+i.staff_n+'"]');var o=$(s).find('layer[n="'+i.layer_n+'"]').get(0);if(!o){var u=$(s).find("layer");if(u&&!u.attr("n"))o=u;if(!o)throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.extract_linkingElements:E01","Cannot find layer")}var a=N[i.staff_n].staffDef;if(!a)throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.extract_linkingElements:E02","Cannot determine staff definition.");var f={count:Number(a.attrs()["meter.count"]),unit:Number(a.attrs()["meter.unit"])};if(!f.count||!f.unit)throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.extract_linkingElements:E03","Cannot determine meter; missing or incorrect @meter.count or @meter.unit.");return MeiLib.tstamp2id(e,o,f)};var s=function(e){var t;return e.substring(0,e.indexOf("m"))};var o=function(e){var t;return e.substring(e.indexOf("+")+1)};var u=$(e).find(t);$.each(u,function(u,a){var f=new MEI2VF.EventLink(null,null);if(t==="hairpin"){var l=a.attrs().form;if(!l)throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.BadArguments:extract_linkingElements","@form is mandatory in <hairpin> - make sure the xml is valid.");var c=a.attrs().place;f.setParams({form:l,place:c})}var h=a.attrs().startid;if(h){f.setFirstId(h)}else{var p=a.attrs().tstamp;if(p){h=i(p,a,e);f.setFirstId(h)}else{}}var d=a.attrs().endid;if(d){f.setLastId(d)}else{var m=a.attrs().tstamp2;if(m){var g=Number(s(m));if(g>0){f.setLastTStamp(o(m));var y=r(a);var b=e.attrs().n;var w=Number(b)+g;var E=w.toString()+":"+y.staff_n+":"+y.layer_n;if(!v[E])v[E]=new Array;v[E].push(f)}else{d=i(o(m),a,e);f.setLastId(d)}}else{}}n.push(f)})};var pt=function(e,t,n){var r=new MEI2VF.EventLink(e,t);n.push(r)};var dt=function(e,t,n){var r=new MEI2VF.EventLink(e,null);r.setParams({linkCond:t});n.push(r)};var vt=function(e,t){var n=function(e,t){return e&&t&&e.pname===t.pname&&e.oct===t.oct&&e.system===t.system};if(!t.pname||!t.oct)throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.BadArguments:TermTie01","no pitch or specified for the tie");var r=false;var i;var s;for(i=0;!r&&i<h.length;++i){s=h[i];if(!s.getLastId()){if(n(s.params.linkCond,t)){r=true;s.setLastId(e)}else{}}}if(!r){var s=new MEI2VF.EventLink(null,e);h.push(s)}};var mt=function(e,t){var n=function(e,t){return e.nesting_level===t.nesting_level&&e.system===t.system};var r=false;var i=0;var s;for(i=0;!r&&i<p.length;++i){var o=p[i];if(o&&!o.getLastId()&&n(o.params.linkCond,t)){r=true;o.setLastId(e)}}if(!r){var o=new MEI2VF.EventLink(null,e);p.push(o)}};var gt=function(e){var t=[];var n=e.split(" ");$.each(n,function(e,n){var r;if(n.length===1){t.push({letter:n,nesting_level:0})}else if(n.length===2){if(!(r=Number(n[1])))throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.BadArguments:ParseSlur01","badly formed slur attribute");t.push({letter:n[0],nesting_level:r})}else{throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.BadArguments:ParseSlur01","badly formed slur attribute")}});return t};var yt=function(e,t,n,r){var i=function(e){return(new Vex.Flow.Annotation(e)).setFont("Times").setBottom(true)};var s=function(e){return(new Vex.Flow.Annotation(e)).setFont("Times")};try{var o=new Vex.Flow.StaveNote({keys:[P(e)],clef:W($(n).attr("n")),duration:I(e),stem_direction:R(e,n)});o.addAnnotation(2,i(H(e)));var u=B(r,e);o.addAnnotation(2,u[1]=="below"?i(u[0]):s(u[0]));try{var a;for(a=0;a<parseInt($(e).attr("dots"));a++){o.addDotToAll()}}catch(c){throw new Vex.RuntimeError("BadArguments","A problem occurred processing the dots of <note>: "+JSON.stringify(e.attrs())+'. "'+c.toString()+'"')}var d=$(e).attr("accid");if(d){o.addAccidental(0,new Vex.Flow.Accidental(q(d)))}$.each($(e).find("artic"),function(e,t){o.addArticulation(0,(new Vex.Flow.Articulation(mei2vexflowTables.articulations[$(t).attr("artic")])).setPosition(mei2vexflowTables.positions[$(t).attr("place")]))});$.each($(e).children(),function(e,t){$(t).remove()});var v=$(e).attr("xml:id");if(!v){v=MeiLib.createPseudoUUID();$(e).attr("xml:id",v)}var m=$(e).attr("tie");if(!m)m="";var g=$(e).attr("pname");if(!g)throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.BadArguments","mei:note must have pname attribute");var y=$(e).attr("oct");if(!y)throw new MEI2VF.RUNTIME_ERROR("MEI2VF.RERR.BadArguments","mei:note must have oct attribute");for(var a=0;a<m.length;++a){switch(m[a]){case"i":dt(v,{pname:g,oct:y,system:E},h);break;case"t":vt(v,{pname:g,oct:y,system:E});break}}var b=$(e).attr("slur");if(b){var w=gt(b);$.each(w,function(e,t){switch(t.letter){case"i":dt(v,{nesting_level:t.nesting_level,system:E},p);break;case"t":mt(v,{nesting_level:t.nesting_level,system:E});break}})}var S={vexNote:o,id:v};f.push(S);l[v]={meiNote:e,vexNote:o};return S}catch(c){throw new Vex.RuntimeError("BadArguments","A problem occurred processing the <note>: "+JSON.stringify(e.attrs())+'. "'+c.toString()+'"')}};var bt=function(e,t,n,r){try{var i=new Vex.Flow.StaveNote({keys:["c/5"],duration:I(e,false)+"r"});if($(e).attr("dots")==="1"){i.addDotToAll()}return i}catch(s){throw new Vex.RuntimeError("BadArguments","A problem occurred processing the <rest>: "+JSON.stringify(e.attrs())+'. "'+s.toString()+'"')}};var wt=function(e,t,n,r){try{var i=new Vex.Flow.StaveNote({keys:["c/5"],duration:"wr"});return i}catch(s){throw new Vex.RuntimeError("BadArguments","A problem occurred processing the <mRest>: "+JSON.stringify(e.attrs())+'. "'+s.toString()+'"')}};var Et=function(e,t,n,r){var i=$(e).children().map(function(e,i){var s=xt(i,t,n,r);return s.vexNote?s.vexNote:s}).get();a.push(new Vex.Flow.Beam(i));return i};var St=function(e,t,n,r){try{var i=$(e).children().map(P).get();var s=F(Math.max.apply(Math,$(e).children().map(function(){return Number($(this).attr("dur"))}).get()));var o=$(e).children().map(function(){return $(this).attr("dots")==="1"}).get().any();if(o===true){s+="d"}var u=new Vex.Flow.StaveNote({keys:i,clef:W($(n).attr("n")),duration:s});if(o===true){u.addDotToAll()}$(e).children().each(function(e,t){var n=$(t).attr("accid");if(n!==undefined){u.addAccidental(e,new Vex.Flow.Accidental(q(n)))}});return u}catch(a){throw new Vex.RuntimeError("BadArguments","A problem occurred processing the <chord>:"+a.toString())}};var xt=function(e,t,n,r){var i=$(e).prop("localName");if(i==="rest"){return bt(e,t,n,r)}else if(i==="mRest"){return wt(e,t,n,r)}else if(i==="note"){return yt(e,t,n,r)}else if(i==="beam"){return Et(e,t,n,r)}else if(i==="chord"){return St(e,t,n,r)}else{throw new Vex.RuntimeError("BadArguments",'Rendering of element "'+i+'" is not supported.')}};var Tt=function(t,n){if(!$.isArray(n)){throw new Vex.RuntimeError("BadArguments","make_voice() voice_contents argument must be an array.")}var r=new Vex.Flow.Voice({num_beats:Number($(e).find("staffDef").attr("meter.count")),beat_value:Number($(e).find("staffDef").attr("meter.unit")),resolution:Vex.Flow.RESOLUTION});r.setStrict(false);r.addTickables(n);return r};V(t);Y()};MEI2VF.EventLink=function(e,t){this.init(e,t)};MEI2VF.EventLink.prototype.init=function(e,t){this.first_ref=new MEI2VF.EventReference(e);this.last_ref=new MEI2VF.EventReference(t);this.params={}};MEI2VF.EventLink.prototype.setParams=function(e){this.params=e};MEI2VF.EventLink.prototype.setFirstRef=function(e){this.first_ref=e};MEI2VF.EventLink.prototype.setLastRef=function(e){this.last_ref=e};MEI2VF.EventLink.prototype.setFirstId=function(e){this.first_ref.setId(e)};MEI2VF.EventLink.prototype.setLastId=function(e){this.last_ref.setId(e)};MEI2VF.EventLink.prototype.setFirstTStamp=function(e){this.first_ref.setTStamp(e)};MEI2VF.EventLink.prototype.setLastTStamp=function(e){this.last_ref.setTStamp(e)};MEI2VF.EventLink.prototype.setContext=function(e){this.meicontext=e};MEI2VF.EventLink.prototype.getFirstId=function(){return this.first_ref.getId({meicontext:this.meicontext})};MEI2VF.EventLink.prototype.getLastId=function(){return this.last_ref.getId({meicontext:this.meicontext})};MEI2VF.EventReference=function(e){this.xmlid=e};MEI2VF.EventReference.prototype.setId=function(e){this.xmlid=e};MEI2VF.EventReference.prototype.setTStamp=function(e){this.tstamp=e;if(this.xmlid){this.tryResolveReference(true)}};MEI2VF.EventReference.prototype.tryResolveReference=function(e){var t=this.tstamp;var n=this.meicontext;if(!t)throw new MEI2VF.RUNTIME_ERROR("MEI2VF:RERR:BADARG:EventRef001","EventReference: tstamp must be set in order to resolve reference.");if(this.meicontext){this.xmlid=MeiLib.tstamp2id(this.tstamp,this.meicontext.layer,this.meicontext.meter)}else{this.xmlid=null}};MEI2VF.EventReference.prototype.getId=function(e){if(e&&e.meicontext)this.setContext(e.meicontext);if(this.xmlid)return this.xmlid;if(this.tstamp){if(this.meicontext){this.tryResolveReference(e&&e.strict);return this.xmlid}}return null};MEI2VF.EventReference.prototype.setContext=function(e){this.meicontext=e};MEI2VF.StaffInfo=function(e,t,n,r){this.renderWith={clef:t,keysig:n,timesig:r};this.staffDef=e};MEI2VF.StaffInfo.prototype.look4changes=function(e,t){var n={clef:false,keysig:false,timesig:false};if(!e&&t){n.clef=true;n.keysig=true;n.keysig=true;return n}else if(e&&!t){n.clef=false;n.keysig=false;n.keysig=false;return n}else if(!e&&!t){throw new MEI2VF_RUNTIME_ERROR("BadArgument","Cannot compare two undefined staff definitions.")}var r=function(e,t,n){return $(e).attr(n)===$(t).attr(n)};if(!r(e,t,"clef.shape")||!r(e,t,"clef.line")){n.clef=true}if(!r(e,t,"key.pname")||!r(e,t,"key.accid")||!r(e,t)){n.keysig=true}if(!r(e,t,"meter.count")||!r(e,t,"meter.unit")){n.timesig=true}return n};MEI2VF.StaffInfo.prototype.updateDef=function(e){this.renderWith=this.look4changes(this.staffDef,e);this.staffDef=e};MEI2VF.StaveConnector=function(e,t,n){this.init(e,t,n)};MEI2VF.StaveConnector.prototype.init=function(e,t,n){this.symbol=e;this.top_staff_n=t;this.bottom_staff_n=n};MEI2VF.StaveConnector.prototype.vexType=function(){switch(this.symbol){case"line":return Vex.Flow.StaveConnector.type.SINGLE;case"brace":return Vex.Flow.StaveConnector.type.BRACE;case"bracket":return Vex.Flow.StaveConnector.type.BRACKET;case"none":return null;default:return Vex.Flow.StaveConnector.type.SINGLE}};mei2vexflowTables={};mei2vexflowTables.positions={above:Vex.Flow.Modifier.Position.ABOVE,below:Vex.Flow.Modifier.Position.BELOW};mei2vexflowTables.hairpins={cres:Vex.Flow.StaveHairpin.type.CRESC,dim:Vex.Flow.StaveHairpin.type.DECRESC};mei2vexflowTables.articulations={acc:"a>",stacc:"a.",ten:"a-",stacciss:"av",marc:"a^",dnbow:"am",upbow:"a|",snap:"ao",lhpizz:"a+",dot:"a.",stroke:"a|"}