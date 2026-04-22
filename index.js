const M_WIDTH=450, M_HEIGHT=800;
const  app ={stage:{},renderer:{}}, assets={}, objects={}, some_process={},my_data={}

let familyData = {};
let total_y=0
let cur_root_id=0
let s3
let drag=0
let need_render=1
const qm_rt={}

irnd = function(min,max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

const rel_map={
	0:{
		'p':['отец','мать'],
		'pp':['дед.','бабуш.'],
		'ppc':['дядя','тетя'],
		'ppp':['прадед.','прабаб.'],
		's':['муж','жена'],
		'c':['сын','дочь'],
		'cs':['зять','невестка'],
		'cc':['внук','внучка'],
		'pc':['брат','сестра'],
		'ppcc':['2-брат','2-сестра'],
		'pcs':['зять','невестка'],
		'pcc':['плем-к','плем-ца'],
		'ppccc':['2-плем-к.','2-плем-ца'],
		'pppcc':['2-дядя','2-тетя'],
		'pppccc':['3-брат','3-сестра'],
		'sp':['тесть','теща'],
		'spc':['шурин','свояч-ца'],
		'pppc':['2-дед-ка','2-баб-ка'],
		'*':['это вы','это вы']		
		
	},
	1:{
		'p':['отец','мать'],
		'pp':['дед.','бабуш.'],
		'ppc':['дядя','тетя'],
		'ppp':['прадед.','прабаб.'],
		's':['муж','жена'],
		'c':['сын','дочь'],
		'cs':['зять','невестка'],
		'cc':['внук','внучка'],
		'pc':['брат','сестра'],
		'ppcc':['2-брат','2-сестра'],
		'pcs':['зять','невестка'],
		'pcc':['плем-к','плем-ца'],
		'ppccc':['2-плем-к.','2-плем-ца'],
		'pppcc':['2-дядя','2-тетя'],
		'pppccc':['3-брат','3-сестра'],
		'sp':['свекор','свекровь'],
		'spc':['деверь','золовка'],
		'pppc':['2-дед-ка','2-баб-ка'],
		'*':['это вы','это вы']	
	}

}

safe_ls=function(key, val) {
	try {
		if (val === null || val===undefined) {
			const data = localStorage.getItem(key);
			if (!data) return null;
			try {
				return JSON.parse(data);
			} catch {
				return data;
			}
		} else {
			const storageValue = typeof val === 'string' ? val : JSON.stringify(val)
			localStorage.setItem(key, storageValue);
			return true;
		}
	} catch (e) {
		console.error(`Storage error for key "${key}":`, e);
		return null;
	}
}

anim3={

	c1: 1.70158,
	c2: 1.70158 * 1.525,
	c3: 1.70158 + 1,
	c4: (2 * Math.PI) / 3,
	c5: (2 * Math.PI) / 4.5,
	empty_spr : {x:0,visible:false,ready:true, alpha:0},

	slots: new Array(20).fill().map(u => ({obj:{},on:0,block:true,params_num:0,p_resolve:0,progress:0,vis_on_end:false,tm:0,params:new Array(10).fill().map(u => ({param:'x',s:0,f:0,d:0,func:this.linear}))})),

	any_on() {

		for (let s of this.slots)
			if (s.on&&s.block)
				return true
		return false;
	},

	wait(seconds){
		return this.add(this.empty_spr,{x:[0,1,'linear']}, false, seconds);
	},

	linear(x) {
		return x
	},

	kill_anim(obj) {

		for (var i=0;i<this.slots.length;i++){
			const slot=this.slots[i];
			if (slot.on&&slot.obj===obj){
				slot.p_resolve(2);
				slot.on=0;
			}
		}
	},

	easeOutBack(x) {
		return 1 + this.c3 * Math.pow(x - 1, 3) + this.c1 * Math.pow(x - 1, 2);
	},

	easeOutElastic(x) {
		return x === 0
			? 0
			: x === 1
			? 1
			: Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * this.c4) + 1;
	},

	easeOutSine(x) {
		return Math.sin( x * Math.PI * 0.5);
	},

	easeOutQuart(x){
		return 1 - Math.pow(1 - x, 4);
	},

	easeOutCubic(x) {
		return 1 - Math.pow(1 - x, 3);
	},

	flick(x){

		return Math.abs(Math.sin(x*6.5*3.141593));

	},

	easeInBack(x) {
		return this.c3 * x * x * x - this.c1 * x * x;
	},

	easeInQuad(x) {
		return x * x;
	},

	easeOutBounce(x) {
		const n1 = 7.5625;
		const d1 = 2.75;

		if (x < 1 / d1) {
			return n1 * x * x;
		} else if (x < 2 / d1) {
			return n1 * (x -= 1.5 / d1) * x + 0.75;
		} else if (x < 2.5 / d1) {
			return n1 * (x -= 2.25 / d1) * x + 0.9375;
		} else {
			return n1 * (x -= 2.625 / d1) * x + 0.984375;
		}
	},

	easeInCubic(x) {
		return x * x * x;
	},

	ease3peaks(x){

		if (x < 0.16666) {
			return x / 0.16666;
		} else if (x < 0.33326) {
			return 1-(x - 0.16666) / 0.16666;
		} else if (x < 0.49986) {
			return (x - 0.3326) / 0.16666;
		} else if (x < 0.66646) {
			return 1-(x - 0.49986) / 0.16666;
		} else if (x < 0.83306) {
			return (x - 0.6649) / 0.16666;
		} else if (x >= 0.83306) {
			return 1-(x - 0.83306) / 0.16666;
		}
	},

	ease2back(x) {
		return Math.sin(x*Math.PI);
	},

	easeInOutCubic(x) {

		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	},

	easeInOutBack(x) {

		return x < 0.5
		  ? (Math.pow(2 * x, 2) * ((this.c2 + 1) * 2 * x - this.c2)) / 2
		  : (Math.pow(2 * x - 2, 2) * ((this.c2 + 1) * (x * 2 - 2) + this.c2) + 2) / 2;
	},

	shake(x) {

		return Math.sin(x*2 * Math.PI);


	},

	add (obj, inp_params, vis_on_end, time, block) {

		//Р В Р’ВµР РЋР С“Р В Р’В»Р В РЎвЂ Р РЋРЎвЂњР В Р’В¶Р В Р’Вµ Р В РЎвЂР В РўвЂР В Р’ВµР РЋРІР‚С™ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В РЎВР В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР РЏ Р В РўвЂР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р В РЎвЂўР В РЎвЂ“Р В РЎвЂў Р РЋР С“Р В РЎвЂ”Р РЋР вЂљР В Р’В°Р В РІвЂћвЂ“Р РЋРІР‚С™Р В Р’В° Р РЋРІР‚С™Р В РЎвЂў Р В РЎвЂўР РЋРІР‚С™Р В РЎВР В Р’ВµР В Р вЂ¦Р РЋР РЏР В Р’ВµР В РЎВ Р В Р’ВµР В Р’Вµ
		anim3.kill_anim(obj);


		let found=false;
		//Р В РЎвЂР РЋРІР‚В°Р В Р’ВµР В РЎВ Р РЋР С“Р В Р вЂ Р В РЎвЂўР В Р’В±Р В РЎвЂўР В РўвЂР В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р РЋР С“Р В Р’В»Р В РЎвЂўР РЋРІР‚С™ Р В РўвЂР В Р’В»Р РЋР РЏ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В РЎВР В Р’В°Р РЋРІР‚В Р В РЎвЂР В РЎвЂ
		for (let i = 0; i < this.slots.length; i++) {

			const slot=this.slots[i];
			if (slot.on) continue;

			found=true;

			obj.visible = true;
			obj.ready = false;

			//Р В Р’В·Р В Р’В°Р В Р вЂ¦Р В РЎвЂўР РЋР С“Р В РЎвЂР В РЎВ Р В Р’В±Р В Р’В°Р В Р’В·Р В РЎвЂўР В Р вЂ Р РЋРІР‚в„–Р В Р’Вµ Р В РЎвЂ”Р В Р’В°Р РЋР вЂљР В Р’В°Р В РЎВР В Р’ВµР РЋРІР‚С™Р РЋР вЂљР РЋРІР‚в„– Р РЋР С“Р В Р’В»Р В РЎвЂўР РЋРІР‚С™Р В Р’В°
			slot.on=1;
			slot.params_num=Object.keys(inp_params).length;
			slot.obj=obj;
			slot.vis_on_end=vis_on_end;
			slot.block=block===undefined;
			slot.speed=0.01818 / time;
			slot.progress=0;

			//Р В РўвЂР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В Р’В»Р РЋР РЏР В Р’ВµР В РЎВ Р В РўвЂР В Р’ВµР В Р’В»Р РЋР Р‰Р РЋРІР‚С™Р РЋРЎвЂњ Р В РЎвЂќ Р В РЎвЂ”Р В Р’В°Р РЋР вЂљР В Р’В°Р В РЎВР В Р’ВµР РЋРІР‚С™Р РЋР вЂљР В Р’В°Р В РЎВ Р В РЎвЂ Р РЋРЎвЂњР РЋР С“Р РЋРІР‚С™Р В Р’В°Р В Р вЂ¦Р В Р’В°Р В Р вЂ Р В Р’В»Р В РЎвЂР В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В РЎвЂўР В Р’Вµ Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р В РЎвЂўР В Р’В¶Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ
			let ind=0;
			for (const param in inp_params) {

				const s=inp_params[param][0];
				let f=inp_params[param][1];
				const d=f-s;


				const func_name=inp_params[param][2];
				const func=anim3[func_name].bind(anim3);
				if (func_name === 'ease2back'||func_name==='shake') f=s;

				slot.params[ind].param=param;
				slot.params[ind].s=s;
				slot.params[ind].f=f;
				slot.params[ind].d=d;
				slot.params[ind].func=func;
				ind++;

				//Р РЋРІР‚С›Р В РЎвЂР В РЎвЂќР РЋР С“Р В РЎвЂР РЋР вЂљР РЋРЎвЂњР В Р’ВµР В РЎВ Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В РЎвЂўР В Р’Вµ Р В Р’В·Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂ”Р В Р’В°Р РЋР вЂљР В Р’В°Р В РЎВР В Р’ВµР РЋРІР‚С™Р РЋР вЂљР В Р’В°
				obj[param]=s;
			}

			return new Promise(resolve=>{
				slot.p_resolve = resolve;
			});
		}
	привет
	
		console.log("Р В РЎв„ўР В РЎвЂўР В Р вЂ¦Р РЋРІР‚РЋР В РЎвЂР В Р’В»Р В РЎвЂР РЋР С“Р РЋР Р‰ Р РЋР С“Р В Р’В»Р В РЎвЂўР РЋРІР‚С™Р РЋРІР‚в„– Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В РЎВР В Р’В°Р РЋРІР‚В Р В РЎвЂР В РЎвЂ");

		//Р РЋР С“Р РЋР вЂљР В Р’В°Р В Р’В·Р РЋРЎвЂњ Р В Р’В·Р В Р’В°Р В РЎвЂ”Р В РЎвЂР РЋР С“Р РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ Р В РЎвЂќР В РЎвЂўР В Р вЂ¦Р В Р’ВµР РЋРІР‚РЋР В Р вЂ¦Р РЋРІР‚в„–Р В Р’Вµ Р В РЎвЂ”Р В Р’В°Р РЋР вЂљР В Р’В°Р В РЎВР В Р’ВµР РЋРІР‚С™Р РЋР вЂљР РЋРІР‚в„– Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В РЎВР В Р’В°Р РЋРІР‚В Р В РЎвЂР В РЎвЂ
		for (let param in params)
			obj[param]=params[param][1];
		obj.visible=vis_on_end;
		obj.alpha = 1;
		obj.ready=true;


	},

	process () {

		for (var i = 0; i < this.slots.length; i++) {
			const slot=this.slots[i];
			const obj=slot.obj;
			if (slot.on) {
				need_render=1
				slot.progress+=slot.speed;

				for (let i=0;i<slot.params_num;i++){

					const param_data=slot.params[i];
					const param=param_data.param;
					const s=param_data.s;
					const d=param_data.d;
					const func=param_data.func;
					slot.obj[param]=s+d*func(slot.progress);
				}
								
				if (slot.progress>=0.999) {

					for (let i=0;i<slot.params_num;i++){
						const param=slot.params[i].param;
						const f=slot.params[i].f;
						slot.obj[param]=f;
					}

					slot.obj.visible=slot.vis_on_end;
					if(!slot.vis_on_end) slot.obj.alpha=1;

					slot.obj.ready=true;
					slot.p_resolve(1);
					slot.on = 0;
				}
			}
		}
	}
}

sound={

	on : 1,

	play(snd_res,is_loop,volume) {

		if (!this.on||document.hidden)
			return;

		if (!assets[snd_res])
			return;

		assets[snd_res].play({loop:is_loop||false,volume:volume||1});

	},

}

