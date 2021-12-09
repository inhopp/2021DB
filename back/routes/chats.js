const express = require('express');
const router = express.Router();
const { query } = require('../modules/db');
const { verifyMiddleWare } = require('../modules/jwt');

//자신과 채팅을 나눈 적 있는 다른 유저와의 채팅방마다(row)
//{ 다른 유저의 id, name, role, 마지막 메시지, 마지막 메시지의 시간}(column)을 모아서 리턴하는 api
//성공시, success: true, chatList
//실패시, success: false, errorMessage
// - 마지막 메시지는 자신이 보낸 것일수도, 상대가 보낸 것일수도 있음
// - 누가 보낸 것인지는 리턴하지 않음, 필요하면 추가 가능
router.get('/list', verifyMiddleWare, async (req, res, next) => {
  const { id } = req.decoded;

  if (id) {
    const chatList = (await query(`SELECT @uid:=id from users where id = '${id}';
      WITH b AS (SELECT if(from_id = @uid, to_id, from_id) AS id, text, date_time FROM message WHERE from_id = @uid OR to_id = @uid)
      SELECT u.id, u.name, u.role, b.text, b.date_time FROM b, users u WHERE date_time IN (SELECT max(date_time) FROM b GROUP BY id) and u.id = b.id;`))[1];
    res.json({
      success: true,
      chatList
    });
  } else {
    res.json({
      success: false,
      errorMessage: 'Authentication is required'
    });
  }
});

//targetId와 나눈 이전의 채팅들을 모두 읽음 처리하는 api
//성공시, success: true
//실패시, success: false, errorMessage
router.post('/chatData/read/:targetId', verifyMiddleWare, async (req, res, next) => {
  const { id } = req.decoded;
  const { targetId }= req.params;

  if (id) {
    await query(`UPDATE message SET is_read = 1 where from_id = '${targetId}' and to_id = '${id}';`);
    res.json({
      success: true
    });
  } else {
    res.json({
      success: false,
      errorMessage: 'Authentication is required'
    });
  }
});

//채팅 상대가 현재 채팅방에 있는지 확인하는 api
//성공시, success: true, is_in_this_room: true 혹은 false
//실패시, success: false, errorMessage
router.get('/chatData/is_at_chatroom/:targetId', verifyMiddleWare, async (req, res, next) => {
  const { id } = req.decoded;
  const { targetId }= req.params;

  if (id) {
    const queryResult = await query(`SELECT is_at_chatroom from users where id = '${targetId}'`);
    let is_in_this_room;
		queryResult.forEach(query => {
			is_in_this_room = (query.is_at_chatroom == id ? 1 : 0);
      console.log(id);
      console.log(query.is_at_chatroom);
      console.log(is_in_this_room);

		})
    res.json({
      success: true,
      is_in_this_room
    });
  } else {
    res.json({
      success: false,
      errorMessage: 'Authentication is required'
    });
  }
});

//현재 들어있는 채팅창 정보 수정 api
//req.body에 goingIn 필요: 채팅창에 들어오는 중이면 true, 나가는 중이면 false
//성공시, success: true
//실패시, success: false, errorMessage
router.post('/chatData/is_at_chatroom/:targetId', verifyMiddleWare, async (req, res, next) => {
  const { id } = req.decoded;
  const { targetId }= req.params;
  const { goingIn } = req.body; //채팅창에 들어오는 중인지, 나가는 중인지

  if (id) {
    if (goingIn) {
      await query(`UPDATE users set is_at_chatroom = '${targetId}' where id = '${id}';`);
    } else {
      await query(`UPDATE users set is_at_chatroom = '' where id = '${id}';`);
    }
    res.json({
      success: true
    });
  } else {
    res.json({
      success: false,
      errorMessage: 'Authentication is required'
    });
  }
});

//targetId와 나눈 채팅들의 { from_id, to_id, text, date_time, is_read, is_rendezvous, set_time, building, floor, ssid, deleted }을 시간순으로 정렬해서 리턴하는 api
//성공시, success: true, chatDatas
//실패시, success: false, errorMessage
// - 랑데부 메시지가 아닐시, 관련 데이터는 null로 반환
router.get('/chatData/:targetId', verifyMiddleWare, async (req, res, next) => {
  const { id } = req.decoded;
  const { targetId }= req.params;

  if (id) {
    const chatDatas = await query(`WITH b AS (SELECT text, a.f_id as from_id, a.t_id as to_id, date_time, is_rendezvous, message_id, is_read
      FROM message, (SELECT f.id as f_id, t.id as t_id FROM users f, users t WHERE (f.id = '${id}' and t.id = '${targetId}') OR (t.id = '${id}' and f.id = '${targetId}')) a
      WHERE (from_id = a.f_id and to_id = a.t_id)) select from_id, to_id, text, date_time, is_read, is_rendezvous, deleted, set_time, building, floor, ssid FROM b left join rendezvous_message USING (message_id) ORDER BY date_time ASC;`);
    res.json({
      success: true,
      chatDatas
    });
  } else {
    res.json({
      success: false,
      errorMessage: 'Authentication is required'
    });
  }
});

//무슨 함수인지 모르겠음, front에서 사용되는 곳을 못찾음
//채팅방을 만드는 함수같은데, chatrooms가 다른 곳에서 사용이 안됨
router.post('/', verifyMiddleWare, async (req, res, next) => {
  const { id } = req.decoded;
  const { name, description } = req.body;

  if (id) {
    const result = await query(`SELECT * FROM chatrooms where name = '${name}'`);
    if (result.length > 0) {
      res.json({
        success: false,
        errorMessage: 'Duplicate name'
      });
    } else {
      await query(`INSERT INTO chatrooms(name, description) VALUES('${name}', '${description}')`);

      res.json({
        success: true
      });
    }
  } else {
    res.json({
      success: false,
      errorMessage: 'Authentication is required'
    });
  }
});


module.exports = router;
