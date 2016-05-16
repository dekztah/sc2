(function(){"use strict";angular.module("sc2App",["config","ngStorage","ngSanitize","ngAnimate","ui.router"]).config(["$localStorageProvider","$stateProvider","$locationProvider","$urlRouterProvider",function(a,b,c,d){return a.setKeyPrefix("sc2-"),d.otherwise("/"),b.state("main",{url:"/",views:{sidebar:{templateUrl:"views/sidebar.html"},main:{templateUrl:"views/main.html"}}}).state("main.stream",{url:"/stream",views:{content:{controller:"streamCtrl",templateUrl:"views/stream.html"}}}).state("main.favorites",{url:"/favorites",views:{content:{controller:"favoritesCtrl",templateUrl:"views/favorites.html"}}}).state("main.followings",{url:"/followings",views:{content:{controller:"followingsCtrl",templateUrl:"views/followings.html"}}})}]).run(["$state",function(a){}])}).call(this),function(){"use strict";angular.module("sc2App").service("UserService",["$localStorage","$rootScope",function(a,b){a.$default({userObj:void 0}),this.userObj=a.userObj,this.setUser=function(c){return console.log(c),this.userObj=a.userObj=c,b.$broadcast("userStateChanged")},this.logout=function(){return a.$reset()}}])}.call(this),function(){"use strict";angular.module("sc2App").factory("audioContext",function(){var a,b,c,d,e,f,g,h;return window.AudioContext=window.AudioContext||window.webkitAudioContext,a=new window.AudioContext,f=document.createElement("audio"),f.crossOrigin="anonymous",g=document.createElement("audio"),b=a.createAnalyser(),b.smoothingTimeConstant=.6,b.fftSize=256,e=a.createAnalyser(),e.smoothingTimeConstant=.3,e.fftSize=2048,d=a.createGain(),h=a.createMediaElementSource(f),h.connect(d),d.connect(e),d.connect(b),d.connect(a.destination),c={player:f,playerNoVis:g,analyser:b,osc:e,gain:d.gain}})}.call(this),function(){"use strict";angular.module("sc2App").service("CanvasService",function(){var a,b,c,d,e,f,g;a=document.createElement("canvas"),a.width=450,a.height=100,b=document.createElement("canvas"),b.width=450,b.height=100,d=document.createElement("canvas"),d.width=450,d.height=100,f=document.createElement("canvas"),f.width=450,f.height=100,g=document.createElement("canvas"),g.width=450,g.height=100,e=document.createElement("canvas"),e.width=450,e.height=100,c={analyserBottomContext:a.getContext("2d"),analyserTopContext:b.getContext("2d"),oscContext:d.getContext("2d"),waveformContext:f.getContext("2d"),waveformProgressContext:g.getContext("2d"),waveformBufferContext:e.getContext("2d")},this.canvases=function(){return c},this.drawWaveform=function(a,b,c){var d,e,f,g;for(b.fillStyle=c,b.clearRect(0,0,b.canvas.width,100),e=Math.floor(b.canvas.width/6),f=Math.floor(1800/e),g=void 0,b.strokeStyle=c,b.lineCap="round",b.lineWidth=4,b.beginPath(),d=0;e>d;)g=a?(.7*a[d*f]).toFixed():1,b.moveTo(6*d+2,50-.5*g),b.lineTo(6*d+2,50+.5*g),d++;return b.stroke()},this.drawAnalyzerBgr=function(a,b,c,d,e){var f,g;for(f=void 0,g=void 0,a.strokeStyle="rgba(255,255,255,0.07)",a.lineCap="round",a.lineWidth=4,a.beginPath(),f=0;b>f;){for(g=0;20>g;)a.moveTo(f*c+2,104-6*g),a.lineTo(f*c-2+e,104-6*g),++g;++f}return a.stroke()},this.drawWaveform(null,c.waveformContext,"rgba(255,255,255,0.2)"),this.drawAnalyzerBgr(c.analyserBottomContext,15,30,100,28)})}.call(this),function(){"use strict";angular.module("sc2App").factory("AdditiveBlendShader",["$window",function(a){var b;return b={uniforms:{tBase:{type:"t",value:null},tAdd:{type:"t",value:null},amount:{type:"f",value:1}},vertexShader:["varying vec2 vUv;","void main() {","vUv = uv;","gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );","}"].join("\n"),fragmentShader:["uniform sampler2D tBase;","uniform sampler2D tAdd;","uniform float amount;","varying vec2 vUv;","void main() {","vec4 texel1 = texture2D( tBase, vUv );","vec4 texel2 = texture2D( tAdd, vUv );","gl_FragColor = texel1 + texel2 * amount;","}"].join("\n")}}])}.call(this),function(){"use strict";angular.module("sc2App").service("SoundCloudService",["$window","$http","$q","soundcloudConfig","UserService",function(a,b,c,d,e){this.connect=function(){var f,g,h;return g=c.defer(),f=a.SC,h={},f.initialize({client_id:d.apiKey,redirect_uri:d.redirectUri,scope:"non-expiring"}),f.connect(function(){return h.token=f.accessToken(),b.get(d.apiBaseUrl+"/me",{params:{oauth_token:h.token}}).success(function(a){return h.user=a,g.resolve(h),e.setUser(h)})}),g.promise},this.getPlaylistTracks=function(a){var f,g,h,i;for(i=[],f=0,g=a.length;g>f;f++)h=a[f],i.push(b.get(d.apiBaseUrl+"/playlists/"+h+"/tracks",{params:{oauth_token:e.userObj.token}}));return c.all(i)},this.res=function(a,c,f,g){return g.oauth_token=e.userObj.token,b({method:c,url:d.apiBaseUrl+"/me/"+a+f,params:g})},this.getProperStreamUrl=function(a){var c;return c=d.apiBaseUrl+"/i1/tracks/"+a+"/streams?client_id="+d.apiKey,b.get(c).then(function(a){var b;return b={vis:a.data.hasOwnProperty("http_mp3_128_url")?a.data.http_mp3_128_url.indexOf("ec-media")>-1:void 0,url:a.data.http_mp3_128_url}})},this.getWaveformData=function(a){var c;return c=a.split("/"),a=d.waveformServiceUrl+c[3].replace("png","json"),b.get(a)},this.downloadUrl=function(a){return d.apiBaseUrl+"/tracks/"+a+"/download?client_id="+d.apiKey}}])}.call(this),function(){"use strict";angular.module("sc2App").service("StreamService",["$q","$window","HelperService","SoundCloudService","UserService","$rootScope",function(a,b,c,d,e,f){var g,h,i;i=void 0,g=50,h=0,this.stream=[],this.playlists={ids:[],items:[]},this.getTrackProperties=function(a){return function(a,b,e){var f;return f=[],Number.isInteger(e)?(a.origin=a,f=e>=0?[e,b]:[b]):f=[b],a.origin?{index:f,isNew:moment(a.created_at,"YYYY/MM/DD HH:mm:ss ZZ").isAfter(moment(c.lastFetch)),scDate:a.created_at,created:c.customDate(a.created_at,"MMMM DD YYYY"),type:a.type||a.kind,repost:a.type?a.type.indexOf("repost")>-1:!1,singleTrackPlaylist:!1,title:a.origin.title,scid:a.origin.id,duration:a.origin.duration,durationFormatted:c.duration(a.origin.duration),stream:a.origin.stream_url,streamable:a.origin.streamable,waveform:a.origin.waveform_url,artwork:a.origin.artwork_url,buy:a.origin.purchase_url,downloadlink:a.origin.downloadable?d.downloadUrl(a.origin.id):!1,link:a.origin.permalink_url,username:a.origin.user.username,userlink:a.origin.user.permalink_url,avatar:a.origin.user.avatar_url,description:a.origin.description?c.description(a.origin.description):!1,favList:0>e}:(console.log(a),"mysterious unreadable track...")}}(this),this.load=function(a){return function(){return d.res("activities/tracks/affiliated","get","",{limit:g,cursor:i}).then(function(b){var c,e,f,g,j;for(i=b.data.next_href.split("cursor=")[1],f=b.data.collection,j=c=0,e=f.length;e>c;j=++c)g=f[j],g=a.getTrackProperties(g,j+h,!1),a.stream.push(g),("playlist"===g.type||"playlist-repost"===g.type)&&a.playlists.ids.push(g.scid);return h+=b.data.collection.length,d.getPlaylistTracks(a.playlists.ids).then(function(b){var c,d,e,f,h,i,j,k,l,m,n,o;for(d=0,f=b.length;f>d;d++)k=b[d],a.playlists.items.push(k);for(n=a.stream,e=0,h=n.length;h>e;e++)if(g=n[e],c=a.playlists.ids.indexOf(g.scid),c>-1){for(g.tracks=[],o=a.playlists.items[c].data,m=j=0,i=o.length;i>j;m=++j)l=o[m],l=a.getTrackProperties(l,m,g.index[0]),g.tracks.push(l);1===g.tracks.length&&(g.singleTrackPlaylist=!0)}return a.stream[a.stream.length-1].last=!0}),a.stream})}}(this)}])}.call(this),function(){"use strict";angular.module("sc2App").service("FavoritesService",["$q","$window","HelperService","SoundCloudService","UserService",function(a,b,c,d,e){var f,g;f=50,g=0,this.favorites=[],this.getTrackProperties=function(a){return function(a,b,e){var f;return f=[],Number.isInteger(e)?(a.origin=a,f=e>=0?[e,b]:[b]):f=[b],a.origin?{index:f,isNew:moment(a.created_at,"YYYY/MM/DD HH:mm:ss ZZ").isAfter(moment(c.lastFetch)),scDate:a.created_at,created:c.customDate(a.created_at,"MMMM DD YYYY"),type:a.type||a.kind,repost:a.type?a.type.indexOf("repost")>-1:!1,singleTrackPlaylist:!1,title:a.origin.title,scid:a.origin.id,duration:a.origin.duration,durationFormatted:c.duration(a.origin.duration),stream:a.origin.stream_url,streamable:a.origin.streamable,waveform:a.origin.waveform_url,artwork:a.origin.artwork_url,buy:a.origin.purchase_url,downloadlink:a.origin.downloadable?d.downloadUrl(a.origin.id):!1,link:a.origin.permalink_url,username:a.origin.user.username,userlink:a.origin.user.permalink_url,avatar:a.origin.user.avatar_url,description:a.origin.description?c.description(a.origin.description):!1,favList:0>e}:(console.log(a),"mysterious unreadable track...")}}(this),this.load=function(a){return function(){return d.res("favorites","get","",{limit:f,offset:g}).then(function(b){var c,d,e,h,i;for(console.log(b),i=b.data,c=e=0,h=i.length;h>e;c=++e)d=i[c],a.favorites.push(a.getTrackProperties(d,c,-1)),a.favorites[c].favoriteFlag=!0;return g+=f,a.favorites})}}(this)}])}.call(this),function(){"use strict";angular.module("sc2App").service("FollowingsService",["$q","$window","HelperService","SoundCloudService","UserService",function(a,b,c,d,e){var f,g;f=50,g=0,this.followings=[],this.load=function(a){return function(){return d.res("followings","get","",{limit:f,offset:g}).then(function(b){var d,e,h,i;for(console.log(b),h=b.data.collection,d=0,e=h.length;e>d;d++)i=h[d],i.description&&(i.description=c.description(i.description)),i.followingFlag=!0,a.followings.push(i);return g+=f,a.followings})}}(this)}])}.call(this),function(){"use strict";angular.module("sc2App").service("ContentService",["$window","StreamService","FavoritesService","FollowingsService",function(a,b,c,d){var e;e=a.moment,this.streamInit=!0,this.favoritesInit=!0,this.followingsInit=!0,this.player={currentTrack:void 0,previousTrack:void 0},this.content={stream:b.stream,favorites:c.favorites,followings:d.followings},this.loadStream=function(a){return function(){return a.streamInit=!1,b.load()}}(this),this.loadFavorites=function(a){return function(){return c.load()}}(this),this.loadFollowings=function(a){return function(){return d.load()}}(this)}])}.call(this),function(){"use strict";angular.module("sc2App").service("HelperService",["$window","$filter","$localStorage",function(a,b,c){var d,e,f,g;d=a.moment,f="YYYY/MM/DD HH:mm:ss ZZ",g=/((("|>)?\b(https?):\/\/|www)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi,c.$default({lastFetch:""}),e=d().format("YYYY-MM-DD HH:mm:ss"),this.lastFetch=c.lastFetch,this.duration=function(a){var b,c,e;return b=d.duration(a).get("hours"),c=d.duration(a).get("minutes"),e=d.duration(a).get("seconds"),1>e/10&&(e="0"+e),0!==b?(1>c/10&&(c="0"+c),b+":"+c+":"+e):c+":"+e},this.customDate=function(a,b){return"ago"===b?d(a).fromNow():d(a,f).format(b)},this.description=function(a){var b;return b=a.replace(g,function(a){return a.indexOf('"')>-1||a.indexOf(">")>-1?a:(0===a.indexOf("www")&&(a="http://"+a),'<a target="_blank" href="'+a+'">'+a+"</a>")}),b.replace(/\n/g,"<br>")},this.getCount=function(a){return function(d,f){var g,h;return a.lastFetch=c.lastFetch=e,h=b("filter")(d,{isNew:!0}),g=f===!1?{newCount:b("filter")(h,{repost:!1}).length,streamLength:b("filter")(d,{repost:!1}).length+" ("+d.length+")"}:{newCount:h.length,streamLength:d.length}}}(this)}])}.call(this),function(){"use strict";angular.module("sc2App").factory("animation",["$window","audioContext","CanvasService","AdditiveBlendShader",function(a,b,c,d){var e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A;return w=this,x=30,h=28,q=15,p=void 0,t=void 0,m=void 0,i=void 0,e=a.THREE,j=void 0,v=void 0,z=void 0,u=void 0,l=void 0,n=void 0,y=void 0,s=void 0,w.requestId=null,f=new Uint8Array(b.analyser.frequencyBinCount),r=new Uint8Array(b.osc.frequencyBinCount),k=c.canvases(),k.oscContext.lineWidth=3,k.oscContext.strokeStyle="#ffffff",k.analyserTopContext.strokeStyle="#ffffff",k.analyserTopContext.lineCap="round",k.analyserTopContext.lineWidth=4,w.x3dscope=!1,w.animate=function(){return w.requestId=a.requestAnimationFrame(w.animate),w.x3dscope===!0?A():g()},w.killAnimation=function(){return w.requestId?(a.cancelAnimationFrame(w.requestId),w.requestId=void 0):void 0},o=function(){var a,b,c,f,g,h,k,o,p,q,r,w,x;for(x=800,w=600,f=document.getElementById("webGLWrapper"),j=new e.PerspectiveCamera(1,x/w,1,1e6),j.position.z=3e4,v=new e.Scene,h=new e.LineBasicMaterial({color:65535}),o=new e.Geometry,k=0;1024>k;)o.vertices.push(new e.Vector3(1*k,0,0)),k++;return s=new e.Line(o,h),v.add(s),s.position.x=-512,s.position.y=-100,v.add(new e.AmbientLight(16777215)),z=new e.WebGLRenderer,z.setSize(1920,955),f.appendChild(z.domElement),c=3,r={minFilter:e.LinearFilter,magFilter:e.LinearFilter,format:e.RGBFormat,stencilBufer:!1},p=new e.WebGLRenderTarget(x,w,r),t=new e.EffectComposer(z,p),u=new e.RenderPass(v,j),g=new e.ShaderPass(e.CopyShader),b=new e.BloomPass(3,8,2,512),t.addPass(u),t.addPass(g),t.addPass(b),n=new e.ShaderPass(e.HorizontalBlurShader),y=new e.ShaderPass(e.VerticalBlurShader),n.uniforms.h.value=c/x,y.uniforms.v.value=c/w,g=new e.ShaderPass(e.CopyShader),q=new e.WebGLRenderTarget(x/4,w/4,r),m=new e.EffectComposer(z,q),m.addPass(g),m.addPass(u),m.addPass(b),m.addPass(n),m.addPass(y),m.addPass(n),m.addPass(y),i=new e.EffectComposer(z),a=new e.ShaderPass(d),a.uniforms.tBase.value=t.renderTarget1,a.uniforms.tAdd.value=m.renderTarget1,a.uniforms.amount.value=0,i.addPass(a),l=new e.ShaderPass(e.FilmShader),l.uniforms.grayscale.value=0,l.uniforms.sIntensity.value=.8,l.uniforms.sCount.value=w,i.addPass(l),l.renderToScreen=!0},o(),A=function(){var a;for(b.osc.getByteTimeDomainData(r),a=0;1024>a;)s.geometry.vertices[a].y=r[a],a++;return s.geometry.verticesNeedUpdate=!0,t.render(.1),m.render(.1),i.render(.1)},g=function(){var a,c;for(k.analyserTopContext.clearRect(0,0,450,100),b.analyser.getByteFrequencyData(f),k.analyserTopContext.beginPath(),a=0;q>a;){for(p=(f[3+8*a]/2.56).toFixed(),c=0;p/6>c;)k.analyserTopContext.moveTo(a*x+2,104-6*c),k.analyserTopContext.lineTo(a*x-2+h,104-6*c),++c;++a}for(k.analyserTopContext.stroke(),k.oscContext.clearRect(0,0,k.oscContext.canvas.width,100),b.osc.getByteTimeDomainData(r),k.oscContext.beginPath(),a=0;a<k.oscContext.canvas.width/2;)k.oscContext.lineTo(2*a,r[a]/2.56),a++;return k.oscContext.stroke()},w}])}.call(this),function(){"use strict";angular.module("sc2App").directive("player",["audioContext","HelperService","CanvasService","ContentService","SoundCloudService","animation","$filter","$rootScope",function(a,b,c,d,e,f,g,h){return{restrict:"A",link:function(i,j,k){var l,m,n,o,p,q,r,s,t,u,v;return u=a.player,i.playerData={},i.fsScope=!1,r=function(){return i.$apply(function(){return i.playerData.currentTime=u.currentTime,i.playerData.currentTimeFormatted=b.duration(1e3*u.currentTime)})},n=function(){return i.$apply(function(){return i.playerData.currentTrack.isPlaying=!1,i.settings.autoAdvance&&d.player.nextTrack?(i.playerData.playingIndex=d.player.nextTrack.index,d.player.previousTrack=d.player.currentTrack,d.player.currentTrack=d.player.nextTrack,d.player.currentTrack.isPlaying=!0,i.$emit("playTrack")):(i.playerData.playingIndex=null,i.playerData.currentTime=0,f.killAnimation())})},m=function(){return i.$apply(function(){return i.playerData.duration=u.duration,i.playerData.seeking=!1})},q=function(){return i.$apply(function(){return i.playerData.seeking=!0})},p=function(){return i.$apply(function(){return i.playerData.seeking=!1})},o=function(){var a,b,c,d,e;for(d=[],e=u.buffered,a=0,b=e.length;b>a;a++)c=e[a],d.push([u.buffered.start(c),u.buffered.end(c)]);return d.length?i.$apply(function(){return i.playerData.buffered=d[d.length-1][1]}):void 0},v=function(){return u.addEventListener("timeupdate",r,!1),u.addEventListener("canplay",m,!1),u.addEventListener("seeking",q,!1),u.addEventListener("seeked",p,!1),u.addEventListener("progress",o,!1),u.addEventListener("ended",n,!1)},t=function(){return i.playerData.currentTrack.isPlaying=!0,u.play(),f.requestId?void 0:f.animate()},s=function(){return u.pause(),f.killAnimation()},l=function(){var a,b,c,e,f,h;for(a=g("filter")(d.content.stream,i.streamFilter),b=!1,f=[],c=0,e=a.length;e>c;c++){if(h=a[c],b){h.hasOwnProperty("tracks")?d.player.nextTrack=h.tracks[0]:d.player.nextTrack=h;break}h.index[0]===d.player.currentTrack.index[0]?h.hasOwnProperty("tracks")?h.index[1]===d.player.currentTrack.index[1]?f.push(b=!0):f.push(void 0):f.push(b=!0):f.push(void 0)}return f},i.$on("playTrack",function(b){return l(),d.player.previousTrack&&angular.equals(d.player.currentTrack.index,d.player.previousTrack.index)?t():(d.player.previousTrack&&(s(),d.player.previousTrack.isPlaying=!1),e.getProperStreamUrl(d.player.currentTrack.scid).then(function(b){return b.url?(b.vis?(u=a.player,h.status.access=!1):(u=a.playerNoVis,h.status.access="Limited access to track, visualizers disabled"),v(),i.playerData.currentTrack=d.player.currentTrack,i.playerData.vis=b.vis,u.src=b.url,t()):(h.status.access="No playable stream exists",i.playerData.currentTrack=void 0,u.src="",s())}),e.getWaveformData(d.player.currentTrack.waveform).then(function(a){return c.drawWaveform(a.data.samples,c.canvases().waveformContext,"rgba(255,255,255,0.05)"),c.drawWaveform(a.data.samples,c.canvases().waveformBufferContext,"rgba(255,255,255,0.15)"),c.drawWaveform(a.data.samples,c.canvases().waveformProgressContext,"#ffffff")}))}),i.$on("pauseTrack",function(){return i.playerData.currentTrack.isPlaying=!1,s()}),i.$on("seekTrack",function(a,b){return u.currentTime=(b*u.duration).toFixed()}),i.$on("seekPreview",function(a,c){return i.seekCursor={xpos:c.xpos,time:b.duration(c.xpos*u.duration*1e3/c.width)}}),i.helpers={setVolume:function(b){return a.gain.value=b*b/1e4},toggleOsc:function(a){return!i.status.access&&i.playerData.playingIndex&&a?i.fsScope=f.x3dscope=!0:i.fsScope=f.x3dscope=!1}}}}}])}.call(this),function(){"use strict";angular.module("sc2App").directive("canvasContext",["CanvasService",function(a){return{restrict:"A",link:function(b,c,d){return c.append(a.canvases()[d.canvasContext].canvas)}}}])}.call(this),function(){"use strict";angular.module("sc2App").directive("theme",["$localStorage",function(a){return{restrict:"A",link:function(b){return b.theme=a.settings.theme,b.toggleThemeChanger=function(){return b.themeChanger=!b.themeChanger},b.changeTheme=function(a,c){return c?b.theme.color=a:b.theme.bgr=a}}}}])}.call(this),function(){"use strict";angular.module("sc2App").directive("repeatFinished",["$timeout",function(a){return{restrict:"A",link:function(b){return b.$last===!0?a(function(){return b.$emit("ngRepeatFinished")}):void 0}}}])}.call(this),function(){"use strict";angular.module("sc2App").controller("pageCtrl",["$scope","$rootScope","$document","$window","$state","UserService","SoundCloudService","ContentService","$localStorage","HelperService","appVersion",function(a,b,c,d,e,f,g,h,i,j,k){var l;return a.user=f.userObj,a.info=k,b.status={loading:!1,error:!1},i.$default({settings:{streamFilter:{repost:"",singleTrackPlaylist:""},theme:{bgr:"default",color:"light"},autoAdvance:!1}}),a.content=h.content,a.user&&(a.user.lastFetch=j.customDate(j.lastFetch,"ago")),a.$on("userStateChanged",function(){return a.user=f.userObj}),a.connect=function(){return g.connect().then(function(b){return a.$broadcast("connected")})},a.logout=function(){return f.logout(),d.location.reload()},a.streamFilter=i.settings.streamFilter,a.streamFilter.title="",a.settings=i.settings,a.$on("$stateChangeSuccess",function(){return"main"===e.current.name&&e.go("main.stream"),a.activeTab=e.current.name.split(".")[1]}),a.getTimes=function(a){return new Array(a)},l=function(b){var c;return c=void 0,c=isNaN(b[1])?a.content[a.activeTab][b[0]]:a.content[a.activeTab][b[0]].tracks[b[1]]},a.helpers={updateCounters:function(){return a.counters=j.getCount(a.content.stream,a.streamFilter.repost),a.counters.newCount>0?c[0].title="("+a.counters.newCount+") sc2":c[0].title="sc2"}},a.controlAudio={play:function(b){return h.player={previousTrack:h.player.currentTrack,currentTrack:l(b)},a.$broadcast("playTrack")},pause:function(){return a.$broadcast("pauseTrack")},seekTo:function(b){var c;return c=(void 0===b.offsetX?b.layerX:b.offsetX)/b.target.offsetWidth,a.$broadcast("seekTrack",c)},seekPreview:function(b){var c;return c=void 0===b.offsetX?b.layerX:b.offsetX,a.$broadcast("seekPreview",{xpos:c,width:b.target.clientWidth})}}}])}.call(this),function(){"use strict";angular.module("sc2App").controller("streamCtrl",["$scope","SoundCloudService","ContentService","UserService","HelperService",function(a,b,c,d,e){var f,g,h;return c.streamInit&&(a.content={stream:[]}),f=void 0,h=void 0,g=void 0,a.$on("connected",function(){return a.loadData()}),a.loadData=function(){return a.status.loading=!0,c.loadStream().then(function(b){return b.hasOwnProperty("status")?a.status={loading:!1,error:b.status+" "+b.statusText}:a.content.stream=b,a.helpers.updateCounters()})},a.$on("ngRepeatFinished",function(){return a.status.loading=!1}),a.like=function(a,c){var d,e;return d=getPlaylistOrTrackData(c),e=d.scid,b.res("favorites/",a,e,{}).then(function(b){return 201===b.status?d.favoriteFlag=!0:200===b.status&&"delete"===a?d.favoriteFlag=!1:void 0})},a.follow=function(c,d){var e;return e=a.followings[d].id,b.res("followings/",c,e,{}).then(function(b){return 201===b.status?a.followings[d].followingFlag=!0:200===b.status&&"delete"===c?a.followings[d].followingFlag=!1:void 0})},d.userObj&&c.streamInit?a.loadData():void 0}])}.call(this),function(){"use strict";angular.module("sc2App").controller("favoritesCtrl",["$scope","$document","SoundCloudService","ContentService","UserService","HelperService",function(a,b,c,d,e,f){return a.content={favorites:[]},d.loadFavorites().then(function(b){return console.log(b),a.content.favorites.push.apply(a.content.favorites,b)})}])}.call(this),function(){"use strict";angular.module("sc2App").controller("followingsCtrl",["$scope","$document","SoundCloudService","ContentService","UserService","HelperService",function(a,b,c,d,e,f){return a.content={followings:[]},d.loadFollowings().then(function(b){return console.log(b),a.content.followings.push.apply(a.content.followings,b)})}])}.call(this);