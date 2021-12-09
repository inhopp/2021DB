const express = require('express');
const router = express.Router();
const { query } = require('../modules/db');
const { sign, verifyMiddleWare } = require('../modules/jwt');

router.post('/signIn', async (req, res, next) => {
  const { id, password } = req.body;
  
  const queryResult = await query(`SELECT * FROM users WHERE id = '${id}' and password = '${password}';`);

  if (queryResult.length > 0) {
    const jwt = sign({
      id,
      name: queryResult[0].name
    });
    await query(`UPDATE users SET active = 1 WHERE id = '${id}';`);
    res.cookie('token', jwt, {
      httpOnly: true,
      expires: new Date( Date.now() + 60 * 60 * 1000 * 24 * 7) // 7일 후 만료
    }).json({
      success: true,
      id,
      name: queryResult[0].name,
      active: queryResult[0].active,
      current_status: queryResult[0].current_status,
      role: queryResult[0].role,
      building: queryResult[0].building,
      floor: queryResult[0].floor,
      ssid: queryResult[0].ssid,
      longitude: queryResult[0].longitude,
      latitude: queryResult[0].latitude,
      ip: queryResult[0].ip,
    });
  } else {
    res.json({
      success: false,
      errorMessage: 'Incorrect id or password'
    });
  }
});

router.get('/whoAmI', verifyMiddleWare, (req, res, next) => {
  const { id, name } = req.decoded;

  if (id) {
    res.json({
      success: true,
      id,
      name,
    });
  } else {
    res.json({
      success: false,
      errorMesage: 'Authentication is required'
    });
  }
});

router.get('/friends', verifyMiddleWare, async (req, res, next) => {
  const { id } = req.decoded;

  if (id) {
    const friends = (await query(`SELECT id, name, role, current_status FROM users where id in (SELECT to_id FROM friends WHERE from_id in (SELECT id FROM users WHERE id = '${id}')) ORDER BY name ASC;`));

    res.json({
      success: true,
      friends
    });
  } else {
    res.json({
      success: false,
      errorMessage: 'Authentication is required'
    });
  }
});

router.post('/addFriends', verifyMiddleWare, async (req, res, next) => {
  const { id } = req.decoded;
  const { friend_id } = req.body;

  if (id) {
    if (friend_id) {
      const friends_array = await query(`SELECT * FROM friends WHERE (from_id, 
        to_id) in (SELECT u1.id, u2.id from users u1, users u2 WHERE u1.id = '${id}' and u2.id = '${friend_id}');`);

      if (friends_array.length > 0) {
        res.json({
          success: false,
          errorMessage: 'already exists!'
        });
      } else {
        await query(`INSERT INTO friends(from_id, to_id) (SELECT u1.id, u2.id from users u1, users u2 WHERE u1.id = '${id}' and u2.id = '${friend_id}');`);

        res.json({
          success: true,
        });
      }
    } else {
      res.json({
        success: false,
        errorMessage: 'no friend_id'
      });
    }
  } else {
    res.json({
      success: false,
      errorMessage: 'Authentication is required'
    });
  }
});

router.post('/removeFriends', verifyMiddleWare, async (req, res, next) => {
  const { id } = req.decoded;
  const { friend_id } = req.body;

  if (id) {
    if (friend_id) {
      const friends_array = await query(`SELECT * FROM friends WHERE (from_id, 
        to_id) in (SELECT u1.id, u2.id from users u1, users u2 WHERE u1.id = '${id}' and u2.id = '${friend_id}');`);

      if (friends_array.length === 0) {
        res.json({
          success: false,
          errorMessage: 'Not exists id!'
        });
      } else {
        await query(`DELETE FROM friends where (from_id, to_id) in (SELECT u1.id, u2.id from users u1, users u2 WHERE u1.id = '${id}' and u2.id = '${friend_id}');`);

        res.json({
          success: true,
        });
      }
    } else {
      res.json({
        success: false,
        errorMessage: 'no friend_id'
      });
    }
  } else {
    res.json({
      success: false,
      errorMessage: 'Authentication is required'
    });
  }
});

router.get('/signOut', verifyMiddleWare, async (req, res, next) => {
  const { id } = req.decoded;

  if (id) {
    await query(`UPDATE users SET active = 0 WHERE id = '${id}';`);
    res.clearCookie('token').json({
      success: true
    })
  } else {
    res.json({
      success: false,
      errorMessage: 'Jwt not exists'
    })
  }
});

router.post('/signUp', async (req, res, next) => {
  const { id, password, name, role } = req.body;
  const id_regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,20}$/; // 4~20자리의 문자 및 숫자 1개 이상씩 사용한 정규식
  const name_regex = /^[가-힣a-zA-z]{3,20}$/;

  // 아이디 유효성 검사 통과 x
  if (!id_regex.test(id)) {
    res.json({
      success: false,
      errorMessage: 'Unvalid id'
    });
  } else if (!name_regex.test(name)) {
    res.json({
      success: false,
      errorMessage: 'Unvalid name'
    });
  } else { // 통과 O
    // 중복 확인
    const queryResult = await query(`SELECT * from users where id = '${id}'`);

    if (queryResult.length > 0) {
      res.json({
        success: false,
        errorMessage: 'Duplicate id'
      });
    } else {
      await query(`INSERT INTO users(id, password, name, role) VALUES('${id}', '${password}', '${name}', '${role}')`);

      res.json({
        success: true
      });
    }
  }
});


