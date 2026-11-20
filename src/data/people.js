// Personas y perro: roles, poses y aspecto.
const D2R=Math.PI/180,ROLEC={pj:'#d6453d',sec:'#5b9bd5',ext:'#aeb4bb'};
const ROLES=[['pj','Personaje'],['sec','Secundario'],['ext','Extra']];
const PB={tl:0,hy:0,la:2,lb:6,ra:2,rb:6,ll:0,lk:0,rl:0,rk:0},mkP=x=>Object.assign({},PB,x);
const POSES={stand:mkP({}),walk:mkP({tl:3,la:-28,lb:12,ra:28,rb:18,ll:24,lk:6,rl:-20,rk:22}),run:mkP({tl:14,la:-55,lb:95,ra:55,rb:95,ll:60,lk:90,rl:-28,rk:50}),phone:mkP({hy:12,ra:60,rb:135,ph:1}),talk:mkP({tl:2,hy:-8,la:30,lb:70,ra:55,rb:60}),sit:mkP({la:25,lb:25,ra:25,rb:25,ll:90,lk:90,rl:90,rk:90}),crouch:mkP({tl:30,la:45,lb:60,ra:45,rb:60,ll:105,lk:130,rl:105,rk:130}),cross:mkP({la:40,lb:120,ra:40,rb:120}),up:mkP({la:170,lb:10,ra:170,rb:10}),point:mkP({ra:90,rb:5}),lie:mkP({lie:1})};
const PLIST=[['stand','De pie'],['walk','Caminando'],['run','Corriendo'],['phone','Hablando por teléfono'],['talk','Hablando (gesticula)'],['sit','Sentado'],['crouch','Agachado'],['cross','Brazos cruzados'],['up','Manos arriba'],['point','Señalando'],['lie','Tumbado']];
const DPOSES={stand:{by:1,tilt:0,fl:0,fr:0,bl:0,br:0,hu:0,tail:25},walk:{by:.98,tilt:0,fl:25,fr:-25,bl:-25,br:25,hu:5,tail:20},run:{by:.9,tilt:-6,fl:55,fr:45,bl:-45,br:-55,hu:10,tail:10},sit:{by:.62,tilt:28,fl:0,fr:0,bl:80,br:80,hu:-15,tail:-10},lie:{by:.25,tilt:0,fl:75,fr:75,bl:-75,br:-75,hu:5,tail:0}};
const DLIST=[['stand','De pie'],['walk','Andando'],['run','Corriendo'],['sit','Sentado'],['lie','Tumbado']];
const SL=[['tl','Inclinación del torso',-30,60],['hy','Giro de cabeza',-80,80],['la','Brazo izquierdo',-90,180],['lb','Codo izquierdo',0,150],['ra','Brazo derecho',-90,180],['rb','Codo derecho',0,150],['ll','Pierna izquierda',-45,120],['lk','Rodilla izquierda',0,150],['rl','Pierna derecha',-45,120],['rk','Rodilla derecha',0,150]];
const HAIRS=[['short','Corto'],['long','Largo'],['tail','Coleta'],['bald','Calvo']];
const HAIRC=[['k','Negro','#1c1814'],['b','Castaño','#4a3020'],['r','Rubio','#c9a14a'],['p','Pelirrojo','#8a3b1f'],['g','Gris','#a8a8a8']];
const SKIN=[['1','Clara','#efc6a0'],['2','Media','#d09a68'],['3','Oscura','#8a5a3b']];
const poseOf=o=>o.pp||POSES[o.pose]||POSES.stand;

export {D2R, ROLEC, ROLES, POSES, PLIST, DPOSES, DLIST, SL, HAIRS, HAIRC, SKIN, poseOf};