auth2={

	load_script(src) {
	  return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.type = 'text/javascript'
		script.onload = resolve
		script.onerror = reject
		script.src = src
		document.head.appendChild(script)
	  })
	},

	get_random_char() {

		const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		return chars[irnd(0,chars.length-1)];

	},

	get_random_uid_for_local (prefix) {

		let uid = prefix;
		for ( let c = 0 ; c < 12 ; c++ )
			uid += this.get_random_char();

		//сохраняем этот uid в локальном хранилище
		try {
			localStorage.setItem('family_tree_uid', uid);
		} catch (e) {alert(e)}

		return uid;

	},

	get_random_name (uid) {

		const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		const rnd_names = ['Gamma','Chime','Dron','Perl','Onyx','Asti','Wolf','Roll','Lime','Cosy','Hot','Kent','Pony','Baker','Super','ZigZag','Magik','Alpha','Beta','Foxy','Fazer','King','Kid','Rock'];

		if (uid !== undefined) {

			let e_num1 = chars.indexOf(uid[3]) + chars.indexOf(uid[4]) + chars.indexOf(uid[5]) + chars.indexOf(uid[6]);
			e_num1 = Math.abs(e_num1) % (rnd_names.length - 1);
			let name_postfix = chars.indexOf(uid[7]).toString() + chars.indexOf(uid[8]).toString() + chars.indexOf(uid[9]).toString() ;
			return rnd_names[e_num1] + name_postfix.substring(0, 3);

		} else {

			let rnd_num = irnd(0, rnd_names.length - 1);
			let rand_uid = irnd(0, 999999)+ 100;
			let name_postfix = rand_uid.toString().substring(0, 3);
			let name =	rnd_names[rnd_num] + name_postfix;
			return name;
		}
	},

	async get_country_code() {

		let country_code = ''
		try {
			let resp1 = await fetch("https://ipinfo.io/json?token=63f43de65702b8");
			let resp2 = await resp1.json();
			country_code = resp2.country || '';
		} catch(e){}

		return country_code;

	},

	async get_country_code2() {

		let country_code = ''
		try {
			let resp1 = await fetch("https://api.ipgeolocation.io/ipgeo?apiKey=1efc1ba695434f2ab24129a98a72a1d4");
			let resp2 = await resp1.json();
			country_code = resp2.country_code2 || '';
		} catch(e){}

		return country_code;

	},

	search_in_local_storage () {

		//ищем в локальном хранилище
		let local_uid = null;

		try {
			local_uid = localStorage.getItem('family_tree_uid');
		} catch (e) {alert(e)}

		if (local_uid !== null) return local_uid;

		return undefined;

	},

	async init() {

		if (game_platform === 'YANDEX') {

			async function initSDK() {
				try {
					await new Promise((resolve, reject) => {
						var s = document.createElement('script');
						s.src = "https://sdk.games.s3.yandex.net/sdk.js";
						s.async = true;
						s.onload = resolve;
						s.onerror = reject;
						document.body.appendChild(s);
					});
					console.log("SDK loaded successfully");
				} catch (error) {
					console.error("Failed to load SDK:", error);
				}
			}

			await initSDK();

			let _player;

			try {
				window.ysdk = await YaGames.init({});
				_player = await window.ysdk.getPlayer();
			} catch (e) { alert(e)};

			my_data.uid = _player.getUniqueID().replace(/[\/+=]/g, '');
			my_data.name = _player.getName();
			my_data.orig_pic_url = _player.getPhoto('medium');

			if (my_data.orig_pic_url === 'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/0/islands-retina-medium')
				my_data.orig_pic_url = 'mavatar'+my_data.uid;

			if (my_data.name === '')
				my_data.name = this.get_random_name(my_data.uid);

			//убираем ё
			my_data.name=my_data.name.replace(/ё/g, 'е');
			my_data.name=my_data.name.replace(/Ё/g, 'Е');

			//выбор языка по яндексу
			LANG=window.ysdk.environment.i18n.lang==='ru'?0:1;

			//загружаем покупки
			window.ysdk.getPayments({ signed: true }).then(_payments => {
				yndx_payments = _payments;
			}).catch(err => {
				alert('Ошибка при загрузке покупок!')
			})

			return;
		}

		if (game_platform === 'VK') {

			try {
				await this.load_script('https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js')||await this.load_script(COM_URL+'/vkbridge.js');
			} catch (e) {alert(e)};

			let _player;

			try {
				await vkBridge.send('VKWebAppInit');
				_player = await vkBridge.send('VKWebAppGetUserInfo');
			} catch (e) {alert(e)};


			my_data.name 	= _player.first_name + ' ' + _player.last_name;
			my_data.uid 	= 'vk'+_player.id;
			my_data.orig_pic_url = _player.photo_100;

			//убираем ё
			my_data.name=my_data.name.replace(/ё/g, 'е');
			my_data.name=my_data.name.replace(/Ё/g, 'Е');

			return;

		}

		if (game_platform === 'RS') {

			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('RS_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.orig_pic_url = 'mavatar'+my_data.uid;
			return;
		}

		if (game_platform === 'PG') {			
								
			try {
				await bridge.initialize()			
			} catch (e) { alert(e)};
			
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('PG_');
			my_data.name = bridge.player.name||this.get_random_name(my_data.uid);
			my_data.orig_pic_url = 'mavatar'+my_data.uid;				
			ad.reg_pg_ad()
		}

		if (game_platform === 'GOOGLE_PLAY') {

			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('GP_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.orig_pic_url = 'mavatar'+my_data.uid;
			return;
		}

		if (game_platform === 'DEBUG') {

			my_data.name = my_data.uid = 'debug' + prompt('Отладка. Введите ID', 100);
			my_data.orig_pic_url = 'https://www.tgu-dpo.ru/wp-content/uploads/2023/04/%D0%94%D0%B5%D0%B2%D1%83%D1%88%D0%BA%D0%B0-%D1%84%D0%BE%D1%82%D0%BE%D0%B3%D1%80%D0%B0%D1%84%D0%B8%D1%80%D1%83%D0%B5%D1%82.jpg'
			return;
		}

		if (game_platform === 'UNKNOWN') {

			//если не нашли платформу
			//alert('Неизвестная платформа. Кто Вы?')
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('LS_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.orig_pic_url = 'https://www.tgu-dpo.ru/wp-content/uploads/2023/04/%D0%94%D0%B5%D0%B2%D1%83%D1%88%D0%BA%D0%B0-%D1%84%D0%BE%D1%82%D0%BE%D0%B3%D1%80%D0%B0%D1%84%D0%B8%D1%80%D1%83%D0%B5%D1%82.jpg'
		}
		
		if (game_platform === 'PLAYMINIGAMES') {

			//если не нашли платформу
			//alert('Неизвестная платформа. Кто Вы?')
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('PMG_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.orig_pic_url = 'mavatar'+my_data.uid;
		}
	},

	get_country_from_name(name){

		const have_country_code=/\(.{2}\)/.test(name);
		if(have_country_code)
			return name.slice(-3, -1);
		return '';

	}

}

class new_person_card_class extends PIXI.Container{

	constructor(params={}){
		
		super()
		
		this.id=0
		this.lev=0
		this.fold=0
		this.type=''
		this.rel_dist=0
		this.wait_for_up=0
		
		const t=this
		
		if (params.bcg){
			this.bcg=new PIXI.Sprite(assets.card_bcg_short2)
			this.bcg.width=270
			this.bcg.height=80			
		}

		
		this.photo=new PIXI.Graphics()
		this.photo.clear()
		this.photo.beginFill(0x333355)
		this.photo.drawRoundedRect(0,0,60,60,15)
		this.photo.endFill()
		this.photo.x=10
		this.photo.y=10
		this.photo.interactive=params.interactive||false
		
		this.photo.pointerup=function(e){
			if(!t.wait_for_up){
				t.wait_for_up=0
				return
			}
			add_dlg.activate(t,'edit')
			tree.up(e)
		}
		this.photo.pointerdown=function(e){
			t.wait_for_up=1
			tree.down(e)
		}
		
		this.frame=new PIXI.Sprite(assets.card_frame)
		this.frame.width=270
		this.frame.height=80
		
		this.name_t=new PIXI.BitmapText('', {fontName: 'bahnschrift48',fontSize: 18,align: 'center'})
		this.name_t.tint=0xEFEBDE		
		this.name_t.y=params.name_y||22
		
		if (params.quick_menu){
			
			
			this.quick_menu=new PIXI.Sprite()
			this.quick_menu.x=142
			this.quick_menu.y=25
			//this.quick_menu.anchor.set(1,1)
			this.quick_menu.width=150*0.8
			this.quick_menu.height=60*0.8
			this.quick_menu.interactive=true
			
			this.quick_menu.pointerdown=function(e){
				t.wait_for_up=1
				tree.down(e)
			}				
			
			this.quick_menu.pointerup=function(e){
							
				if(!t.wait_for_up){
					t.wait_for_up=0
					tree.up(e)	
					return
				}
				t.quick_menu_down(e)
				tree.up(e)	

			}

		}
		
		this.rel_t=new PIXI.BitmapText('', {fontName: 'bahnschrift48',fontSize: 20})
		this.rel_t.y=params.rel_t_y||57
		this.rel_t.tint=0x59CEC9

		this.age_t=new PIXI.BitmapText('', {fontName: 'bahnschrift48',fontSize: 19})
		this.age_t.y=params.age_t_y||40
		this.age_t.tint=0xEFC7A4
		
		this.id_t=new PIXI.BitmapText('0', {fontName: 'bahnschrift48',fontSize: 18,align: 'center'})
		this.id_t.anchor.set(0.5,0.5)
		this.id_t.x=15
		this.id_t.y=15
		this.id_t.tint=0xffffff
		
		this.visible=false
		this.align(params.align||'right')

		if (params.bcg) this.addChild(this.bcg)

		this.addChild(this.photo,this.name_t,this.age_t,this.rel_t)
		//this.addChild(this.id_t)
		if (this.quick_menu) this.addChild(this.quick_menu)
		
	}

	init(type){
		
		if(type==='rel'){
			this.photo.interactive=true
			this.visible=true
			this.empty_photo()
			this.id=-1
			const t=this
			//this.bcg.pointerup=(e)=>{
			//	//rel.card_down(t)
			//}
			this.photo.pointerdown=(e)=>{
				rel.card_down(t)
			}
		}		
	}

	align(dir){
		
		if (dir==='left'){
			
			this.name_t.anchor.set(1,0.5)
			this.name_t.x=0
			
			this.age_t.anchor.set(1,0.5)
			this.age_t.x=0
			
			this.rel_t.anchor.set(1,0.5)
			this.rel_t.x=0
			
		}
		
		if (dir==='right'){
			
			this.name_t.anchor.set(0,0.5)
			this.name_t.x=75
				
			this.age_t.anchor.set(0,0.5)
			this.age_t.x=75
				
			this.rel_t.anchor.set(0,0.5)
			this.rel_t.x=75
			
		}
		
	}

	quick_menu_down(e){
		
		need_render=1
		if (drag>10) return
		
		const mx=e.data.global.x/app.stage.scale.x
		const my=e.data.global.y/app.stage.scale.y
		
		const quick_menu_scr_x=(this.quick_menu.x+this.x)*objects.cards_cont.scale_xy+objects.cards_cont.x
		const quick_menu_scr_w=this.quick_menu.width*objects.cards_cont.scale_xy
		const quick_menu_cell_w=quick_menu_scr_w/3
		
		const mx_in_quick_menu=mx-quick_menu_scr_x
		const btn_id=Math.floor(mx_in_quick_menu/quick_menu_cell_w)
		
		if (btn_id===0)
			this.show_tree()
		if (btn_id===1)
			add_dlg.activate(this,this.type==='spouse'?'add_child':'add_spouse')
		if (btn_id===2)
			this.fold_node()

	}

	update_photo(t){
		
		let texture=t||photo_loader.cache[this.id]
		
		//если нет текстуры то добавляем в загрузку, потом применится
		if(!texture){
			photo_loader.add({id:this.id})
			texture=assets.nophoto
		}
		
		//texture=await PIXI.Texture.fromURL(multiavatar(irnd(10,99999)));

		const PHOTO_SIZE=60
		const tw = texture.width
		const th = texture.height
		const scaleX = PHOTO_SIZE / tw
		const scaleY = PHOTO_SIZE / th
		const matrix = new PIXI.Matrix()
		matrix.scale(scaleX, scaleY)
		
		this.photo.clear()
		this.photo.lineStyle({width:1.5,color:0xD9D9D9,cap:'round'})
		this.photo.beginTextureFill({texture,matrix})
		this.photo.drawRoundedRect(0,0,PHOTO_SIZE,PHOTO_SIZE,16)
		need_render=1
		
	}	

	show_tree(){
		
		const f_data=familyData[this.id]
		if (f_data.empty){
			sys_msg.add('Нет данных!')
			return
		}
		objects.cards_cont.y=0
		objects.cards_cont.x=0
		cur_root_id=this.id				
		tree.show_root_person(({person_id:this.id,auto_fold:1}))	

	}

	fold_node(){
		
		this.fold=1-this.fold		
		familyData[this.id].fold=this.fold
		
		tree.show_root_person({person_id:cur_root_id,auto_fold:0})
	}

	empty_photo(){
		this.name_t.text=''
		this.age_t.text=''
		this.rel_t.text=''
		this.id_t.text=''
		this.update_photo(assets.add_person_img)
		
	}

	fill_data(person_data, type){
				
		this.photo.alpha=1
		
		this.id_t.text=person_data.id
		this.age_t.text=person_data.bd
		
		const rel_no_sex=rel_map[person_data.sex||0][person_data.rel]		
		const rel_with_sex=rel_no_sex?.[person_data.sex]
		this.rel_t.text=rel_with_sex||''
				
		//const russianNames=namesByGender[person_data.sex]
		//this.name_t.text=russianNames[irnd(0,russianNames.length-1)]
		
		this.name_t.set2(person_data.name,150)			
		this.quick_menu.interactive=true
		this.type=type			
				
		if (type==='parent'){
			
			if (person_data.empty){
				this.age_t.alpha=0.4
				this.name_t.text=''
				this.age_t.text='Родитель (нет данных)'
				this.quick_menu.texture=null
				this.quick_menu.interactive=false
			}else{
				this.age_t.alpha=1
				//this.name_t.set2(person_data.name,130)				
				this.quick_menu.texture=qm_rt.qm_tree				
			}
			
			this.bcg.texture=assets.card_bcg_short

			return
		}
					
		if (type==='spouse'){
			
			if (person_data.kids.length){
				if (person_data.fold)
					this.quick_menu.texture=qm_rt.qm_kid_f
				else
					this.quick_menu.texture=qm_rt.qm_kid	
				this.bcg.texture=assets.card_bcg
			}else{
				this.quick_menu.texture=qm_rt.qm_kid_nof
				this.bcg.texture=assets.card_bcg_short
			}
		}
		
		if (type==='kid'){
			if (person_data.spouses.length){
				if (person_data.fold)
					this.quick_menu.texture=qm_rt.qm_spouse_f
				else
					this.quick_menu.texture=qm_rt.qm_spouse	
				this.bcg.texture=assets.card_bcg
			}else{
				this.quick_menu.texture=qm_rt.qm_spouse_nof
				this.bcg.texture=assets.card_bcg_short
			}
		}		
	}

	getFullYears(dateString) {
		// Parse DD.MM.YYYY
		const parts = dateString.split(".");
		const birthDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
		const today = new Date();

		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();

		// Adjust if birthday hasn't occurred yet this year
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
		age--;
		}
		return age;
	}

	getYearString(age) {
		const n = Math.abs(age) % 100;
		const n1 = n % 10;
		if (n > 10 && n < 20) return "лет";
		if (n1 > 1 && n1 < 5) return "года";
		if (n1 === 1) return "год";
		return "лет";
	}

	set(person_id){
		
		this.id=person_id
		this.update_photo()
		
		const pdata=familyData[this.id]
		
		
		
		//const russianNames=namesByGender[pdata.sex]
		//this.name_t.text=russianNames[irnd(0,russianNames.length-1)]
		
		this.name_t.set2(pdata.name,140)
		
		this.id_t.text=this.id
		
		const rel_no_sex=rel_map[pdata.sex||0][pdata.rel]		
		const rel_with_sex=rel_no_sex?.[pdata.sex]
		this.rel_t.text=rel_with_sex||''
		
		const bd=pdata.bd	
		const dd=pdata.dd	
		const today = new Date()
		
		if (bd&&!dd){
			const age=this.getFullYears(bd)		
			this.age_t.text=bd+' ('+age+this.getYearString(age)+')'
		}

		if (bd&&dd) this.age_t.text=bd+' - '+dd
		if (!bd&&dd) this.age_t.text=' - '+dd
		if (!bd&&!dd) this.age_t.text=''
		
	}

}

class dr_card_class extends PIXI.Container{
	
	constructor(params={}){
		
		super()
		
		this.bcg=new PIXI.Sprite(assets.dr_card_bcg)
		
		this.photo=new PIXI.Graphics()
		this.photo.x=20

		this.name_t=new PIXI.BitmapText('', {fontName: 'bahnschrift48',fontSize: 25,align: 'center'})
		this.name_t.tint=0xffffff	
		this.name_t.y=5
		this.name_t.x=90
				
		this.bd_t=new PIXI.BitmapText('', {fontName: 'bahnschrift48',fontSize: 25})
		this.bd_t.y=30
		this.bd_t.x=90
		this.bd_t.tint=0xaaaaaa
		
		this.dr_t=new PIXI.BitmapText('', {fontName: 'bahnschrift48',fontSize: 25,align:'center',lineSpacing:35})
		this.dr_t.y=30
		this.dr_t.x=350
		this.dr_t.anchor.set(0.5,0.5)
		this.dr_t.tint=0xdddd11
		
		
		this.addChild(this.bcg,this.photo,this.name_t,this.bd_t,this.dr_t)
		
	}
	
	getYearString(age) {
		const n = Math.abs(age) % 100;
		const n1 = n % 10;
		if (n > 10 && n < 20) return "лет";
		if (n1 > 1 && n1 < 5) return "года";
		if (n1 === 1) return "год";
		return "лет";
	}

	getFullYears(dateString) {
		// Parse DD.MM.YYYY
		const parts = dateString.split(".");
		const birthDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
		const today = new Date();

		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();

		// Adjust if birthday hasn't occurred yet this year
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
		age--;
		}
		return age;
	}
	
	update_photo(t){
		
		let texture=t||photo_loader.cache[this.id]
		
		//если нет текстуры то добавляем в загрузку, потом применится
		if(!texture){
			photo_loader.add({id:this.id})
			texture=assets.nophoto
		}

		const PHOTO_SIZE=60
		const tw = texture.width
		const th = texture.height
		const scaleX = PHOTO_SIZE / tw
		const scaleY = PHOTO_SIZE / th
		const matrix = new PIXI.Matrix()
		matrix.scale(scaleX, scaleY)
		
		this.photo.clear()
		this.photo.lineStyle({width:1.5,color:0xD9D9D9,cap:'round'})
		this.photo.beginTextureFill({texture,matrix})
		this.photo.drawCircle(PHOTO_SIZE*0.5,PHOTO_SIZE*0.5,PHOTO_SIZE*0.5)
		need_render=1
		
	}
		
	set(person_id,days_to_dr){
		
		this.id=person_id
		this.update_photo()
		
		const pdata=familyData[this.id]
		
		this.name_t.set2(pdata.name,180)
		
		const rel_no_sex=rel_map[pdata.sex||0][pdata.rel]		
		const rel_with_sex=rel_no_sex?.[pdata.sex]||''
		
		const bd=pdata.bd	
		const dd=pdata.dd	
		
		if (bd&&!dd){
			
			//это сколько лет
			const age=this.getFullYears(bd)		
			this.bd_t.text=bd+' | ' +rel_with_sex
					
			
			const new_age=age+1
			let info_str=days_to_dr?'Через\n'+dr_dlg.getDayWord(days_to_dr)+'':'Сегодня!'
			info_str+=('\n'+new_age+this.getYearString(new_age))
			this.dr_t.text=info_str
		
		}
		
		

		
	}
	
}

async function upload_texture(texture_cache_id){
	
	const texture=photo_loader.cache[texture_cache_id]
	const jpegBase64=await app.renderer.plugins.extract.base64(new PIXI.Sprite(texture),'image/jpeg');
	
	s3.upload(
	{Bucket:'gen-tree',Key:my_data.uid+'/img'+texture_cache_id,Body:jpegBase64},
		function(err, data) {
		if (err) console.error(err);
		else console.log('Upload success:', data);
	});
	
}

photo_loader={
	
	queue:[],
	done:[],
	cache:[],
	loader:new PIXI.Loader(),
	on:0,
	add(data){
		
		
		if (this.queue.find(v=>v.id===data.id)||this.done.includes(data.id)) return
		this.queue.push(data)
		
		//если нет очереди то запускаем процесс
		if (this.on===0)
			this.process()
		
	},
	
	async load_from_url(id,pic_url){
		
		this.loader.add('my_pic',pic_url)
		await new Promise(r=>this.loader.load(r))
		this.cache[id]=this.loader.resources['my_pic'].texture
		
	},
	
	async process(){	
		
		this.on=1
		const data=this.queue.shift()
		const id=data.id
		const url=data.url
		const img_name=my_data.uid+'/img'+id
		this.done.push(id)
		
		
		if(!objects.load_info_cont.visible)
			anim3.add(objects.load_info_cont,{y:[-100,objects.load_info_cont.sy,'linear']}, true, 0.25)
		objects.load_info_t.text='Загрузка...'+this.queue.length
		need_render=1
		
		try{
			
			if (url){
				this.loader.add(img_name,url)
				await new Promise(r=>this.loader.load(r))
				this.cache[id]=this.loader.resources[img_name].texture
			}else{
				
				const data = await s3.getObject({Bucket: 'gen-tree',Key:img_name}).promise()
				if (data){
					this.loader.add(img_name,data.Body.toString())
					await new Promise(r=>this.loader.load(r))
					this.cache[id]=this.loader.resources[img_name].texture
				}				
			}

			
		}catch(e){
			this.cache[id]=assets.nophoto
			console.log(e)
		}
		
		for (const card of objects.cards_pool){			
			//обновляем карточку если нужно
			if (card.visible){
				if (card.id===id){
					card.update_photo()
				}
			}
		}
		
		if (objects.pl_cont.visible){
			for (const card of objects.pl_cards_pool){			
				//обновляем карточку если нужно
				if (card.id===id){
					card.update_photo()
				}
			}
		}
		
		if (objects.dr_cont.visible){
			for (const card of objects.dr_cards_pool){			
				//обновляем карточку если нужно
				if (card.id===id){
					card.update_photo()
				}
			}
		}
		
		if (objects.rel_cont.visible){
			for (const card of objects.rel_cards_pool){			
				//обновляем карточку если нужно
				if (card.id===id){
					card.update_photo()
				}
			}
		}
		
		if (id===0){
			if (!objects.mm_my_avatar.loaded){
				objects.mm_my_avatar.set_texture(this.cache[id])
				objects.mm_my_avatar.loaded=1
			}				
		}
				
		this.on=0
		
		//если очередь еще есть то запускаем заново
		if (this.queue.length)
			this.process()
		else
			anim3.add(objects.load_info_cont,{y:[objects.load_info_cont.y, -100,'linear']}, false, 0.25)
	}
	
}

tree={
	
	fold_lev:3,
	auto_fold:0,
	cur_tar_id:0,
	update_on:0,
	graph:{},
	cont_start_pos:{x:0,y:0},
	touches:{},
	touches_num:0,
	initialPinchDist:null,
	start_scale:0,
	start_center:0,
	
	make_rel_graph(tar_id=0) {
		
		this.graph={}

		for (const ind of Object.keys(familyData)){
			const p=familyData[ind]
			this.graph[p.id] = this.graph[p.id] || [];

			for (const kid of p.kids || []) {
				this.graph[p.id].push({ id: kid, rel: "c" });
			}

			for (const parent of p.parents || []) {
				this.graph[p.id].push({ id: parent, rel: "p" });
			}

			for (const spouse of p.spouses || []) {
				this.graph[p.id].push({ id: spouse, rel: "s" });
			}
		}
	
		Object.values(familyData).forEach(p=>{			
			if (p.id==tar_id){
				p.rel_dist=0
				p.rel='*'
			}

			else{
				const rel_data=this.get_rel(tar_id,p.id)[0]
				p.rel_dist=rel_data.length-1
				p.rel=rel_data.join('')
			}
		})
	
	},
	
	get_rel(start, target) {
		
		const queue = [[start,[],[]]]
		const visited = new Set()

		while (queue.length) {
			const [current, path, id_path] = queue.shift()

			if (current === target) return [path, id_path]

			visited.add(current)

			for (const edge of this.graph[current] || []) {
				if (!visited.has(edge.id)) {
					queue.push([edge.id,[...path, edge.rel],[...id_path,edge.id]])
				}
			}
		}

		return [[],0]
	},
	
	link(id1,id2){		
		

		const person1=familyData[id1]
		const person2=familyData[id2]
		
		for (const tar_spouse of person2.spouses){
			if(!person1.spouses.includes(tar_spouse))
				person1.spouses.push(tar_spouse)
		}
		
		if (person2.parents[0]){
			if(familyData[person2.parents[0]].name)
				person1.parents[0]=person2.parents[0]
		
			if(familyData[person2.parents[0]].name)
				person1.parents[1]=person2.parents[1]		
		}
		
		for (const tar_kid of person2.kids){
			if(!person1.kids.includes(tar_kid))
				person1.kids.push(tar_kid)
		}


		const id2_spouses=person2.spouses
		const id2_parents=person2.parents
		const id2_kids=person2.kids
		
		for (let s_id of id2_spouses){
			const spouce_person=familyData[s_id]		
			const index = spouce_person.spouses.indexOf(id2)
			if (index !== -1) 
			  spouce_person.spouses[index] = id1		
		}
		
		for (let p_id of id2_parents){
			const parent_person=familyData[p_id]		
			const index = parent_person.kids.indexOf(id2)
			if (index !== -1) 
			  parent_person.kids[index] = id1		
		}
		
		for (let k_id of id2_kids){
			const kid_person=familyData[k_id]		
			const index = kid_person.parents.indexOf(id2)
			if (index !== -1) 
			  kid_person.parents[index] = id1		
		}
		

		tree.save()
		show_root_person(({person_id:cur_root_id}))
	},
	
	change_auto_fold_lev(d){
			
		const new_lev=this.fold_lev+d
		if (new_lev<1 || new_lev>6)
			return
			
		this.fold_lev=new_lev
		objects.controls_fold_t.text=this.fold_lev
		
		for (const ind of Object.keys(familyData)){
			const pdata=familyData[ind]
			pdata.fold=0
		}
		
		this.show_root_person({person_id:cur_root_id,auto_fold:1,cont_y:0,cont_x:0})
		
	},
	
	get_new_id(){		
		const ids = Object.keys(familyData)
		return +ids[ids.length-1]+1
	},
	
	get_spouses(p_id){
		
		let p_data=familyData[p_id]
		if (p_data.link)
			pdata=familyData[pdata.link]
		const spouses=[]
		for (const s_id of p_data.spouses){		
			spouses.push(familyData[s_id])		
		}
		return spouses	
	},

	get_kids(sp_1,sp_2){
		
		
		const kids_1=familyData[sp_1].kids
		const kids_2=familyData[sp_2].kids
		const shared_kids = kids_1.filter(value => kids_2.includes(value));
		const kids=[]
		for (let kid_id of shared_kids)
			kids.push(familyData[kid_id])
		return kids	
	},

	show_parents(id){
		
		let parents=familyData[id].parents
		
		if(parents[0]===undefined){
			
			const parent1id=tree.get_new_id()	
			familyData[parent1id]={id:parent1id,name:'',gen:0,empty:1,fold:0,sex:0,spouses:[],parents:[],kids:[id]}
			const parent1=familyData[parent1id]
			
			const parent2id=tree.get_new_id()	
			familyData[parent2id]={id:parent2id,name:'',gen:0,empty:1,fold:0,sex:1,spouses:[],parents:[],kids:[id]}
			const parent2=familyData[parent2id]
			
			parent1.spouses.push(parent2id)
			parent2.spouses.push(parent1id)

			familyData[id].parents.push(parent1id,parent2id)
			console.log(`созданые родители для ${id}  с ид ${parent1id} и ${parent2id}`)
			parents=familyData[id].parents
		}			
			
		let i=0
		for (const parent_id of parents){
			
			const parent_empty=familyData[parent_id].empty
			const p_card=objects.cards_pool.find(c=>!c.visible)
			p_card.visible=true
			p_card.y=i*70
			p_card.id=parent_id
			p_card.fill_data(familyData[parent_id],'parent')
			p_card.update_photo(parent_empty?assets.add_person_img:0)
	
			i++
		}
		
		objects.cards_lines.clear()	
		objects.cards_lines.beginFill(0x111133,0.5)
		objects.cards_lines.drawRect(0,0,1000,150)
		objects.cards_lines.endFill()		
		
		objects.cards_lines.lineStyle(2, 0xffffff)
		objects.cards_lines.moveTo(5,150)
		objects.cards_lines.lineTo(1000,150)

	},

	show_root_person(params={}){
				
		const person_id=params.person_id||0
		this.auto_fold=params.auto_fold||0
		
		if (params.cont_y!==undefined) objects.cards_cont.y=params.cont_y
		if (params.cont_x!==undefined) objects.cards_cont.x=params.cont_x
		
		objects.cards_cont.visible=true	
		objects.controls_cont.visible=true
		objects.controls_fold_t.text=this.fold_lev
		
		objects.cards_pool.find(c=>{
			c.visible=false
			c.wait_for_up=0			
		})
		
		//складываем все карточки
		if (this.auto_fold){
			for (const ind of Object.keys(familyData)){
				const pdata=familyData[ind]
				pdata.fold=1
			}			
		}
		
		if (familyData[person_id]){
			const parents=familyData[person_id].parents	
			this.show_parents(person_id)	
		}			
				
		total_y=150	
		this.show_person_rec(person_id,0,0)
	},

	show_person_rec(person_id,x,lev){
		
		let persons_shown=0
		const person_data=familyData[person_id]
		
		if (!person_data){
			console.log(`Persin with id=${person_id} does not exists`)
			return persons_shown
		}
		
		const root_card=objects.cards_pool.find(c=>!c.visible)
		root_card.visible=true
		if (this.auto_fold) person_data.fold=+(lev===this.fold_lev)		
		root_card.fill_data(person_data,'kid')
		root_card.y=total_y
		root_card.lev=lev		
		root_card.x=x
		root_card.id=person_id
		root_card.spouse_id=null
		root_card.update_photo()
		total_y+=65

		root_card.fold=person_data.fold
		persons_shown++
		
		if (person_data.fold) 	
			return persons_shown
		
		lev=lev+1
		const spouses=this.get_spouses(person_id)
		//if(!spouses.length)
			
		for (let spouse of spouses){
			
			const s_card=objects.cards_pool.find(c=>!c.visible)
			s_card.visible=true
			if (this.auto_fold) spouse.fold=+(lev===this.fold_lev)
			s_card.fill_data(spouse,'spouse')
			s_card.y=total_y
			s_card.x=x+20
			s_card.id=spouse.id
			s_card.lev=lev
			s_card.cur_spouse_id=person_id
			s_card.update_photo()
			total_y+=65
			
			s_card.fold=spouse.fold
			persons_shown++
			
			objects.cards_lines.lineStyle(2, 0xffff00)
			objects.cards_lines.moveTo(root_card.x+40,root_card.y+50)
			objects.cards_lines.lineTo(root_card.x+10,root_card.y+80)
			objects.cards_lines.lineTo(root_card.x+10,s_card.y+40)
			objects.cards_lines.lineTo(s_card.x+40,s_card.y+40)
			
			if (spouse.fold)
				continue			
			
			const kids=this.get_kids(person_id,spouse.id)
	
			let kids_shown=0
			for (let kid of kids){
				
				objects.cards_lines.lineStyle(2, 0xffffff)			
				objects.cards_lines.moveTo(s_card.x+40,s_card.y+40)			
				objects.cards_lines.lineTo(s_card.x+40,s_card.y+40+70+kids_shown*65)
				objects.cards_lines.lineTo(s_card.x+40+70,s_card.y+40+70+kids_shown*65)	
				
				const p_shown=tree.show_person_rec(kid.id,x+70,lev+1)
				persons_shown+=p_shown
				kids_shown+=p_shown
		
			}		
		}	
		
		return persons_shown
	},
	
	change_scale(dir){
		
		if (anim3.any_on())
			return
		
		const cur_scale=objects.cards_cont.scale_xy
		let new_scale=cur_scale+dir*0.1
		if (new_scale>2 || new_scale<0.1){
			return
		}
		new_scale=Math.round(new_scale * 10) / 10
		
		objects.controls_scale_t.text=+new_scale
		anim3.add(objects.cards_cont,{scale_xy:[cur_scale, new_scale,'linear']}, true, 0.15);
		
		objects.cards_cont.scale_xy=new_scale
		
	},
	
	vec_dist(v1,v2){

		const dx=v1.x-v2.x
		const dy=v1.y-v2.y
		return Math.sqrt(dx*dx+dy*dy)

	},
	
	mid_point(v1,v2){
		
		const x=(v1.x+v2.x)*0.5
		const y=(v1.y+v2.y)*0.5
		return {x,y}
		
	},
	
	down(e){
				
		need_render=1

		const mx=e.data.global.x/app.stage.scale.x
		const my=e.data.global.y/app.stage.scale.y
		const id=e.data.identifier
		console.log('down',mx,{id})
		
		
		const num_of_touches=Object.keys(this.touches).length
		
	
		
		//Ignore if already 2 touches active
		if (num_of_touches >= 2) {
			return
		}
		
		this.touches[id] = {
			start:{x:mx,y:my},
			prev:{x:mx,y:my},
			current:{x:mx,y:my},
			id
		}

		//console.log({id,mx,my})
	
		// if second finger added → initialize pinch
		const touch_ids=Object.keys(this.touches)
		if (touch_ids.length === 2) {

			//console.log(this.touches.map(v=>v.id))
			const d=this.vec_dist(this.touches[touch_ids[0]].current,this.touches[touch_ids[1]].current)
			this.initialPinchDist = d
			
			this.start_scale=objects.cards_cont.scale_xy
			
			this.cont_start_pos.x=objects.cards_cont.x
			this.cont_start_pos.y=objects.cards_cont.y
			
			this.start_center=this.mid_point(this.touches[touch_ids[0]].current,this.touches[touch_ids[1]].current)

		}
		
	},
	
	move(e){
		
		const mx=e.data.global.x/app.stage.scale.x
		const my=e.data.global.y/app.stage.scale.y
		
		//const id_orig=e.data.originalEvent.changedTouches[0].identifier
		const id=e.data.identifier
		//console.log('move',mx,{id})
		//if (!this.start_y) return
		if (!this.touches[id]) return
		
		need_render=1
		drag++
		

		// update touch state
		this.touches[id].prev.x=this.touches[id].current.x
		this.touches[id].prev.y=this.touches[id].current.y
		this.touches[id].current.x=mx
		this.touches[id].current.y=my

		const touchList = Object.values(this.touches)
		
		// 🟢 PINCH ZOOM
		if (touchList.length===2) {			
			
			const curDist = this.vec_dist(touchList[0].current,touchList[1].current)
			const scaleFactor = curDist / this.initialPinchDist
			let newScale = this.start_scale * scaleFactor
			if (newScale>2) newScale=2
			if (newScale<0.7) newScale=0.7
			objects.cards_cont.scale_xy = newScale
			
			const curCenter = this.mid_point(touchList[0].current,touchList[1].current)
			const dx = curCenter.x - this.start_center.x
			const dy = curCenter.y - this.start_center.y
			const scaleChange = newScale / this.start_scale
			
			objects.cards_cont.x = curCenter.x - (this.start_center.x - this.cont_start_pos.x) * scaleChange
			objects.cards_cont.y = curCenter.y - (this.start_center.y - this.cont_start_pos.y) * scaleChange
		
			if (objects.cards_cont.x>0)	objects.cards_cont.x=0			
			if (objects.cards_cont.y>0)	objects.cards_cont.y=0
		}

		// 🟢 DRAG
		if (touchList.length === 1) {
			const t = touchList[0]

			const d_vec = {
				x:t.current.x-t.prev.x,
				y:t.current.y-t.prev.y
			}

			objects.cards_cont.x += d_vec.x
			objects.cards_cont.y += d_vec.y
			
			if (objects.cards_cont.x>0)	objects.cards_cont.x=0			
			if (objects.cards_cont.y>0)	objects.cards_cont.y=0

		}		
		
	},
	
	up(e){
		
		const mx=e.data.global.x/app.stage.scale.x
		const my=e.data.global.y/app.stage.scale.y
		//const id_orig=e.data.originalEvent.changedTouches[0].identifier
		const id=e.data.identifier
		console.log('up',{id},{drag})
		delete this.touches[id]
			
		
		const num_of_touches=Object.keys(this.touches).length
		
		// reset pinch when fingers change
		if (num_of_touches < 2) this.initialPinchDist = null
		if (num_of_touches===0)	{
			console.log('up drag=0')
			drag=0
		}
		
		this.start_y=0
		
	},
			
	save(){		
		
		//return
		const new_obj=JSON.parse(JSON.stringify(familyData))
		
		for (const key of Object.keys(new_obj)){
			
			const obj=new_obj[key]
			
			delete obj.gen
			delete obj.rel			
			if (obj.empty)
				delete new_obj[key]			
		}
		
		s3.upload(
		{Bucket:'gen-tree',Key:my_data.uid+'/TREE',Body:JSON.stringify(new_obj)},
			function(err, data) {
			if (err) console.error(err);
			else console.log('Upload success:', data);
		});
		
	},
	
	check(){
		
		for (let person_id of Object.keys(familyData)){
			
			person_id=+person_id
			const person_data=familyData[person_id]
			
			const parents=person_data.parents
			const kids=person_data.kids
			const spouses=person_data.spouses
		
			for (let parent_id of parents){
				
				const parent=familyData[parent_id]
				if (!parent.kids.includes(person_id))
					console.log('Ошибка1',person_data,parent)
			}
			
			for (let kid_id of kids){
				
				const kid=familyData[kid_id]
				if (!kid.parents.includes(person_id))
					console.log('Ошибка2',person_data,kid)
			}
			
			for (let spouse_id of spouses){
				
				const spouse=familyData[spouse_id]
				if (!spouse.spouses.includes(person_id))
					console.log('Ошибка3',person_data,spouse)
			}
			
			
		
		}
		
	},
	
	mscroll(e){
		
		//скролл мышкой
		if(objects.pl_cont.visible) return
		objects.cards_cont.y-=20*Math.sign(e.deltaY)
		objects.cards_cont.y=Math.min(0,objects.cards_cont.y)
		need_render=1
	},
	
	close(){
		
		objects.cards_cont.visible=false
		objects.controls_cont.visible=false
		
	},
	
	async remove(uid) {
		
		try {
			let isTruncated = true;
			let continuationToken = null;
			let totalDeleted = 0;
			let objectsList = [];

			// First, list all objects
			while (isTruncated) {
				const params = {
					Bucket: 'gen-tree',
					Prefix: uid,
					ContinuationToken: continuationToken
				};

				const data = await s3.listObjectsV2(params).promise();
				
				if (data.Contents && data.Contents.length > 0) {
					objectsList.push(...data.Contents);
				}

				isTruncated = data.IsTruncated;
				continuationToken = data.NextContinuationToken;
			}

			console.log(`Found ${objectsList.length} objects to delete`);

			// Delete objects in batches of 1000
			for (let i = 0; i < objectsList.length; i += 1000) {
				const batch = objectsList.slice(i, i + 1000);
				const deleteParams = {
					Bucket: 'gen-tree',
					Delete: {
						Objects: batch.map(obj => ({ Key: obj.Key })),
						Quiet: false
					}
				};

				const deleteData = await s3.deleteObjects(deleteParams).promise();
				totalDeleted += deleteData.Deleted?.length || 0;
				
				console.log(`Deleted batch ${Math.floor(i/1000) + 1}: ${deleteData.Deleted?.length} objects`);
				
				// Optional: Add delay to avoid rate limiting
				if (i + 1000 < objectsList.length) {
					await new Promise(resolve => setTimeout(resolve, 100));
				}
			}

			console.log(`Successfully deleted ${totalDeleted} from bucket`);
			return totalDeleted;
			
		} catch (error) {
			console.error('Error deleting objects:', error);
			throw error;
		}
	},

}

controls={
	
	down(e){
		
		need_render=1
		const mx=e.data.global.x/app.stage.scale.x
		const my=e.data.global.y/app.stage.scale.y
				
		if (mx>395){
			tree.close()
			main_menu.activate()			
		}
				
		if (my<65){
			if(mx<315)
				tree.change_scale(-1)			
			if (mx>315&&mx<395)
				tree.change_scale(1)
		}
		
		if (my>65){
			if(mx<315)
				tree.change_auto_fold_lev(-1)			
			if (mx>315&&mx<395)
				tree.change_auto_fold_lev(1)
		}
		
	}
	
	
}

rel={
	
	start_y:0,
	start_x:0,
	start_y_cont:0,
	start_x_cont:0,
	left_x_cont:0,
	
	activate(){
		
		objects.rel_cards_lines.clear()
		objects.rel_cards_pool.forEach(c=>c.visible=false)
		objects.cards_cont.visible=false
		objects.controls_cont.visible=false
		
		objects.rel_cont.visible=true
		
		
		objects.rel_card1.init('rel')
		objects.rel_card2.init('rel')
		
		objects.rel_info_t.visible=true
		objects.rel_info_t.text='ВЫБЕРИТЕ 2 ПЕРСОНЫ ДЛЯ АНАЛИЗА РОДСТВА'

		need_render=1
		
	},
	
	async card_down(card){
		
		const person_id=await pl.get_person()
		if (person_id===-1) return
		card.set(person_id)
		rel.update()
	},
	
	draw_arrow(dir,card1,card2,color){		
		
		
		const shift_tri=3
		
		if (dir==='from_parent'){
			objects.rel_cards_lines.lineStyle({width: 2,color: color||0xffffff,cap: PIXI.LINE_CAP.ROUND})
			objects.rel_cards_lines.moveTo(card1.x+35,card1.y+65)
			objects.rel_cards_lines.lineTo(card1.x+35,card2.y+35)
			objects.rel_cards_lines.lineTo(card2.x,card2.y+35)
			
			objects.rel_cards_lines.beginFill(0x00FF00)
			objects.rel_cards_lines.moveTo(card2.x+5-shift_tri,card2.y+35)
			objects.rel_cards_lines.lineTo(card2.x-5-shift_tri,card2.y+40)
			objects.rel_cards_lines.lineTo(card2.x-5-shift_tri,card2.y+30)
			objects.rel_cards_lines.lineTo(card2.x+5-shift_tri,card2.y+35)
			objects.rel_cards_lines.endFill()
		}
		
		if (dir==='to_child'){
			objects.rel_cards_lines.lineStyle({width: 2,color: 0xffffff,cap: PIXI.LINE_CAP.ROUND})
			objects.rel_cards_lines.moveTo(card1.x+35,card1.y+5)
			objects.rel_cards_lines.lineTo(card1.x+35,card2.y+35)
			objects.rel_cards_lines.lineTo(card2.x,card2.y+35)
			
			objects.rel_cards_lines.beginFill(0x00FF00)
			objects.rel_cards_lines.moveTo(card2.x+5-shift_tri,card2.y+35)
			objects.rel_cards_lines.lineTo(card2.x-5-shift_tri,card2.y+40)
			objects.rel_cards_lines.lineTo(card2.x-5-shift_tri,card2.y+30)
			objects.rel_cards_lines.lineTo(card2.x+5-shift_tri,card2.y+35)
			objects.rel_cards_lines.endFill()
		}
		
		if (dir==='to_spouse'){
			objects.rel_cards_lines.lineStyle({width: 3,color: 0xffff00,cap: PIXI.LINE_CAP.ROUND})
			objects.rel_cards_lines.moveTo(card1.x+35,card1.y+35)
			objects.rel_cards_lines.lineTo(card2.x+35,card2.y+35)
		}
		
	},
	
	update(){
		
		objects.rel_tree_cont.y=0
		objects.rel_tree_cont.x=0
		
		objects.rel_cards_pool.forEach(c=>c.visible=false)
		objects.rel_cards_lines.clear()
		
		const id1=objects.rel_card1.id
		const id2=objects.rel_card2.id
		
		if(id1===-1) return
		if(id2===-1) return
		
		objects.rel_info_t.visible=false
		
		const rel_data=tree.get_rel(id1,id2)
		const rel_types=['*',...rel_data[0]]
		const rel_ids=[id1,...rel_data[1]]
		
		let cur_x=0
		let min_x=0
		let pos_data=[]
		let prv_rel=''
		let prv_card=0
		

		
		for (let i=0;i<rel_ids.length;i++){
			
			const rel=rel_types[i]
			const id=rel_ids[i]
			const card=objects.rel_cards_pool[i]			
			
			if (rel==='p') cur_x--
			if (rel==='c') cur_x++
			
			card.x=cur_x*60
			card.y=130+i*70
			
			
			if (rel==='p'&&prv_card) this.draw_arrow('to_child',card,prv_card)
			if (rel==='c'&&prv_card) {
				
				if (prv_rel==='p'&&i>1){
					
					const parent_id=rel_ids[i-1]
					const child1=familyData[rel_ids[i-2]]
					const child2=familyData[id]
					
					const p1=child1.parents
					const p2=child2.parents
					
					const same=(p1[0]===p2[0]&&p1[1]===p2[1])||(p1[0]===p2[1]&&p1[1]===p2[0])
					
					if(same)
						this.draw_arrow('from_parent',prv_card,card)
					else
						this.draw_arrow('from_parent',prv_card,card,0xff5555)
				}
				else					
					this.draw_arrow('from_parent',prv_card,card)
				
			}
			if (rel==='s'&&prv_card) this.draw_arrow('to_spouse',prv_card,card)

			//уточняем супругу
			if (rel==='c'&&prv_rel==='p'){
				
				
			}


			card.visible=true
			card.set(id)
			
			prv_card=card
			
			prv_rel=rel
			min_x=Math.min(min_x,cur_x)
		}
		
		this.left_x_cont=-min_x*60
		objects.rel_tree_cont.x=this.left_x_cont
	},
	
	down(e){
		
		need_render=1
		this.start_y=e.data.global.y/app.stage.scale.y
		this.start_x=e.data.global.x/app.stage.scale.x
		this.start_y_cont=objects.rel_tree_cont.y
		this.start_x_cont=objects.rel_tree_cont.x
		
		
	},
	
	move(e){
		
		
		if (!this.start_y) return
		
		need_render=1
		drag++
		const my=e.data.global.y/app.stage.scale.y
		const mx=e.data.global.x/app.stage.scale.x
		const dy=my-this.start_y
		const dx=mx-this.start_x
		objects.rel_tree_cont.y=this.start_y_cont+dy
		objects.rel_tree_cont.x=this.start_x_cont+dx
		if (objects.rel_tree_cont.y>0) objects.rel_tree_cont.y=0
		if (objects.rel_tree_cont.x>this.left_x_cont) objects.rel_tree_cont.x=this.left_x_cont
		
	},
	
	close_down(){
		
		main_menu.activate()
		objects.rel_cont.visible=false
		need_render=1
	},
	
	up(){
		
		//drag=0
		this.start_y=0
		
	}
	
}

pl={
	
	init:0,
	page_ind:0,
	num_of_pages:0,
	fd:[],
	selected_person_id:-1,
	type:'',
	resolver:()=>{},
	
	activate(type){
		
		this.type=type
		anim3.add(objects.pl_cont,{alpha:[0,1,'linear']}, true, 0.25)
		this.fd=Object.values(familyData).filter(d=>!d.empty)
		this.fd.sort((a, b) => a.name.localeCompare(b.name));
		
		this.num_of_pages=Math.ceil(this.fd.length/16)
		
		this.type=type
		if (type==='get'){			
			objects.pl_act_btn.texture=assets.pl_get_btn_img
		}
		
		if (type==='show'){			
			objects.pl_act_btn.texture=assets.pl_make_tree_btn_img
		}
			
		else
			
		
		//пока ничего не выбрано
		this.selected_person_id=-1
		objects.pl_selected.visible=false
		objects.pl_act_btn.visible=false
		
		if(!this.init){
			
			this.init=1			
			let i=0
			for (let x=0;x<2;x++){			
				for (let y=0;y<8;y++){
					const card=objects.pl_cards_pool[i]
					card.y=115+y*70
					card.x=x*215+5
					i++
				}
			}
		}

		this.update()
		
	},
	
	update(){
		
		need_render=1
		const start=this.page_ind*16
		const end=Math.min(this.page_ind*16+16,this.fd.length)
		
		//СЃРєСЂС‹РІР°РµРј СЃРЅР°С‡Р°Р»Р°
		objects.pl_cards_pool.forEach(c=>c.visible=false)
		
		let i=0
		for (let id=start;id<end;id++){
			
			const card=objects.pl_cards_pool[i]
			card.set(this.fd[id].id)
			card.visible=true
			i++
		}
		
	},
	
	list(d){
		

		const next_page_ind=this.page_ind+d
		if (next_page_ind<0) return
		if (next_page_ind>=this.num_of_pages) return
		
		this.selected_person_id=-1
		objects.pl_selected.visible=false
		objects.pl_act_btn.visible=false
		
		this.page_ind=next_page_ind
		this.update()
		
	},
	
	get_person(){
	
		this.activate('get')
		return new Promise(res=>{
			this.resolver=res
		})
		
	},
	
	act_btn_down(){
		
		if (this.selected_person_id<0) return
		
		need_render=1
		objects.cards_cont.y=0
		objects.cards_cont.x=0
		
		if (this.type==='get'){
			this.resolver(this.selected_person_id)
		}else{
			cur_root_id=this.selected_person_id
			tree.show_root_person({person_id:cur_root_id,auto_fold:1})	
		}		
		this.close()
	},
	
	edit_down(){
		need_render=1
		add_dlg.activate({id:this.selected_person_id},'edit')
	},
	
	close_down(){
		
		need_render=1
		this.resolver(-1)
		this.close()
		
		if (this.type==='show')
			main_menu.activate()
		
	},
	
	down(e){
		
		need_render=1
		const mx=e.data.global.x/app.stage.scale.x
		const my=e.data.global.y/app.stage.scale.y
		
		const iy=Math.floor(8*(my-120)/560)
		const ix=Math.floor(2*(mx-objects.pl_bcg.x)/objects.pl_bcg.width)
		
		//РµСЃР»Рё РІС‹С…РѕРґРёРј Р·Р° РіСЂР°РЅРёС†С‹
		if (iy<0||iy>7) return
		
		const selected_card=objects.pl_cards_pool[ix*8+iy]
		if(!selected_card.visible) return

		this.selected_person_id=selected_card.id
		
		objects.pl_selected.x=ix*225
		objects.pl_selected.y=iy*70+120
		objects.pl_selected.visible=true
		
		//СѓСЃС‚Р°РЅР°РІР»РёРІР°РµРј РєРЅРѕРїРєСѓ
		objects.pl_act_btn.visible=true

		
	},
	
	mscroll(e){
		
		if(!objects.pl_cont.visible) return
		
		//СЃРєСЂРѕР»Р» РјС‹С€РєРѕР№
		need_render=1
		this.list(Math.sign(e.deltaY))
		
	},
	
	close(){
		
		need_render=1
		anim3.add(objects.pl_cont,{alpha:[1, 0,'linear']}, false, 0.5)
	}	
	
}

add_dlg={
	
	id:0,
	card:0,
	type:'',
	updated:0,
	updated_photo:0,
	sex:0,
	resolver:0,
		
	async choosePhotoAndGetTexture() {
		// Create file input element
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.accept = 'image/*'; // Only allow image files
		
		// Create a promise that resolves when user selects a file
		return new Promise((res) => {
			fileInput.onchange = async (event) => {
				const file = event.target.files[0];
				
				if (!file) {
					res(0)
					return
				}
				
				try {
					// Create a URL for the selected file
					const imageUrl = URL.createObjectURL(file);
					
					// Create an image element
					const img = new Image();
					
					// Create a promise for image loading
					await new Promise((resolveImage, rejectImage) => {
						img.onload = resolveImage;
						img.onerror = rejectImage;
						img.src = imageUrl;
					});
					
					// Convert to PIXI.Texture
					const texture = PIXI.Texture.from(img);
					
					// Clean up the object URL to free memory
					URL.revokeObjectURL(imageUrl);
					
					res(texture);
				} catch (error) {
					res(0)
				}
			};
			
			// Handle cancellation
			fileInput.oncancel = () => {
				res(0)
			};
			
			// Trigger file picker
			fileInput.click();
		});
	},

	activate(card,type){		
		
		if (drag>10) return
		this.type=type		
		this.card=card		
		this.id=card?.id
		need_render=1
		
		if (type==='add_first_person'){			
			objects.add_dlg_info_t.text='Добавление первого человека'
			objects.add_dlg_name_t.text=''
			objects.add_dlg_bd_t.text=''
			objects.add_dlg_dd_t.text=''
			objects.add_dlg_opt_btn.visible=false
			this.set_sex(0)
			objects.add_dlg_photo.set_texture(assets.nophoto)
			
			objects.add_dlg_opt_btn.texture=assets.select_person_btn_img
			objects.add_dlg_opt_btn.pointerdown=()=>{this.select_person_down()}
		}

		if (type==='add_spouse'){	
		
			if (card.type!=='kid'){
				sys_msg.add('Ошибка...')		
				return
			}
			
			objects.add_dlg_opt_btn.visible=true
			objects.add_dlg_info_t.text='Добавление супруга (супруги)'
			objects.add_dlg_name_t.text=''
			objects.add_dlg_bd_t.text=''
			objects.add_dlg_dd_t.text=''			
			this.set_sex(1-familyData[card.id].sex)
			objects.add_dlg_photo.set_texture(assets.nophoto)
			
			objects.add_dlg_opt_btn.texture=assets.select_person_btn_img
			objects.add_dlg_opt_btn.pointerdown=()=>{this.select_person_down()}
		}
		
		if (type==='add_child'){	
		
			if (card.type!=='spouse'){
				sys_msg.add('Ошибка...')	
				return
			}
			
			objects.add_dlg_opt_btn.visible=true
			objects.add_dlg_info_t.text='Добавление ребенка'
			objects.add_dlg_name_t.text=''
			objects.add_dlg_bd_t.text=''
			objects.add_dlg_dd_t.text=''	
			this.set_sex(0)
			objects.add_dlg_photo.set_texture(assets.nophoto)
			
			objects.add_dlg_opt_btn.texture=assets.select_person_btn_img
			objects.add_dlg_opt_btn.pointerdown=()=>{this.select_person_down()}
		}
		
		if (type==='edit'){
			
			objects.add_dlg_opt_btn.visible=true
			objects.add_dlg_info_t.text='Редактирование'
			objects.add_dlg_name_t.text=familyData[this.id].name||''
			objects.add_dlg_bd_t.text=familyData[this.id].bd||''
			objects.add_dlg_dd_t.text=familyData[this.id].dd||''
			objects.add_dlg_photo.set_texture(photo_loader.cache[this.id]||assets.nophoto)
			this.set_sex(familyData[card.id].sex)
			
			objects.add_dlg_opt_btn.texture=assets.remove_person_btn_img
			objects.add_dlg_opt_btn.pointerdown=()=>{this.remove_person_down()}
		}		
		
		anim3.add(objects.add_dlg_cont,{alpha:[0,1,'linear']}, true, 0.25)
		
		this.updated_photo=0
		this.updated=0
	},
	
	set_sex(sex){
		
		this.sex=sex
		objects.add_dlg_sex.texture=assets[`sex${this.sex}img`]
		
	},
	
	sex_down(){		
		need_render=1
		const new_sex=1-this.sex
		this.set_sex(new_sex)
		this.updated=1
	},
	
	async edit_name_down(){

		const name=await keyboard.read(20)
		if(!name) return
		if (name.length>1){
			objects.add_dlg_name_t.text=name
			this.updated=1
		}
		need_render=1
		
	},
	
	async edit_bd_down(){
		
		const date_s=await dp.show()
		if(!date_s) return
		need_render=1
		objects.add_dlg_bd_t.text=date_s
		this.updated=1
		
	},
	
	async edit_dd_down(){
		
		const date_s=await dp.show()
		if(!date_s) return
		need_render=1
		objects.add_dlg_dd_t.text=date_s
		this.updated=1
		
	},
		
	async edit_photo_down(){
		
		const t=await this.choosePhotoAndGetTexture()
		if(!t) {
			sys_msg.add('Ошибка при загрузке фото...')	
			return
		}
		
		const t2=await editor.activate(t)
		if(!t2){
			sys_msg.add('Ошибка при обработке фото...')	
			return
		}
		objects.add_dlg_photo.set_texture(t2)
		this.updated=1
		this.updated_photo=t2
		need_render=1
		
	},
	
	async photo_down(){
		
		need_render=1
		objects.photo_preview_cont.visible=true
		objects.photo_preview.texture=photo_loader.cache[this.id]
		
		
	},
	
	preview_down(){
		
		need_render=1
		objects.photo_preview_cont.visible=false
		
	},
		
	show_tree_down(){
		
		const f_data=familyData[this.id]
		if (f_data.empty){
			sys_msg.add('Нет данных по данной персоне...')	
			return
		}
		
		cur_root_id=this.id
		tree.show_root_person({person_id:this.id,auto_fold:1})
		
	},
	
	async select_person_down(){
		
		this.close()
		const person_id=await pl.get_person()
		if(person_id<0) return
		
		
		if (person_id===this.id){
			sys_msg.add('Невозможно выбрать данную персону!')	
			return
		}
		
		if (this.type==='add_spouse'){
			
			if (familyData[this.id].spouses.includes(person_id)){
				sys_msg.add('Эти персоны уже супруги')
				return
			}
			
			if (familyData[person_id].spouses.includes(this.id)){
				sys_msg.add('Эти персоны уже супруги')
				return
			}
			
			familyData[this.id].spouses.push(person_id)
			familyData[person_id].spouses.push(this.id)
			
		}
		
		if (this.type==='add_child'){
			
			const new_kid_data=familyData[person_id]
			if (new_kid_data.parents.length){
				sys_msg.add('У этого человека уже есть родители!')
				return
			}
			
			if (new_kid_data.parents.includes(person_id)){
				sys_msg.add('Вы уже являетесь родителем этой персоны!')
				return
			}
			
			familyData[this.id].kids.push(person_id)
			familyData[this.card.cur_spouse_id].kids.push(person_id)
			
		}
		
		tree.save()
		tree.show_root_person({person_id:cur_root_id})
		console.log(person_id)
	},
	
	remove_person_down(){	

		if(this.type==='removed'){
			sys_msg.add('Удалено!')
			return	
		}
	
		if (familyData[this.id].kids.length){
			sys_msg.add('Нужно сначала удалить потомков!')
			return
		}
		
		if (this.id===0){
			sys_msg.add('Нельзя удалять основного человека')
			return
		}
		
		//удаляем ссылки
		for (let pdata of Object.values(familyData)){

			//как супруг у других людей
			const spouse_ind = pdata.spouses.indexOf(this.id)
			if (spouse_ind>-1){
				pdata.spouses.splice(spouse_ind, 1)
			}	
			
			//как ребенок
			const kid_ind = pdata.kids.indexOf(this.id)
			if (kid_ind>-1){
				pdata.kids.splice(kid_ind, 1)
			}			
		
		}
		
		delete familyData[this.id]
		this.updated=1

		s3.deleteObjects({Bucket:'gen-tree',Delete: {Objects: [{Key: my_data.uid+'/img'+this.id}]}}, function(err, data) {
			if (err) console.log(err, err.stack);
			else console.log('Deleted', data);
		});
				
		this.id=null
		this.type='removed'
		objects.add_dlg_opt_btn.visible=false
		objects.add_dlg_info_t.text='удалено'
		objects.add_dlg_name_t.text=''
		objects.add_dlg_bd_t.text=''
		objects.add_dlg_dd_t.text=''
		objects.add_dlg_photo.set_texture(assets.nophoto)
		need_render=1
	},
	
	ok_down(){

		
		if (this.type==='add_child'){	
		
			if (!this.updated){
				sys_msg.add('Нужно добавить имя ребенка!')
				return
			}
		
			const spouse_id=this.card.cur_spouse_id			
			
			const name=objects.add_dlg_name_t.text
			const bd=objects.add_dlg_bd_t.text
			const dd=objects.add_dlg_dd_t.text
			const sex=this.sex
			
			const new_id=tree.get_new_id()
			familyData[new_id]={id:new_id,name,spouses:[],sex:this.sex,parents:[spouse_id,this.id],fold:0,kids:[],bd,dd}
			familyData[this.id].kids.push(new_id)
			familyData[spouse_id].kids.push(new_id)
			if (this.updated_photo)	{
				photo_loader.cache[new_id]=new PIXI.Texture(this.updated_photo.baseTexture)				
				upload_texture(new_id)
			}	
		}		
		
		if (this.type==='add_spouse'){	

			if (!this.updated){
				sys_msg.add('Нужно добавить имя супруга/супруги!')
				return
			}

			const name=objects.add_dlg_name_t.text
			const bd=objects.add_dlg_bd_t.text
			const dd=objects.add_dlg_dd_t.text
			const sex=this.sex
			
			const new_id=tree.get_new_id()		
			familyData[new_id]={id:new_id,name,spouses:[this.id],sex:this.sex,parents:[],kids:[],fold:0,bd,dd}
			familyData[this.id].spouses.push(new_id)
			if (this.updated_photo)	{
				photo_loader.cache[new_id]=new PIXI.Texture(this.updated_photo.baseTexture)						
				upload_texture(new_id)
			}			
		}	
				
		if (this.type==='edit'){
			
			if(this.updated) {
				
				const pdata=familyData[this.id]
				pdata.name=objects.add_dlg_name_t.text
				pdata.bd=objects.add_dlg_bd_t.text
				pdata.dd=objects.add_dlg_dd_t.text
				pdata.sex=this.sex
				
				if (this.updated_photo)	{
					photo_loader.cache[this.id]=new PIXI.Texture(this.updated_photo.baseTexture)						
					upload_texture(this.id)
				}
				
				if (objects.pl_cont.visible)
					pl.update()
				
				
			}
		}				
		
		if (this.type==='removed'){
			
			
		}
		
		//this.set_photo(objects.add_dlg_photo.texture)
		if (this.id&&this.updated)
			delete familyData[this.id].empty
		
		tree.make_rel_graph()
		
		//показываем/обновляем дерево
		if(objects.cards_cont.visible)
			tree.show_root_person({person_id:cur_root_id})
		
		if (this.updated) tree.save()
		this.close()
		
	},
	
	close_down(){
		
		this.close()
		
	},
	
	close(){
		anim3.add(objects.add_dlg_cont,{alpha:[1, 0,'linear']}, false, 0.5)
	}	
	
}

dp={
	
	btns_data:[
		[40.9,413,84.9,443,"day",1],
		[95.3,413,139.3,443,"day",2],
		[149.8,411,193.8,441,"day",3],
		[204.2,413,248.2,443,"day",4],
		[258.7,413,302.7,443,"day",5],
		[313.1,413,357.1,443,"day",6],
		[367.5,413,411.5,443,"day",7],
		[40.9,453,84.9,483,"day",8],
		[95.3,453,139.3,483,"day",9],
		[149.8,453,193.8,483,"day",10],
		[204.2,453,248.2,483,"day",11],
		[258.7,453,302.7,483,"day",12],
		[313.1,453,357.1,483,"day",13],
		[367.5,453,411.5,483,"day",14],
		[40.9,493,84.9,523,"day",15],
		[95.3,493,139.3,523,"day",16],
		[149.8,493,193.8,523,"day",17],
		[204.2,493,248.2,523,"day",18],
		[258.7,493,302.7,523,"day",19],
		[313.1,493,357.1,523,"day",20],
		[367.5,493,411.5,523,"day",21],
		[40.9,533,84.9,563,"day",22],
		[95.3,533,139.3,563,"day",23],
		[149.8,533,193.8,563,"day",24],
		[204.2,533,248.2,563,"day",25],
		[258.7,533,302.7,563,"day",26],
		[313.1,533,357.1,563,"day",27],
		[367.5,533,411.5,563,"day",28],
		[40.9,573,84.9,603,"day",29],
		[95.3,573,139.3,603,"day",30],
		[149.8,573,193.8,603,"day",31],
		[90,650,150,680,"month",0],
		[160,650,220,680,"month",1],
		[230,650,290,680,"month",2],
		[300,650,360,680,"month",3],
		[25.2,640,70.2,690,"month_switch",-1],
		[380,640,425,690,"month_switch",1],
		[105.2,719,150.2,769,"year_switch",-1],
		[300,719,345,769,"year_switch",1],
		[30,719,75,769,"year_switch",-10],
		[375.2,719,420.2,769,"year_switch",10],
		[28,330,71,373,"dp_close_btn",0],
		[375,333,425,372,"dp_ok_btn",1]
	],
	
	cur_month_layer_id:0,
	cur_month_cell_id:0,
	cur_year:2000,
	cur_day:1,
	cur_month:1,
	resolver:0,
	
	show(){
		
		objects.dp_cont.visible=true		
		this.set_date(1,0,2000)
		need_render=1
		return new Promise(res=>{
			this.resolver=res			
		})
	},
	
	set_date(d,m,y){			

		const dbtn_data=this.btns_data.find(b=>{return b[4]==='day'&&b[5]===d})
		objects.dp_cur_day.x=dbtn_data[0]-10
		objects.dp_cur_day.y=dbtn_data[1]-10
		this.cur_day=d		
		
		//m [0-11]
		this.cur_month_layer_id=Math.floor((m)/4)
		this.cur_month_cell_id=(m)%4
		const mbtn_data=this.btns_data.find(b=>{return b[4]==='month'&&b[5]===this.cur_month_cell_id})
		objects.dp_cur_month.x=mbtn_data[0]-10
		objects.dp_cur_month.y=mbtn_data[1]-10
		this.switch_month_layer(0)
		
		this.cur_year=y
		this.switch_year(0)		
		this.update_date()
	},
	
	switch_month_layer(d){
		const new_layer_id=this.cur_month_layer_id+d
		if (new_layer_id<0||new_layer_id>2) return
		this.cur_month_layer_id=new_layer_id
		objects.dp_month.texture=assets.date_pick_months_pack[this.cur_month_layer_id]
	},
	
	switch_year(d){
		const new_year=this.cur_year+d
		if (new_year<0||new_year>9999) return
		this.cur_year=new_year
		objects.dp_year_t.text=this.cur_year
	},
	
	get_key_from_touch(e){

		let mx = e.data.global.x/app.stage.scale.x
		let my = e.data.global.y/app.stage.scale.y

		let margin = 5;
		for (let k of this.btns_data)
			if (mx > k[0] - margin && mx <k[2] + margin  && my > k[1] - margin && my < k[3] + margin)
				return k;
		return null;
	},
	
	down(e){
	
		const btn_data=this.get_key_from_touch(e)
		if (!btn_data) return
		
		
		const btn_type=btn_data[4]
		const btn_ind=btn_data[5]
		
		if (btn_type==='day'){			
			objects.dp_cur_day.x=btn_data[0]-10
			objects.dp_cur_day.y=btn_data[1]-10
			this.cur_day=btn_ind
		}
		
		if (btn_type==='month'){			
			objects.dp_cur_month.x=btn_data[0]-10
			objects.dp_cur_month.y=btn_data[1]-10
			this.cur_month_cell_id=btn_ind
			this.cur_month=this.cur_month_layer_id*4+this.cur_month_cell_id+1
		}
		
		if (btn_type==='month_switch'){
			this.switch_month_layer(btn_ind)			
			this.cur_month=this.cur_month_layer_id*4+this.cur_month_cell_id+1
		}
		
		if (btn_type==='year_switch')
			this.switch_year(btn_ind)
		
		
		if (btn_type==='dp_ok_btn'){
			this.resolver(objects.dp_cur_date_t.text)
			this.close()
		}
		
		if (btn_type==='dp_close_btn'){
			this.resolver(0)
			this.close()
		}
		
		this.update_date()

		
	},
	
	close(){
		objects.dp_cont.visible=false
	},
	
	update_date(){
		
		const date=new Date(this.cur_year,this.cur_month-1,this.cur_day)
		objects.dp_cur_date_t.text=date.toLocaleDateString('ru-Ru').replace(/\//g, '.')
		need_render=1
	}
	
	
}

dr_dlg={
	
	dr_list:[],
	
	activate(){
		
		
		this.dr_list=[]
		
		//распределяем карточки
		for (let y=0;y<5;y++){
			const card=objects.dr_cards_pool[y]
			card.x=20
			card.y=225+y*70
			card.visible=false
		}
		
		
		const pdata=Object.values(familyData)
		for (const p of pdata){
			if(p.bd&&!p.dd){
				
				const days_to_dr=this.daysUntilNextBirthday(p.bd)
				this.dr_list.push({id:p.id,days_to_dr})
				//if(this.dr_list.length===5) break
				
			}
		}
		
		//если нет дней рождений то выходими
		if (this.dr_list.length===0) return
		
		this.dr_list.sort((a, b) => a.days_to_dr-b.days_to_dr)
		
		const num_of_person=Math.min(5,this.dr_list.length)
			
		for (let i=0;i<num_of_person;i++){
			
			const dr_info=this.dr_list[i]
			const pdata=familyData[dr_info.id]
			const card=objects.dr_cards_pool[i]
			card.set(pdata.id,dr_info.days_to_dr)
			card.visible=true
			
		}
		
		//обновляем картинки
		anim3.add(objects.dr_cont,{alpha:[0,1,'linear']}, true, 0.5)
		
	},
	
	getDayWord(v) {
		let number = Math.abs(v) % 100; // Берем последние две цифры
		let lastDigit = number % 10; // Берем последнюю цифру

		if (number > 10 && number < 20) {
		return v+' дней'; // Исключение для 11-14
		}
		if (lastDigit > 1 && lastDigit < 5) {
		return v +' дня';
		}
		if (lastDigit === 1) {
		return v+' день';
		}
		return v+' дней'; // Для 0, 5-9
	},
	
	daysUntilNextBirthday(birthdayString) {
		// Parse the birthday string
		const [day, month] = birthdayString.split('.').map(Number);
		
		// Get today's date
		const today = new Date()
		today.setHours(0, 0, 0, 0);
		const currentYear = today.getFullYear();
		
		// Create this year's birthday date
		let nextBirthday = new Date(currentYear, month - 1, day);
		
		// If birthday already passed this year, set to next year
		if (nextBirthday < today) {
			nextBirthday = new Date(currentYear + 1, month - 1, day);
		}
		
		// Calculate days until next birthday
		const daysUntil = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
		
		return daysUntil;
	},
	
	close(){
		
		anim3.add(objects.dr_cont,{alpha:[1,0,'linear']}, false, 0.5)

	}
	
}

editor={
	
	resolver:0,
	
	drag:0,
	drag_sy:0,
	drag_sx:0,
	img_sy:0,
	img_sx:0,
	renderTexture:0,
	bg:0,
	
	activate(t){
		

		
		this.renderTexture = PIXI.RenderTexture.create({ width: 370, height: 370 });
		
		if(!this.bg){
			this.bg=new PIXI.Graphics()
			this.bg.beginFill(0x442266)
			this.bg.drawRect(0, 0, 370, 370)		
			this.bg.endFill()
		}

		objects.editor_cont.visible=true
		objects.editor_img.texture=t
		
		objects.editor_img.x=M_WIDTH*0.5
		objects.editor_img.y=390
		objects.editor_img.width=t.baseTexture.width
		objects.editor_img.height=t.baseTexture.height
		
		need_render=1
		
		return new Promise(res=>{
			this.resolver=res
		})
		
	},
	
	zoom_down(dir){		
		
		objects.editor_img.scale_xy+=dir*0.1
		need_render=1
	},
	
	pointer_down(e){
		
		this.drag=1
		this.drag_sx=e.data.global.x/app.stage.scale.x
		this.drag_sy=e.data.global.y/app.stage.scale.y
		this.img_sy=objects.editor_img.y
		this.img_sx=objects.editor_img.x
		need_render=1
	},
	
	pointer_up(e){
		
		this.drag=0
		
	},
	
	pointer_move(e){
		
		if (!this.drag) return
		
		const mx=e.data.global.x/app.stage.scale.x
		const my=e.data.global.y/app.stage.scale.y
		
		const dx=mx-this.drag_sx
		const dy=my-this.drag_sy		
		
		objects.editor_img.x=this.img_sx+dx
		objects.editor_img.y=this.img_sy+dy	
		need_render=1
	},
	
	ok_down(){
		
		objects.editor_img2.visible=true
		objects.editor_img2.texture=objects.editor_img.texture
		objects.editor_img2.width=objects.editor_img.width
		objects.editor_img2.height=objects.editor_img.height
		objects.editor_img2.x=objects.editor_img.x-40
		objects.editor_img2.y=objects.editor_img.y-200
				
		app.renderer.render(this.bg, { renderTexture: this.renderTexture })
		app.renderer.render(objects.editor_img2, { renderTexture: this.renderTexture,clear:false})
		this.resolver(this.renderTexture)
		objects.editor_cont.visible=false
		objects.editor_img2.visible=false
		need_render=1
	},
	
	decline_down(){
		
		objects.editor_cont.visible=false
		objects.editor_img2.visible=false
		this.resolver(0)
		need_render=1
	}
	
	
}

info={
	
	page:0,
	
	activate(){
		
		objects.info_cont.visible=true
		this.switch_page(0)
		
	},
	
	down(e){
		
		const mx=e.data.global.x/app.stage.scale.x
		const my=e.data.global.y/app.stage.scale.y
		
		if (mx<200&&my>600)
			this.switch_page(-1)
		
		if (mx>250&&my>600)
			this.switch_page(1)
		
		if (mx>380&&my<250)
			this.close()
		
	},
	
	switch_page(dir){
		
		this.page+=dir
		if (this.page<0) this.page=0
		if (this.page>3) this.page=3
		
		const active_btn_x=[165,205,245,285]
		objects.info_active_btn.x=active_btn_x[this.page]
		
		objects.info_page.texture=assets[`info_page${this.page}_img`]
		need_render=1
	},
	
	close(){
		
		objects.info_cont.visible=false
		need_render=1
	}
	
	
	
}

main_menu={
	
	async activate(){
		
		objects.main_menu_cont.visible=true
		need_render=1
		
		const all_persons=Object.values(familyData)	
		const familyData_size=all_persons.filter(p=>!p.empty).length
		objects.mm_tree_stat_t.text=familyData_size

		
	},
	
	show_tree_down(){
		
		
	},
	
	pl_btn_down(){
		
		this.close()
		pl.activate('show')
		
	},
		
	open_my_tree_down(){
		
		this.close()
		cur_root_id=0
		tree.show_root_person({person_id:cur_root_id,auto_fold:1,cont_y:0,cont_x:0})
			
	},
	
	rel_analysis_down(){
		
		this.close()
		rel.activate()
		
	},
	
	info_btn_down(){
	
		info.activate()
		
	},
	
	close(){
		
		objects.main_menu_cont.visible=false
		need_render=1
		
	}
	
	
}

sys_msg={

	promise_resolve :0,

	async add(t){

		if (this.promise_resolve) this.promise_resolve('forced');

		sound.play('popup');

		//показываем сообщение
		objects.t_sys_msg.text=t;
		const ares=await anim3.add(objects.sys_msg_cont,{y:[-50,objects.sys_msg_cont.sy,'linear']}, true, 0.25,false);
		if (ares==='killed') return;

		//ждем
		const res = await new Promise(resolve => {
				sys_msg.promise_resolve = resolve;
				setTimeout(resolve,5000)
			}
		);

		//это если насильно закрываем
		if (res==='forced') return;

		anim3.add(objects.sys_msg_cont,{y:[objects.sys_msg_cont.y,-50,'linear']}, false, 0.25,false);

	}

}

keyboard={

	ru_keys:[[40.02,122.05,64.52,161.12,'1'],[72.68,122.05,97.18,161.12,'2'],[105.35,122.05,129.85,161.12,'3'],[138.02,122.05,162.52,161.12,'4'],[170.68,122.05,195.18,161.12,'5'],[203.35,122.05,227.85,161.12,'6'],[236.02,122.05,260.52,161.12,'7'],[268.68,122.05,293.18,161.12,'8'],[301.35,122.05,325.85,161.12,'9'],[334.02,122.05,358.52,161.12,'0'],[400.17,122.05,441,161.12,'<'],[56.35,170.88,80.85,209.95,'Й'],[89.02,170.88,113.52,209.95,'Ц'],[121.68,170.88,146.18,209.95,'У'],[154.35,170.88,178.85,209.95,'К'],[187.02,170.88,211.52,209.95,'Е'],[219.68,170.88,244.18,209.95,'Н'],[252.35,170.88,276.85,209.95,'Г'],[285.02,170.88,309.52,209.95,'Ш'],[317.68,170.88,342.18,209.95,'Щ'],[350.35,170.88,374.85,209.95,'З'],[383.02,170.88,407.52,209.95,'Х'],[415.68,170.88,440.18,209.95,'Ъ'],[72.68,219.72,97.18,258.79,'Ф'],[105.35,219.72,129.85,258.79,'Ы'],[138.02,219.72,162.52,258.79,'В'],[170.68,219.72,195.18,258.79,'А'],[203.35,219.72,227.85,258.79,'П'],[236.02,219.72,260.52,258.79,'Р'],[268.68,219.72,293.18,258.79,'О'],[301.35,219.72,325.85,258.79,'Л'],[334.02,219.72,358.52,258.79,'Д'],[366.68,219.72,391.18,258.79,'Ж'],[399.35,219.72,423.85,258.79,'Э'],[39.35,269.06,63.85,308.13,'!'],[72.11,269.06,96.61,308.13,'Я'],[104.88,269.06,129.38,308.13,'Ч'],[137.64,269.06,162.14,308.13,'С'],[170.4,269.06,194.9,308.13,'М'],[203.16,269.06,227.66,308.13,'И'],[235.92,269.06,260.42,308.13,'Т'],[268.69,269.06,293.19,308.13,'Ь'],[301.45,269.06,325.95,308.13,'Б'],[334.21,269.06,358.71,308.13,'Ю'],[399.74,269.06,424.24,308.13,')'],[367.5,122.05,392,161.12,'?'],[23.68,317.4,146.18,356.47,'ЗАКРЫТЬ'],[154.35,317.4,342.18,356.47,' '],[350.35,317.4,464.68,356.47,'ОТПРАВИТЬ'],[432.83,219.72,457.33,258.79,','],[366.98,269.06,391.48,308.13,'('],[23.68,219.72,64.51,258.79,'EN'],[432.5,269.06,457,308.13,'.']],
	en_keys:[[51,120.58,81,159.65,'1'],[91,120.58,121,159.65,'2'],[131,120.58,161,159.65,'3'],[171,120.58,201,159.65,'4'],[211,120.58,241,159.65,'5'],[251,120.58,281,159.65,'6'],[291,120.58,321,159.65,'7'],[331,120.58,361,159.65,'8'],[371,120.58,401,159.65,'9'],[411,120.58,441,159.65,'0'],[492,120.58,542,159.65,'<'],[111,169.42,141,208.49,'Q'],[151,169.42,181,208.49,'W'],[191,169.42,221,208.49,'E'],[231,169.42,261,208.49,'R'],[271,169.42,301,208.49,'T'],[311,169.42,341,208.49,'Y'],[351,169.42,381,208.49,'U'],[391,169.42,421,208.49,'I'],[431,169.42,461,208.49,'O'],[471,169.42,501,208.49,'P'],[131,218.26,161,257.33,'A'],[171,218.26,201,257.33,'S'],[211,218.26,241,257.33,'D'],[251,218.26,281,257.33,'F'],[291,218.26,321,257.33,'G'],[331,218.26,361,257.33,'H'],[371,218.26,401,257.33,'J'],[411,218.26,441,257.33,'K'],[451,218.26,481,257.33,'L'],[472,267.09,502,306.16,'('],[71,267.09,101,306.16,'!'],[151,267.09,181,306.16,'Z'],[191,267.09,221,306.16,'X'],[231,267.09,261,306.16,'C'],[271,267.09,301,306.16,'V'],[311,267.09,341,306.16,'B'],[351,267.09,381,306.16,'N'],[391,267.09,421,306.16,'M'],[512,267.09,542,306.16,')'],[452,120.58,482,159.65,'?'],[31,315.93,181,355,'CLOSE'],[191,315.93,421,355,' '],[431,315.93,571,355,'SEND'],[532,218.26,562,257.33,','],[31,218.26,81,257.33,'RU']],
	layout:0,
	resolver:0,

	MAX_SYMBOLS : 60,

	read(max_symb){

		this.MAX_SYMBOLS=max_symb||60;
		if (!this.layout)this.switch_layout();

		if(this.resolver) this.resolver('');

		objects.chat_keyboard_text.text ='';
		objects.chat_keyboard_control.text = `0/${this.MAX_SYMBOLS}`

		anim3.add(objects.chat_keyboard_cont,{y:[800, objects.chat_keyboard_cont.sy,'linear']}, true, 0.2)


		return new Promise(resolve=>{
			this.resolver=resolve;
		})

	},

	keydown (key) {

		if(!objects.chat_keyboard_cont.visible) return;

		key = key.toUpperCase();

		if(key==='BACKSPACE') key ='<';
		if(key==='ENTER') key ='ОТПРАВИТЬ';
		if(key==='ESCAPE') key ='ЗАКРЫТЬ';

		var key2 = this.layout.find(k => {return k[4] === key})

		this.process_key(key2)

	},

	get_key_from_touch(e){

		let mx = e.data.global.x/app.stage.scale.x - objects.chat_keyboard_cont.x-10;
		let my = e.data.global.y/app.stage.scale.y - objects.chat_keyboard_cont.y-10;

		let margin = 5;
		for (let k of this.layout)
			if (mx > k[0] - margin && mx <k[2] + margin  && my > k[1] - margin && my < k[3] + margin)
				return k;
		return null;
	},

	highlight_key(key_data){

		const [x,y,x2,y2,key]=key_data

		objects.chat_keyboard_hl.width=x2-x+20;
		objects.chat_keyboard_hl.height=y2-y+20;

		objects.chat_keyboard_hl.x = x+objects.chat_keyboard.x-10;
		objects.chat_keyboard_hl.y = y+objects.chat_keyboard.y-10;

		anim3.add(objects.chat_keyboard_hl,{alpha:[1, 0,'linear']}, false, 0.5);

	},

	pointerdown (e) {

		//if (!game.on) return;

		const key=this.get_key_from_touch(e);

		this.process_key(key);
	},

	response_message(uid, name) {

		objects.chat_keyboard_text.text = name.split(' ')[0]+', ';
		objects.chat_keyboard_control.text = `${objects.chat_keyboard_text.text.length}/${keyboard.MAX_SYMBOLS}`

	},

	switch_layout(){

		if (this.layout===this.ru_keys){
			this.layout=this.en_keys;
			objects.chat_keyboard.texture=assets.eng_layout;
		}else{
			this.layout=this.ru_keys;
			objects.chat_keyboard.texture=assets.rus_layout;
		}

	},

	process_key(key_data){

		if(!key_data) return;

		let key=key_data[4];

		sound.play('keypress')

		const t=objects.chat_keyboard_text.text;
		if ((key==='ОТПРАВИТЬ'||key==='SEND')&&t.length>0){
			this.resolver(t);
			this.close();
			key ='';
		}

		if (key==='ЗАКРЫТЬ'||key==='CLOSE'){
			this.resolver(0);
			this.close();
			key ='';
		}

		if (key==='RU'||key==='EN'){
			return
			this.switch_layout();
			key ='';
		}

		if (key==='<'){
			objects.chat_keyboard_text.text=t.slice(0, -1);
			key ='';
		}

		if (t.length>=this.MAX_SYMBOLS) return;

		this.highlight_key(key_data);

		if (key.length===1) objects.chat_keyboard_text.text+=key;

		objects.chat_keyboard_control.text = `${objects.chat_keyboard_text.text.length}/${this.MAX_SYMBOLS}`

	},

	close () {

		if (this.resolver) this.resolver(0);
		anim3.add(objects.chat_keyboard_cont,{y:[objects.chat_keyboard_cont.y,800,'linear']}, false, 0.2);

	},

}

function resize() {
    const vpw = document.body.clientWidth;  // Width of the viewport
    const vph = document.body.clientHeight; // Height of the viewport
    let nvw; // New game width
    let nvh; // New game height

    if (vph / vpw < M_HEIGHT / M_WIDTH) {
      nvh = vph;
      nvw = (nvh * M_WIDTH) / M_HEIGHT;
    } else {
      nvw = vpw;
      nvh = (nvw * M_HEIGHT) / M_WIDTH;
    }
    app.renderer.resize(nvw, nvh)
    app.stage.scale.set(nvw / M_WIDTH, nvh / M_HEIGHT)
	need_render=1
}

main_loader={
	
	pre_load_list:0,
	
	divide_texture(t,frame_w,frame_h, names){
		
		const frames_x=Math.floor(t.width/frame_w)
		const frames_y=Math.floor(t.height/frame_h)
			
		if (typeof(names)==='string'){
			assets[names]=[]
			let i=0
			for (let y=0;y<frames_y;y++){
				for (let x=0;x<frames_x;x++){
					const rect=new PIXI.Rectangle(x*frame_w, y*frame_h, frame_w, frame_h)
					assets[names][i]=new PIXI.Texture(t.baseTexture, rect)
					i++
				}
			}			
		}else{
			
			let i=0
			for (let y=0;y<frames_y;y++){
				for (let x=0;x<frames_x;x++){
					const rect=new PIXI.Rectangle(x*frame_w, y*frame_h, frame_w, frame_h)
					assets[names[i]]=new PIXI.Texture(t.baseTexture, rect)
					i++
				}
			}			
		}
	},
	
	async load1(){

		git_src=''

		const loader=new PIXI.Loader();
		
		loader.add('pre_load_list',git_src+'pre_load_list.txt')
		loader.add('bahnschrift48',git_src+'https://akukamil.github.io/common/fonts/bahnschrift48/f.fnt')	
		
		await new Promise(res=>loader.load(res))
	
		
		//добавляем из запускного листа загрузки
		this.pre_load_list=eval(loader.resources.pre_load_list.data)
		for (let i = 0; i < this.pre_load_list.length; i++)
			if (this.pre_load_list[i].class==='sprite' || this.pre_load_list[i].class==='image')
				loader.add(this.pre_load_list[i].name, git_src+'res/common/' + this.pre_load_list[i].name + '.' +  this.pre_load_list[i].image_format);
		loader.add('main_load_list',git_src+'main_load_list.txt')

			
		//загружаем
		await new Promise(res=>loader.load(res))
				
		//переносим все в ассеты
		for (const res_name in loader.resources){
			const res=loader.resources[res_name];
			assets[res_name]=res.texture||res.sound||res.data;
		}
		
		//убираем надпись
		const l_text=document.getElementById('loadingText')
		if(l_text)
			document.getElementById('loadingText').remove();
		
		
		
	},
	
	async load2(){		
		
		const loader=new PIXI.Loader()

			
		const load_list=eval(assets.main_load_list);
		for (var i = 0; i < load_list.length; i++)
			if (load_list[i].class ==='sprite'|| load_list[i].class ==='image')
				loader.add(load_list[i].name, git_src+'res/RUS/' + load_list[i].name + '.' +  load_list[i].image_format);

		loader.add('nophoto', git_src+'res/common/nophoto.jpg');
		
		//прогресс
		loader.onProgress.add((l,res)=>{
			objects.loading_bar_mask.width =350*l.progress*0.01;
			need_render=1
			objects.loading_progress_t.text=Math.round(l.progress)+'%';
		});
		
		await new Promise(res=> loader.load(res));
		anim3.add(objects.loading_cont,{alpha:[1,0,'linear']}, false, 0.25);
		for (const res_name in loader.resources){
			const res=loader.resources[res_name];			
			assets[res_name]=res.texture||res.sound||res.data;			
		}	
		
		this.divide_texture(assets.date_pick_months_pack,435,105,'date_pick_months_pack')
		this.divide_texture(assets.qm_pack,60,60,['qm_tree','qm_spouse','qm_kid','qm_fold','qm_unfold'])
						
		this.process_load_list(load_list)
		
		need_render=1

	},
	
	process_load_list(load_list){
		
		//создаем спрайты и массивы спрайтов и запускаем первую часть кода
		
		for (var i = 0; i < load_list.length; i++) {
			const obj_class = load_list[i].class;
			const obj_name = load_list[i].name;
			console.log('Processing: ' + obj_name)

			switch (obj_class) {
			case "sprite":
				objects[obj_name] = new PIXI.Sprite(assets[obj_name]);
				eval(load_list[i].code0);
				break;

			case "block":
				if (obj_name==='cells')
					console.log(load_list[i].code)
				eval(load_list[i].code0);
				break;

			case "cont":
				eval(load_list[i].code0);
				break;

			case "array":
				var a_size=load_list[i].size;
				objects[obj_name]=[];
				for (var n=0;n<a_size;n++)
					eval(load_list[i].code0);
				break;
			}
		}

		//обрабатываем вторую часть кода в объектах
		for (var i = 0; i < load_list.length; i++) {
			const obj_class = load_list[i].class;
			const obj_name = load_list[i].name;
			console.log('Processing: ' + obj_name)


			switch (obj_class) {
			case "sprite":
				eval(load_list[i].code1);
				break;

			case "block":
				eval(load_list[i].code1);
				break;

			case "cont":
				eval(load_list[i].code1);
				break;

			case "array":
				var a_size=load_list[i].size;
					for (var n=0;n<a_size;n++)
						eval(load_list[i].code1);	;
				break;
			}
		}

	}
	
}

async function define_platform_and_language(p) {

	const s = window.location.href;


	if (p==='playgama'){
		
		game_platform = 'PG';
		LANG = 1;
		return
	}
	
	if (s.includes('app-id=420438')) {
		game_platform = 'YANDEX';
		if (s.match(/yandex\.ru|yandex\.by|yandex\.kg|yandex\.kz|yandex\.tj|yandex\.ua|yandex\.uz/))
			LANG = 0;
		else
			LANG = 1;
		return;
	}
	
	if (s.includes('rustore')) {
		game_platform = 'RS';
		LANG = 0;
		return;
	}
	
	if (s.includes('vk.com')||s.includes('vk_app_id')) {
		game_platform = 'VK';
		LANG = 0;
		return;
	}

	if (s.includes('google_play')) {

		game_platform = 'GOOGLE_PLAY';
		LANG = await language_dialog.show();
		return;
	}

	if (s.includes('my_games')) {

		game_platform = 'MY_GAMES';
		LANG = 0;
		return;
	}

	if (s.includes('crazygames')) {

		game_platform = 'CRAZYGAMES';
		LANG = 1;
		return;
	}

	if (s.includes('127.0')) {

		game_platform = 'DEBUG';
		LANG = 0
		return;
	}
	
	if (s.includes('playminigames')) {

		game_platform = 'PLAYMINIGAMES';
		LANG = 1;
		return;
	}
	game_platform = 'UNKNOWN';
	LANG = 0


}

async function init_game_env(lang) {
				
	git_src=""
	
	define_platform_and_language()
				
	await auth2.init()
				
	AWS.config.update({
		endpoint: 'https://s3.twcstorage.ru',
		region: 'ru-1',
		accessKeyId: 'FPUAIRUI9064JC4SZ1TM',
		secretAccessKey: '75yIFODq85n959C6zDPSAd2evB6ZavQhuxSlRPFf'
	});
	
	s3 = new AWS.S3();	
	
	await main_loader.load1()
	need_render=1
	
	
	document.body.innerHTML='<style>html,body {margin: 0;padding: 0;height: 100%;}body {display: flex;align-items:center;justify-content: center;background-color: rgba(50,60,70,1)}</style>';
	const dw=M_WIDTH/document.body.clientWidth;
	const dh=M_HEIGHT/document.body.clientHeight;
	const resolution=Math.min(1.5,window.devicePixelRatio );	
	const opts={width:M_WIDTH, height:M_HEIGHT,antialias:true,resolution,autoDensity:true};
	app.stage = new PIXI.Container();
	app.renderer = new PIXI.Renderer(opts);
	const c=document.body.appendChild(app.renderer.view);
	c.style['boxShadow'] = '0 0 15px #ffffff';
	c.style.outline = '1px solid rgb(60, 60, 60)';
				


	resize();
	window.addEventListener('resize', resize);

	main_loop();
	//my_data.uid='vk39099558'
	//my_data.uid='fgh5253h'
	
	main_loader.process_load_list(main_loader.pre_load_list)
	await main_loader.load2()
		
	PIXI.BitmapText.prototype.set2=function(text,w){		
		const t=this.text=text;
		for (i=t.length;i>=0;i--){
			this.text=t.substring(0,i)
			if (this.width<w) return;
		}	
	}

	PIXI.Graphics.prototype.set_texture=function(texture){		
	
		if(!texture) return;
		// Get the texture's original dimensions
		const textureWidth = texture.baseTexture.width;
		const textureHeight = texture.baseTexture.height;

		// Calculate the scale to fit the texture to the circle's size
		const scaleX = this.w / textureWidth;
		const scaleY = this.h / textureHeight;

		// Create a new matrix for the texture
		const matrix = new PIXI.Matrix();

		// Scale and translate the matrix to fit the circle
		matrix.scale(scaleX, scaleY);
		const radius=this.w*0.5;
		this.clear();
		this.beginTextureFill({texture,matrix});		
		this.drawCircle(radius, radius, radius);		
		this.endFill();		
		
	}
	
	window.addEventListener('wheel', e => {
		tree.mscroll(e)
		pl.mscroll(e)
	});
	window.addEventListener('keydown', function(e) {keyboard.keydown(e.key)});


	//создаем комбинации быстрых кнопок	
	const t_spr=new PIXI.Sprite()
	const rt_data={
		qm_tree:['qm_tree'],
		qm_kid:['qm_tree','qm_kid','qm_fold'],
		qm_spouse:['qm_tree','qm_spouse','qm_fold'],
		qm_kid_nof:['qm_tree','qm_kid'],
		qm_spouse_nof:['qm_tree','qm_spouse'],
		qm_kid_f:['qm_tree','qm_kid','qm_unfold'],
		qm_spouse_f:['qm_tree','qm_spouse','qm_unfold']
	}
	
	for (const [rt_name, textures] of Object.entries(rt_data)){				

		qm_rt[rt_name]=PIXI.RenderTexture.create({width:150,height:60})
		const cur_rt=qm_rt[rt_name]
		
		let x=0
		for (const t_name of textures){
			
			t_spr.texture=assets[t_name]
			t_spr.x=x
			app.renderer.render(t_spr,{renderTexture:cur_rt,clear:false})
			x+=45
		}		
	}

	


/*
	c.addEventListener("touchstart", function(e){		
		for (let i = 0; i < e.changedTouches.length; i++) {
			tree.down(e.changedTouches[i])
		}
	});
	c.addEventListener("touchend", function(e){
		for (let i = 0; i < e.changedTouches.length; i++) {
			tree.up(e.changedTouches[i])
		}
	});
	c.addEventListener("touchmove", function(e){
		for (let i = 0; i < e.changedTouches.length; i++) {
			tree.move(e.changedTouches[i])
		}
	});
*/

	//загружаем дерево
	try{
		f_data=await s3.getObject({Bucket: 'gen-tree',Key: my_data.uid+'/TREE'}).promise()		
		familyData=JSON.parse(f_data.Body.toString())
	}catch(e){
		console.log(e)
		f_data={}
	}	
	
	//новое дерево
	if (Object.keys(familyData).length===0){
		//загружаем фото и созжаем первую персону
		photo_loader.add({id:0,url:my_data.orig_pic_url})
		familyData[0]={id:0,name:my_data.name,bd:'',dd:'',fold:0,sex:0,spouses:[],parents:[],kids:[]}
	}else{
		//загружаем основного для отображения на кнопке
		photo_loader.add({id:0})
	}
	
		
	
	//return	
	//удаляем несуществующие ссылки
	Object.values(familyData).forEach(v=>{		
		if (!familyData[v.parents[0]])
			v.parents=[]		
	})
	
	tree.make_rel_graph()
	

/*
	let i=0
	for (const person of all_persons){		
		try{
			if (!person.empty){
				const data = await s3.getObject({Bucket: 'gen-tree',Key: my_data.uid+'/img'+person.id}).promise();
				if (data)
					photo_loader.cache[person.id]=PIXI.Texture.from(data.Body.toString())
				need_render=1
				objects.loading_bar_mask.width=350*i/familyData_size
				objects.loading_progress_t.text=i+'/'+familyData_size
			}			
		}catch(e){
			console.log(e)
		}
		i++
	}*/
	
	//anim3.add(objects.loading_cont,{alpha:[1, 0,'linear']}, false, 0.5);
	
	
	//показываем ближайшие дни рождения
	dr_dlg.activate()
	main_menu.activate()
	
	if (game_platform==='VK')
		vkBridge.send('VKWebAppShowBannerAd', {banner_location: 'top',layout_type:'resize'});

}

function main_loop() {

	for (let key in some_process)
		some_process[key]();	
	anim3.process()
	
	if(need_render)
		app.renderer.render(app.stage)
	
	need_render=0
	requestAnimationFrame(main_loop)
}