// 친구 목록 관련 api

//특정 id의 상태메시지 api
//req.body에 id 필요: 알고자 하는 상태메시지를 가진 유저의 id
//성공시, success: true, current_status
//살패시, success: false, errorMessage
router.get('/editCurrentStatus', verifyMiddleWare, async (req, res, next) => {
  const { id } = req.body;

  const queryResult = await query(`SELECT * from users where id = '${id}';`);

  if (queryResult.length > 0) {
    const current_status = await query(`SELECT current_status FROM users WHERE id = '${id}';`);

      res.json({
        success: true,
        current_status
      });
  } else {
    res.json({
      success: false,
      errorMessage: 'Incorrect id'
    });
  }
});

// 친구 검색 관련 api

//해당 id 혹은 이름을 가진 유저 검색 api
//req.body에 idOrName 필요: 검색하고자 하는 id 혹은 이름
//성공시, success: true, queryResult
//실패시, success: false, errorMessage
router.post('/idOrName', verifyMiddleWare, async (req, res, next) => {
  const { idOrName } = req.body;
  const searchs = await query(`SELECT id, name, role, current_status from users where id like '%${idOrName}%' or name like '%${idOrName}%';`);
  if (searchs.length > 0) {
    res.json({
      success: true,
      searchs
    });
  } else {
    res.json({
      success: false,
      errorMessage: 'No such id or name'
    });
  }
});

// 내 정보 편집 관련 api 시작

//상태메시지 변경 api
//req.body에 current_status 필요: 새 상태메시지 내용
//성공시 success: true
//실패시 success: false, errorMessage: 'Incorrect id'
router.post('/editCurrentStatus', verifyMiddleWare, async (req, res, next) => {
  const { id } = req.decoded;
  const { current_status } = req.body;
  console.log(current_status);

  const status_regex = /^.{0,20}$/; // 모든 글자 20자 이하

  console.log(status_regex.test(current_status));
  if (!status_regex.test(current_status)) {
    res.json({
      success: false,
      errorMessage: '글자수가 너무 많습니다'
    });
  } else {
    const queryResult = await query(`SELECT * from users where id = '${id}';`);
    if (queryResult.length > 0) {
      await query(`UPDATE users SET current_status = '${current_status}' WHERE id = '${id}';`);
      console.log(current_status);
        res.json({
          success: true
        });
    } else {
      res.json({
        success: false,
        errorMessage: 'Incorrect id'
      });
    }
  }  
});
//위치 변경 api
//req.body에 ??? 필요:  내용
//성공시 success: true
//실패시 success: false, errorMessage: 'Incorrect id'
router.post('/updateLocation', verifyMiddleWare, async (req, res, next) => {
  const { content, building, longitude, latitude, floor, SSID, IP } = req.body;
  const id = req.decoded;
  const findLocation = await query(`SELECT * FROM location WHERE building = '${building}' and floor = '${floor}' and ssid = '${SSID}'`);
  if (findLocation.length == 0) {
    await query(`INSERT INTO location(building, floor, ssid, longitude, latitude, ip) 
    VALUES('${building}', '${floor}', '${SSID}', '${longitude}', '${latitude}', '${IP}')`);
  }
  await query(`UPDATE users SET building = '${building}' WHERE id = '${id}';`);
  await query(`UPDATE users SET floor = '${floor}' WHERE id = '${id}';`);
  await query(`UPDATE users SET ssid = '${SSID}' WHERE id = '${id}';`);
  res.json({
    success: true,
  });
});

router.get('/arounds', verifyMiddleWare, async (req, res, next) => {
  const { id } = req.decoded;
  const myLongLat = await query(`SELECT L.longitude, L.latitude FROM location L, users U WHERE U.id='${id} AND U.building=L.building AND U.floor=L.floor AND U.ssid=L.ssid';`)
  const allLongLat = await query(`SELECT DISTINCT L.longitude, L.latitude FROM location L`)
  if (myLongLat.length==0){
    res.json({
      success: false,
      errorMessage: "You should first upload your Location."
    })
  } else {
    res.json({
      success: true,
      errorMessage: null,
      myLongLat: myLongLat,
      allLongLat: allLongLat
    })
  }
});


//회원 탈퇴 api
//성공시, success: true
//실패시, success: false, errorMessage: 'Incorrect id'
router.post('/deleteAccount', verifyMiddleWare, async (req, res, next) => {
  const { id } = req.decoded;

  const queryResult = await query(`SELECT * from users where id = '${id}';`);

  if (queryResult.length > 0) {
    await query(`DELETE FROM users WHERE id = '${id}';`);

      res.json({
        success: true
      });
  } else {
    res.json({
      success: false,
      errorMessage: 'Incorrect id'
    });
  }
});
// 내 정보 편집 관련 api 끝

// 내 주변 관련 api
//get('/arounds', ...) SELECT building, floor, ssid FROM location where 500m 이내
//get('/aroundsub', ...) SELECT id, name, role, current_status FROM users where ssid 일치

module.exports = router;
