import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FormControl, Table, Button, ButtonGroup, InputGroup, Container, Row, Col } from 'react-bootstrap';
import { ShitenSelect } from '../elements/Select';
import { checkInputData, getGuid, sleep } from '../util/Common';
import { isEqualWith } from 'lodash';

const SHITEN_LIST = [
  { CODE: 10, NAME: '北海道支店' },
  { CODE: 20, NAME: '東北支店' },
  { CODE: 30, NAME: '東京支店' },
  { CODE: 31, NAME: '関東支店' },
  { CODE: 40, NAME: '名古屋支店' },
  { CODE: 50, NAME: '大阪支店' },
  { CODE: 60, NAME: '中国支店' },
  { CODE: 70, NAME: '四国支店' },
  { CODE: 80, NAME: '九州支店' },
];

const MailingList = () => {
  const currentKbn = useRef('');
  const [mailAddress, setMailAddress] = useState('');
  const [dataList, setDatalist] = useState([]);
  const refDataList = useRef([]);

  useEffect(() => {
    // getDataKbn();
  }, []);

  const handleKbnSelect = useCallback(
    (e) => {
      console.log(e.target.value);
      currentKbn.current = e.target.value;
      getShitenTantoList();
    },
    [currentKbn]
  );

  const getShitenTantoList = async () => {
    try {
      const response = await fetch('mastermentenance?TYPE=GET_SHITEN_LIST&DATA_KBN=' + currentKbn.current);
      const data = await response.json();
      const listString = data.LIST[0].MAIL_ADD || '';

      if (listString) {
        const list = listString.split(';').map((v, i) => ({ ID: getGuid(), MAIL_ADDRESS: v }));
        refDataList.current = list;
        setDatalist(list);
      } else {
        setDatalist([]);
      }
    } catch {
      setDatalist([]);
    }
    handleReset();
  };

  const handleReset = () => {
    setMailAddress('');
  };

  const handleItemMode = (index, at) => {
    if ((index === 0 && at === -1) || (index === dataList.length - 1 && at === 1)) {
      return false;
    }
    if (dataList && dataList.length > 1) {
      const item = dataList[index];
      const tempList = [...dataList].filter((v, i) => i !== index);

      const targetIndex = index + at;
      const newList = [];
      tempList.forEach((v, i) => {
        if (i === targetIndex) {
          newList.push(item);
        }
        newList.push(v);
      });
      setDatalist(newList);
    }
  };

  const handleDeleteItem = async ({ ID }) => {
    const result = window.confirm('削除実行しますか？');
    if (!result) {
      return false;
    }
    setDatalist((oldData) => {
      return oldData.filter((v) => v.ID !== ID);
    });
    handleReset();
  };

  const handleSubmitUpdate = async () => {
    if (!dataList || dataList.length === 0) {
      return false;
    }
    if (isEqualWith(dataList, refDataList.current)) {
      return false;
    }

    const MAIL_ADD = dataList.map((v) => v.MAIL_ADDRESS).join(';');
    const fd = new FormData();
    fd.append('TYPE', 'UPDATE_SHITEN_LIST');
    fd.append(
      'ITEM',
      JSON.stringify({
        DATA_KBN: currentKbn.current,
        MAIL_ADD,
      })
    );

    const response = await fetch('mastermentenance', {
      method: 'POST',
      body: fd,
    });
    const data = await response.json();
    console.log(data);

    if (!data.RES) {
      alert('データの登録・更新に失敗しました。');
      return false;
    }
    handleReset();
  };

  const handleAddItem = () => {
    if (!currentKbn.current) {
      return false;
    }
    if (!checkInputData('name', mailAddress)) {
      alert('メールアドレスを正しく入力して下さい');
      return false;
    }

    setDatalist((prevList) => {
      return [...prevList, { ID: getGuid(), MAIL_ADDRESS: mailAddress }];
    });
    handleReset();
  };

  return (
    <>
      <div style={{ margin: 16 }}>支店担当設定</div>

      <Container className="themed-container" fluid={true}>
        <Row>
          <Col sm={6}>
            <ShitenSelect onChange={handleKbnSelect} dataList={SHITEN_LIST} />
          </Col>
        </Row>
      </Container>

      {/* <div style={{ margin: 15 }}>支店長</div>
      <Container>
        <Row>
          <AutosuggestText />
        </Row>
      </Container> */}

      <div style={{ margin: 15 }}>担当者リスト</div>
      <Container>
        <Row>
          <Col sm={6}>
            <InputGroup className="mb-3">
              <FormControl
                placeholder="メールアドレス"
                aria-label="Recipient's username"
                aria-describedby="basic-addon2"
                onChange={(e) => setMailAddress(e.target.value)}
                value={mailAddress}
              />
              {/* <InputGroup.Append>
                <InputGroup.Text id="basic-addon2">@example.com</InputGroup.Text>
              </InputGroup.Append> */}
            </InputGroup>
          </Col>
          <Col sm={2}>
            <Button
              disabled={mailAddress === ''}
              className="btn_w"
              size="sm"
              variant="primary"
              onClick={() => handleAddItem()}>
              追加
            </Button>
          </Col>
        </Row>
      </Container>

      <Table bordered striped hover size="sm" className="shiten-list-table">
        <thead>
          <tr>
            <th>メールアドレス</th>
            <th>アクション</th>
          </tr>
        </thead>
        <tbody>
          {dataList &&
            dataList.map((item, index) => (
              <tr key={item.ID}>
                <td>{item.MAIL_ADDRESS}</td>
                <td>
                  <Button className="btn" size="sm" variant="outline-danger" onClick={() => handleDeleteItem(item)}>
                    削除
                  </Button>
                  <ButtonGroup size="sm">
                    <Button
                      // className='btn'
                      size="sm"
                      variant="outline-info"
                      onClick={() => handleItemMode(index, -1)}>
                      ↑
                    </Button>
                    <Button
                      // className='btn'
                      size="sm"
                      variant="outline-info"
                      onClick={() => handleItemMode(index, 1)}>
                      ↓
                    </Button>
                  </ButtonGroup>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
      <Container>
        <Row>
          <Col></Col>
          <Col>{!isEqualWith(dataList, refDataList.current) ? '実行ボタンを押すまで変更は反映されません' : ''}</Col>
          <Col>
            <Button
              // className='btn flex-end'
              variant="info"
              size="lg"
              block
              style={{ width: 300 }}
              onClick={handleSubmitUpdate}>
              実行
            </Button>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default MailingList;
