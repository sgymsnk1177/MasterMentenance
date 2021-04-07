import React from 'react';
import { Form } from 'react-bootstrap';

export const DataKbnSelect = React.memo(({ onChange, dataList: list }) => {
  return (
    <>
      <Form className='select'>
        <Form.Group controlId='mailingListForm.SelectCustom'>
          <Form.Control as='select' size='sm' custom onChange={onChange}>
            <option />
            {list.map((v, i) => (
              <option key={v.DATA_KBN} value={v.DATA_KBN}>
                {i.toString()}. {v.DATA_KBN}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      </Form>
    </>
  );
});
