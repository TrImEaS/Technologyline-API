const { LIQUIDSPool } = require ('./config.js')

class ConceptModel {
  static async getAll ({ id, name, number, all }) {
    try {
      if(id) {
        const [res] = await LIQUIDSPool.query(`SELECT * FROM concepts WHERE id = ? AND active = 1`, id)
        return res
      }

      if(name) {
        const [res] = await LIQUIDSPool.query(`SELECT * FROM concepts WHERE name = ? AND active = 1`, name)
        return res
      }

      if(number) {
        const [res] = await LIQUIDSPool.query(`SELECT * FROM concepts WHERE number = ? AND active = 1`, number)
        return res
      }

      if(all) {
        const [res] = await LIQUIDSPool.query(`SELECT * FROM concepts`, number)
        return res
      }

      const [res] = await LIQUIDSPool.query('SELECT * FROM concepts WHERE active = 1');
      return res
    } 
    catch (e) {
      console.error('Error getting all concepts db:', e); 
      throw e;
    }
  }

  static async create ({ input }) { 
    try {
      const existingName = await this.getAll({ name: input.name });
      const existingNumber = await this.getAll({ number: input.number });
      if (existingName.length > 0 || existingNumber.length > 0) {
        return false;
      }

      const { name, type, number, baseConceptIds, formula } = input;
      const baseConceptIdsJSON = JSON.stringify(baseConceptIds);
      const query = `INSERT INTO concepts (name, type, number, baseConceptIds, formula)
                     VALUES (?, ?, ?, ?, ?)`;
      const [result] = await LIQUIDSPool.query(query, [ name, type, number, baseConceptIdsJSON, formula ]);
      return result.insertId;
    } 
    catch (e) {
      console.log('Error creating concept: ', e)
      throw e;
    }
  }

  static async update({ id, input }) {
    try {
      const fieldsToUpdate = [];
      const values = [];
  
      for (const key of Object.keys(input)) {
        if (input[key] !== undefined) {
          fieldsToUpdate.push(`${key} = ?`);

          values.push(key === 'baseConceptIds' ? JSON.stringify(input[key]) : input[key]);
        }
      }
  
      if (fieldsToUpdate.length > 0) {
        values.push(id);
        const query = `UPDATE concepts SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
        const [result] = await LIQUIDSPool.query(query, values);
        return result.affectedRows > 0; 
      }
  
      return false; 
    } 
    catch (e) {
      console.log('Error updating concept: ', e);
      throw e;
    }
  }
  

  static async delete({ id }) {
    try {
      const query = `UPDATE concepts SET active = 0 WHERE id = ?`;
      const [result] = await LIQUIDSPool.query(query, [id]);
      return result.affectedRows > 0; 
    } 
    catch (e) {
      console.log('Error updating active status in concept: ', e);
      throw e;
    }
  }
  
}

module.exports = ConceptModel