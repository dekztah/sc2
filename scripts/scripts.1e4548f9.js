(function(){"use strict";angular.module("sc2App",["config","ngStorage","ngSanitize","ngAnimate"]).config(["$localStorageProvider",function(a){return a.setKeyPrefix("sc2-")}])}).call(this),function(){"use strict";angular.module("sc2App").service("UserService",["$localStorage","$rootScope",function(a,b){a.$default({userObj:void 0}),this.userObj=a.userObj,this.setUser=function(c){return console.log(c),this.userObj=a.userObj=c,b.$broadcast("userStateChanged")},this.logout=function(){return a.$reset()}}])}.call(this),function(){"use strict";angular.module("sc2App").factory("audioContext",function(){var a,b,c,d,e,f,g,h;return window.AudioContext=window.AudioContext||window.webkitAudioContext,a=new window.AudioContext,f=document.createElement("audio"),f.crossOrigin="anonymous",g=document.createElement("audio"),b=a.createAnalyser(),b.smoothingTimeConstant=.6,b.fftSize=256,e=a.createAnalyser(),e.smoothingTimeConstant=.3,e.fftSize=2048,d=a.createGain(),h=a.createMediaElementSource(f),h.connect(d),d.connect(e),d.connect(b),d.connect(a.destination),c={player:f,playerNoVis:g,analyser:b,osc:e,gain:d.gain}})}.call(this),function(){"use strict";angular.module("sc2App").service("CanvasService",function(){var a,b,c,d,e,f,g;a=document.createElement("canvas"),a.width=450,a.height=100,b=document.createElement("canvas"),b.width=450,b.height=100,d=document.createElement("canvas"),d.width=450,d.height=100,f=document.createElement("canvas"),f.width=450,f.height=100,g=document.createElement("canvas"),g.width=450,g.height=100,e=document.createElement("canvas"),e.width=450,e.height=100,c={analyserBottomContext:a.getContext("2d"),analyserTopContext:b.getContext("2d"),oscContext:d.getContext("2d"),waveformContext:f.getContext("2d"),waveformProgressContext:g.getContext("2d"),waveformBufferContext:e.getContext("2d")},this.canvases=function(){return c},this.drawWaveform=function(a,b,c){var d,e,f,g;for(b.fillStyle=c,b.clearRect(0,0,b.canvas.width,100),e=Math.floor(b.canvas.width/6),f=Math.floor(1800/e),g=void 0,b.strokeStyle=c,b.lineCap="round",b.lineWidth=4,b.beginPath(),d=0;e>d;)g=a?(.7*a[d*f]).toFixed():1,b.moveTo(6*d+2,50-.5*g),b.lineTo(6*d+2,50+.5*g),d++;return b.stroke()},this.drawAnalyzerBgr=function(a,b,c,d,e){var f,g;for(f=void 0,g=void 0,a.strokeStyle="rgba(255,255,255,0.07)",a.lineCap="round",a.lineWidth=4,a.beginPath(),f=0;b>f;){for(g=0;20>g;)a.moveTo(f*c+2,104-6*g),a.lineTo(f*c-2+e,104-6*g),++g;++f}return a.stroke()},this.drawWaveform(null,c.waveformContext,"rgba(255,255,255,0.2)"),this.drawAnalyzerBgr(c.analyserBottomContext,15,30,100,28)})}.call(this),function(){"use strict";angular.module("sc2App").factory("AdditiveBlendShader",["$window",function(a){var b;return b={uniforms:{tBase:{type:"t",value:null},tAdd:{type:"t",value:null},amount:{type:"f",value:1}},vertexShader:["varying vec2 vUv;","void main() {","vUv = uv;","gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform sampler2D tBase;","uniform sampler2D tAdd;","uniform float amount;","varying vec2 vUv;","void main() {","vec4 texel1 = texture2D( tBase, vUv );","vec4 texel2 = texture2D( tAdd, vUv );","gl_FragColor = texel1 + texel2 * amount;","}"].join("\n")}}])}.call(this),function(){"use strict";angular.module("sc2App").service("SoundCloudService",["$window","$http","$q","soundcloudConfig","UserService",function(a,b,c,d,e){this.connect=function(){var f,g,h;return g=c.defer(),f=a.SC,h={},f.initialize({client_id:d.apiKey,redirect_uri:d.redirectUri,scope:"non-expiring"}),f.connect(function(){return h.token=f.accessToken(),b.get(d.apiBaseUrl+"/me",{params:{oauth_token:h.token}}).success(function(a){return h.user=a,g.resolve(h),e.setUser(h)})}),g.promise},this.getPlaylistTracks=function(a){var f,g,h,i;for(i=[],f=0,g=a.length;g>f;f++)h=a[f],i.push(b.get(d.apiBaseUrl+"/playlists/"+h+"/tracks",{params:{oauth_token:e.userObj.token}}));return c.all(i)},this.res=function(a,c,f,g){return g.oauth_token=e.userObj.token,b({method:c,url:d.apiBaseUrl+"/me/"+a+f,params:g})},this.getProperStreamUrl=function(a){var c;return c=d.apiBaseUrl+"/i1/tracks/"+a+"/streams?client_id="+d.apiKey,b.get(c).then(function(a){var b;return b={vis:a.data.hasOwnProperty("http_mp3_128_url")?a.data.http_mp3_128_url.indexOf("ec-media")>-1:void 0,url:a.data.http_mp3_128_url}})},this.getWaveformData=function(a){var c;return c=a.split("/"),a=d.waveformServiceUrl+c[3].replace("png","json"),b.get(a)},this.downloadUrl=function(a){return d.apiBaseUrl+"/tracks/"+a+"/download?client_id="+d.apiKey}}])}.call(this),function(){"use strict";angular.module("sc2App").service("ContentService",["$q","$window","SoundCloudService","HelperService","UserService","$localStorage",function(a,b,c,d,e,f){var g,h,i,j,k;h=b.moment,k=void 0,g=50,j=0,f.$default({lastFetch:""}),this.lastFetch=f.lastFetch,i=h().format("YYYY-MM-DD HH:mm:ss"),this.player={currentTrack:void 0,previousTrack:void 0},this.loadContent=function(b){return function(){var l,m,n,o,p;return b.content={playlists:{ids:[],items:[]},favorites:[],followings:{},stream:[],likeIds:[]},n=function(a,e,f){var g;return g=[],Number.isInteger(f)?(a.origin=a,g=f>=0?[f,e]:[e]):g=[e],a.origin?{index:g,isNew:h(a.created_at,"YYYY/MM/DD HH:mm:ss ZZ").isAfter(h(b.lastFetch)),scDate:a.created_at,created:d.customDate(a.created_at,"MMMM DD YYYY"),type:a.type||a.kind,repost:a.type?a.type.indexOf("repost")>-1:!1,singleTrackPlaylist:!1,title:a.origin.title,scid:a.origin.id,duration:a.origin.duration,durationFormatted:d.duration(a.origin.duration),stream:a.origin.stream_url,streamable:a.origin.streamable,waveform:a.origin.waveform_url,artwork:a.origin.artwork_url,buy:a.origin.purchase_url,downloadlink:a.origin.downloadable?c.downloadUrl(a.origin.id):!1,link:a.origin.permalink_url,username:a.origin.user.username,userlink:a.origin.user.permalink_url,avatar:a.origin.user.avatar_url,favoriteFlag:b.content.likeIds.indexOf(a.origin.id)>-1,followingFlag:b.content.followings.hasOwnProperty(a.origin.user_id),description:a.origin.description?d.description(a.origin.description):!1,favList:0>f}:(console.log(a),"mysterious undreadable track...")},o=function(b,d){var e,f,h,i,j,k,l;for(e=a.defer(),j=[],l=[],f=function(d){var e;return e=a.defer(),c.res(b,"get","",{limit:g,offset:d}).then(function(a){return e.resolve(a.data)}),e.promise},h=i=0,k=Math.ceil(d/g);k>=0?k>i:i>k;h=k>=0?++i:--i)j.push(f(h*g));return a.all(j).then(function(a){var b,c,d,f,g,h,i,j,k;for(c=0,f=a.length;f>c;c++){if(k=a[c],k.collection)for(j=k.collection,d=0,g=j.length;g>d;d++)b=j[d],l.push(b);for(i=0,h=k.length;h>i;i++)b=k[i],l.push(b)}return e.resolve(l)}),e.promise},angular.equals(b.content.followings,{})&&(m=o("followings",e.userObj.user.followings_count).then(function(a){var c,e,f,g;for(f=[],c=0,e=a.length;e>c;c++)g=a[c],g.description&&(g.description=d.description(g.description)),g.followingFlag=!0,f.push(b.content.followings[g.id]=g);return f}),l=o("favorites",e.userObj.user.public_favorites_count).then(function(a){var c,d,e,f,g;for(g=[],f=c=0,d=a.length;d>c;f=++c)e=a[f],b.content.likeIds.push(e.id),b.content.favorites.push(n(e,f,-1)),g.push(b.content.favorites[f].favoriteFlag=!0);return g})),p=c.res("activities/tracks/affiliated","get","",{limit:g,cursor:k}),a.all([m,l,p]).then(function(a){var d,e,h,l,m,o;for(l=a[2],k=l.data.next_href.split("cursor=")[1],b.content.stream=[],h=l.data.collection,o=d=0,e=h.length;e>d;o=++d)m=h[o],m=n(m,o+j*g,!1),b.content.stream.push(m),("playlist"===m.type||"playlist-repost"===m.type)&&b.content.playlists.ids.push(m.scid);return c.getPlaylistTracks(b.content.playlists.ids).then(function(a){var c,d,e,f,g,h,i,j,k,l,o,p;for(d=0,f=a.length;f>d;d++)j=a[d],b.content.playlists.items.push(j);for(o=b.content.stream,e=0,g=o.length;g>e;e++)if(m=o[e],c=b.content.playlists.ids.indexOf(m.scid),c>-1){for(m.tracks=[],p=b.content.playlists.items[c].data,l=i=0,h=p.length;h>i;l=++i)k=p[l],k=n(k,l,m.index[0]),m.tracks.push(k);1===m.tracks.length&&(m.singleTrackPlaylist=!0)}return b.content.stream[b.content.stream.length-1].last=!0}),j++,b.lastFetch=f.lastFetch=i,b.content},function(a){return a})}}(this)}])}.call(this),function(){"use strict";angular.module("sc2App").service("HelperService",["$window","$filter",function(a,b){var c,d,e;c=a.moment,d="YYYY/MM/DD HH:mm:ss ZZ",e=/((("|>)?\b(https?):\/\/|www)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi,this.duration=function(a){var b,d,e;return b=c.duration(a).get("hours"),d=c.duration(a).get("minutes"),e=c.duration(a).get("seconds"),1>e/10&&(e="0"+e),0!==b?(1>d/10&&(d="0"+d),b+":"+d+":"+e):d+":"+e},this.customDate=function(a,b){return"ago"===b?c(a).fromNow():c(a,d).format(b)},this.description=function(a){var b;return b=a.replace(e,function(a){return a.indexOf('"')>-1||a.indexOf(">")>-1?a:(0===a.indexOf("www")&&(a="http://"+a),'<a target="_blank" href="'+a+'">'+a+"</a>")}),b.replace(/\n/g,"<br>")},this.getNewCount=function(a,c){var d;return d=b("filter")(a,{isNew:!0}),c?d.length:b("filter")(d,{repost:!1}).length}}])}.call(this),function(){"use strict";angular.module("sc2App").factory("animation",["$window","audioContext","CanvasService","AdditiveBlendShader",function(a,b,c,d){var e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A;return w=this,x=30,h=28,q=15,p=void 0,t=void 0,m=void 0,i=void 0,e=a.THREE,j=void 0,v=void 0,z=void 0,u=void 0,l=void 0,n=void 0,y=void 0,s=void 0,w.requestId=null,f=new Uint8Array(b.analyser.frequencyBinCount),r=new Uint8Array(b.osc.frequencyBinCount),k=c.canvases(),k.oscContext.lineWidth=3,k.oscContext.strokeStyle="#ffffff",k.analyserTopContext.strokeStyle="#ffffff",k.analyserTopContext.lineCap="round",k.analyserTopContext.lineWidth=4,w.x3dscope=!1,w.animate=function(){return w.requestId=a.requestAnimationFrame(w.animate),w.x3dscope===!0?A():g()},w.killAnimation=function(){return w.requestId?(a.cancelAnimationFrame(w.requestId),w.requestId=void 0):void 0},o=function(){var a,b,c,f,g,h,k,o,p,q,r,w,x;for(x=800,w=600,f=document.getElementById("webGLWrapper"),j=new e.PerspectiveCamera(1,x/w,1,1e6),j.position.z=3e4,v=new e.Scene,h=new e.LineBasicMaterial({color:65535}),o=new e.Geometry,k=0;1024>k;)o.vertices.push(new e.Vector3(1*k,0,0)),k++;return s=new e.Line(o,h),v.add(s),s.position.x=-512,s.position.y=-100,v.add(new e.AmbientLight(16777215)),z=new e.WebGLRenderer,z.setSize(1920,955),f.appendChild(z.domElement),c=3,r={minFilter:e.LinearFilter,magFilter:e.LinearFilter,format:e.RGBFormat,stencilBufer:!1},p=new e.WebGLRenderTarget(x,w,r),t=new e.EffectComposer(z,p),u=new e.RenderPass(v,j),g=new e.ShaderPass(e.CopyShader),b=new e.BloomPass(3,8,2,512),t.addPass(u),t.addPass(g),t.addPass(b),n=new e.ShaderPass(e.HorizontalBlurShader),y=new e.ShaderPass(e.VerticalBlurShader),n.uniforms.h.value=c/x,y.uniforms.v.value=c/w,g=new e.ShaderPass(e.CopyShader),q=new e.WebGLRenderTarget(x/4,w/4,r),m=new e.EffectComposer(z,q),m.addPass(g),m.addPass(u),m.addPass(b),m.addPass(n),m.addPass(y),m.addPass(n),m.addPass(y),i=new e.EffectComposer(z),a=new e.ShaderPass(d),a.uniforms.tBase.value=t.renderTarget1,a.uniforms.tAdd.value=m.renderTarget1,a.uniforms.amount.value=0,i.addPass(a),l=new e.ShaderPass(e.FilmShader),l.uniforms.grayscale.value=0,l.uniforms.sIntensity.value=.8,l.uniforms.sCount.value=w,i.addPass(l),l.renderToScreen=!0},o(),A=function(){var a;for(b.osc.getByteTimeDomainData(r),a=0;1024>a;)s.geometry.vertices[a].y=r[a],a++;return s.geometry.verticesNeedUpdate=!0,t.render(.1),m.render(.1),i.render(.1)},g=function(){var a,c;for(k.analyserTopContext.clearRect(0,0,450,100),b.analyser.getByteFrequencyData(f),k.analyserTopContext.beginPath(),a=0;q>a;){for(p=(f[3+8*a]/2.56).toFixed(),c=0;p/6>c;)k.analyserTopContext.moveTo(a*x+2,104-6*c),k.analyserTopContext.lineTo(a*x-2+h,104-6*c),++c;++a}for(k.analyserTopContext.stroke(),k.oscContext.clearRect(0,0,k.oscContext.canvas.width,100),b.osc.getByteTimeDomainData(r),k.oscContext.beginPath(),a=0;a<k.oscContext.canvas.width/2;)k.oscContext.lineTo(2*a,r[a]/2.56),a++;return k.oscContext.stroke()},w}])}.call(this),function(){"use strict";angular.module("sc2App").directive("player",["audioContext","HelperService","CanvasService","ContentService","SoundCloudService","animation","$filter",function(a,b,c,d,e,f,g){return{restrict:"A",link:function(h,i,j){var k,l,m,n,o,p,q,r,s,t,u;return t=a.player,h.playerData={},h.fsScope=!1,q=function(){return h.$apply(function(){return h.playerData.currentTime=t.currentTime,h.playerData.currentTimeFormatted=b.duration(1e3*t.currentTime)})},m=function(){return h.$apply(function(){return h.playerData.currentTrack.isPlaying=!1,h.settings.autoAdvance&&d.player.nextTrack?(h.playerData.playingIndex=d.player.nextTrack.index,d.player.previousTrack=d.player.currentTrack,d.player.currentTrack=d.player.nextTrack,d.player.currentTrack.isPlaying=!0,h.$emit("playTrack")):(h.playerData.playingIndex=null,h.playerData.currentTime=0,f.killAnimation())})},l=function(){return h.$apply(function(){return h.playerData.duration=t.duration,h.playerData.seeking=!1})},p=function(){return h.$apply(function(){return h.playerData.seeking=!0})},o=function(){return h.$apply(function(){return h.playerData.seeking=!1})},n=function(){var a,b,c,d,e;for(d=[],e=t.buffered,a=0,b=e.length;b>a;a++)c=e[a],d.push([t.buffered.start(c),t.buffered.end(c)]);return d.length?h.$apply(function(){return h.playerData.buffered=d[d.length-1][1]}):void 0},u=function(){return t.addEventListener("timeupdate",q,!1),t.addEventListener("canplay",l,!1),t.addEventListener("seeking",p,!1),t.addEventListener("seeked",o,!1),t.addEventListener("progress",n,!1),t.addEventListener("ended",m,!1)},s=function(){return h.playerData.currentTrack.isPlaying=!0,t.play(),f.requestId?void 0:f.animate()},r=function(){return t.pause(),f.killAnimation()},k=function(){var a,b,c,e,f,i;for(a=g("filter")(d.content.stream,h.streamFilter),b=!1,f=[],c=0,e=a.length;e>c;c++){if(i=a[c],b){i.hasOwnProperty("tracks")?d.player.nextTrack=i.tracks[0]:d.player.nextTrack=i;break}i.index[0]===d.player.currentTrack.index[0]?i.hasOwnProperty("tracks")?i.index[1]===d.player.currentTrack.index[1]?f.push(b=!0):f.push(void 0):f.push(b=!0):f.push(void 0)}return f},h.$on("playTrack",function(b){return k(),d.player.previousTrack&&angular.equals(d.player.currentTrack.index,d.player.previousTrack.index)?s():(d.player.previousTrack&&(r(),d.player.previousTrack.isPlaying=!1),e.getProperStreamUrl(d.player.currentTrack.scid).then(function(b){return b.url?(b.vis?(t=a.player,h.status.access=!1):(t=a.playerNoVis,h.status.access="Limited access to track, visualizers disabled"),u(),h.playerData.currentTrack=d.player.currentTrack,h.playerData.vis=b.vis,t.src=b.url,s()):(h.status.access="No playable stream exists",h.playerData.currentTrack=void 0,t.src="",r())}),e.getWaveformData(d.player.currentTrack.waveform).then(function(a){return c.drawWaveform(a.data.samples,c.canvases().waveformContext,"rgba(255,255,255,0.05)"),c.drawWaveform(a.data.samples,c.canvases().waveformBufferContext,"rgba(255,255,255,0.15)"),c.drawWaveform(a.data.samples,c.canvases().waveformProgressContext,"#ffffff")}))}),h.$on("pauseTrack",function(){return h.playerData.currentTrack.isPlaying=!1,r()}),h.$on("seekTrack",function(a,b){return t.currentTime=(b*t.duration).toFixed()}),h.$on("seekPreview",function(a,c){return h.seekCursor={xpos:c.xpos,time:b.duration(c.xpos*t.duration*1e3/c.width)}}),h.helpers={setVolume:function(b){return a.gain.value=b*b/1e4},toggleOsc:function(a){return!h.status.access&&h.playerData.playingIndex&&a?h.fsScope=f.x3dscope=!0:h.fsScope=f.x3dscope=!1}}}}}])}.call(this),function(){"use strict";angular.module("sc2App").directive("canvasContext",["CanvasService",function(a){return{restrict:"A",link:function(b,c,d){return c.append(a.canvases()[d.canvasContext].canvas)}}}])}.call(this),function(){"use strict";angular.module("sc2App").directive("theme",["$localStorage",function(a){return{restrict:"A",link:function(b){return b.theme=a.settings.theme,b.toggleThemeChanger=function(){return b.themeChanger=!b.themeChanger},b.changeTheme=function(a,c){return c?b.theme.color=a:b.theme.bgr=a}}}}])}.call(this),function(){"use strict";angular.module("sc2App").directive("repeatFinished",["$timeout",function(a){return{restrict:"A",link:function(b){return b.$last===!0?a(function(){return b.$emit("ngRepeatFinished")}):void 0}}}])}.call(this),function(){"use strict";angular.module("sc2App").controller("pageCtrl",["$scope","$window","UserService","SoundCloudService","ContentService","$localStorage","HelperService","appVersion",function(a,b,c,d,e,f,g,h){return a.user=c.userObj,a.info=h,f.$default({settings:{streamFilter:{repost:"",singleTrackPlaylist:""},theme:{bgr:"default",color:"light"},autoAdvance:!1}}),a.user&&(a.user.lastFetch=g.customDate(e.lastFetch,"ago")),a.$on("userStateChanged",function(){return a.user=c.userObj}),a.connect=function(){return d.connect().then(function(b){return a.$broadcast("connected")})},a.logout=function(){return c.logout(),b.location.reload()},a.streamFilter=f.settings.streamFilter,a.streamFilter.title="",a.settings=f.settings,a.setTab=function(b){return a.activeTab=b},a.getTimes=function(a){return new Array(a)},a.setTab("stream")}])}.call(this),function(){"use strict";angular.module("sc2App").controller("streamCtrl",["$scope","$document","SoundCloudService","ContentService","UserService","HelperService",function(a,b,c,d,e,f){var g,h,i,j;return a.status={loading:!1,error:!1},a.content={stream:[]},g=void 0,j=void 0,i=void 0,h=function(b){var c;return c=void 0,c=isNaN(b[1])?a.content[a.activeTab][b[0]]:a.content[a.activeTab][b[0]].tracks[b[1]]},a.$on("connected",function(){return a.loadData()}),a.loadData=function(){return a.status.loading=!0,d.loadContent().then(function(b){return b.hasOwnProperty("status")?a.status={loading:!1,error:b.status+" "+b.statusText}:(a.content.stream.push.apply(a.content.stream,b.stream),a.content.followings=b.followings,a.content.favorites=b.favorites,a.helpers.getNewCount())})},a.$on("ngRepeatFinished",function(){return a.status.loading=!1}),a.like=function(a,b){var d,e;return d=h(b),e=d.scid,c.res("favorites/",a,e,{}).then(function(b){return 201===b.status?d.favoriteFlag=!0:200===b.status&&"delete"===a?d.favoriteFlag=!1:void 0})},a.follow=function(b,d){var e;return e=a.followings[d].id,c.res("followings/",b,e,{}).then(function(c){return 201===c.status?a.followings[d].followingFlag=!0:200===c.status&&"delete"===b?a.followings[d].followingFlag=!1:void 0})},a.controlAudio={play:function(b){return d.player={previousTrack:d.player.currentTrack,currentTrack:h(b)},a.$broadcast("playTrack")},pause:function(){return a.$broadcast("pauseTrack")},seekTo:function(b){var c;return c=(void 0===b.offsetX?b.layerX:b.offsetX)/b.target.offsetWidth,a.$broadcast("seekTrack",c)},seekPreview:function(b){var c;return c=void 0===b.offsetX?b.layerX:b.offsetX,a.$broadcast("seekPreview",{xpos:c,width:b.target.clientWidth})}},a.helpers={getNewCount:function(){return a.newCount=f.getNewCount(a.content.stream,a.streamFilter.repost),a.newCount>0?b[0].title="("+a.newCount+") sc2":b[0].title="sc2"}},e.userObj?a.loadData():void 0}])}.call(this);