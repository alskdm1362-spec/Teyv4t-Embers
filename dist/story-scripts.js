// User-authored Korean lines. IDs and stage directions are separate from spoken text.
const line=(speaker,text,direction={})=>({speaker,text,...direction});
export const JOIN_LINES={
 illuga:[
 line('illuga','「악몽의 밤꾀꼬리」 분대장 일루가입니다. 페보니우스 기사단 제 5소대 부대장 로엔 씨 맞으신가요?'),
 line('lohen','응. 설마 분대장이 올 줄은 몰랐는데.'),line('illuga','하하…'),
 line('illuga','부대장의 지원 요청에 애매한 전력을 지원드릴 순 없으니까요.'),line('lohen','잘 부탁해.'),line('illuga','네, 잘 부탁드릴게요.')],
 durin:[line('lohen','호오, 자진해서 이런 곳에 올 줄이야.'),line('durin','알베도가 이런 경험도 중요하다고 했어. …거기다 바르카 대단장의 지원이 있으면 큰 문제는 없을거라고도.'),line('lohen','그건 그렇지.'),line('lohen','… 잠깐.',{motion:'bounce'}),line('lohen','바르카가 없다면 문제가 생겼을거란 얘기야?'),line('durin','그, 그건 아니야…. 로엔 부대장에게서 실전 경험을 쌓는 건 귀중한 기회라고 했어.'),line('lohen','장난이었는데 너무 쪼는거 아냐?'),line('lohen','아무튼, 잘 부탁한다고.')],
 jahoda:[line('jahoda','내가 왜 이런 곳까지… 보스의 협, 아니, 의뢰가 없었으면 거절했을텐데…!',{hideLohen:true}),line('lohen','안녕?'),line('jahoda','우,',{motion:'bounce'}),line('jahoda','우와아악!!!!!',{motion:'shake'}),line('lohen','비밀의 집의… 누구였더라?'),line('jahoda','놀라게 하지 마…, 야호다야.'),line('jahoda','참고로 보스는 지원하는 형태로만 참여하니까 그렇게 알아줘.'),line('lohen','비밀의 집의 사장이 만족할만한 보수는 당장은 준비 못하지.'),line('lohen','아무튼, 와줘서 고마워.')]
};
export const CARE_SCRIPT={
 lohen:[line('lohen','…바르카.'),line('varka','그 상태로 듣고 있어도 된다.'),line('varka','티바트를 구하기 위해서, 라는 커다란 짐은 지금 당장은 내려둬.'),line('varka','넌 아직 어려. 거창한 목적만을 위해서 까치발을 세우고 다닐 필요는 없어.'),line('lohen','하지만, …'),line('varka','널 못 믿는 게 아냐. 못 믿었다면 이런 위험한 전장에 소중한 전력을 홀로 보냈겠냐.'),line('varka','큰 이야기의 주인공이 되지 못하더라도, 넌 네 이야기의 주인공이다.'),line('varka','인애의 기사가 믿은 널, 나도 믿고 있다.'),line('varka','그 사실만큼은 잊지 마.')],
 illuga:[line('flins','돌아가시겠습니까.'),line('illuga','…그러고 싶어요. ……하지만 그럴 순 없어요. 지금 제가 손을 놓으면 또 많은 사람들이…'),line('flins','하지만 지금 이 시각에도 많은 사람들이 전장에서 쓰러져가고 있죠.'),line('illuga','………'),line('flins','일루가 도련님. 사람은 실수를 거듭하며 성장을 합니다.'),line('flins','작은 어깨에 모든 것을 짊어지려 하지 마시길.'),line('illuga','죽어간 이들을 못 본 체 지나가라는 건가요?'),line('flins','스러진 등불들은 남은 등불이 계속 타오르길 바라고 있을겁니다. 그 작디작은, 그러나 꺼지지 않은 강한. 하나의 등불이 여명을 가져오길 바라고 있겠지요.'),line('illuga','…'),line('flins','다시 묻겠습니다. 돌아가시겠습니까.'),line('illuga','아뇨.'),line('illuga','계속 길을 비추겠어요.',{normal:true})],
 durin:[line('albedo','천천히 심호흡을 하도록 해.'),line('durin','……'),line('albedo','모자처럼 다정한 말은 해주지 못하지만…'),line('albedo','…음.'),line('albedo','내가 만든 그 몸은 내 최고의 걸작이야.'),line('albedo','어중간한 침식에 버티지 못할 정도로 약한 구조로 만들지 않았어. 내 모든 지식을 담아두었거든.'),line('durin','알베도….'),line('albedo','물론 정신의 영역으로 가면 내가 손 쓸 수단은 없지만.'),line('durin','…정말 모자보다 서투르네.',{normal:true}),line('albedo','자각은 하고 있어.'),line('durin','고마워.')],
 jahoda:[line('jahoda','미안, 보스. …난….'),line('nefer','성가시고 손도 많이 가고 사고만 치고 쓸모가 없다고?'),line('nefer','물론 알고 있지.'),line('jahoda','…'),line('nefer','나는 이렇게나 많이 알고 있는데. 넌 날 하나도 모르는 것 같은데?'),line('jahoda','그게 무슨…'),line('nefer','내가 보수가 적다고 지원 역할로만 빠지고 널 혼자 보낸 줄 알고 있는건 아니겠지?'),line('jahoda','…!'),line('nefer','비밀의 집의 직원은 한 명이라도 빠지면 곤란해. 야호다. 알고 있지?'),line('jahoda','응. …미안.',{normal:true})]
};
