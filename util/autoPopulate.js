
const { Model, Query } = require('mongoose');
const graphqlFields = require('graphql-fields');

function dfs({ paths }, fields) {
  return Object.entries(paths).reduce((popOpts, [path, schemaType]) => {
    if (fields !== null && !(path in fields)) return popOpts;
    if (schemaType.schema) {
      let opts = dfs(schemaType.schema, fields === null ? null : fields?.[path]);
      if (opts.length === 0) return popOpts;
      return popOpts.concat(opts.map(opt => ({ path, populate: opt })));
    }
    else if (schemaType.options.ref) {
      return fields === null
        ? popOpts.concat({ path })
        : popOpts.concat({ path, select: Object.keys(fields[path]).join(' ') });
    }
    return popOpts;
  }, []);
}

async function autoPopulateModel(model, returnFields = null) {
  let popOpts = dfs(model.schema, returnFields);
  for (let popOpt of popOpts)
      await model.populate(popOpt);
  return model;
}

function autoPopulateQuery(query, returnFields = null) {
  return dfs(query.schema, returnFields).reduce((q, popOpt) => q.populate(popOpt), query);
}

function autoPopulate(query, info = null) {
  const returnFields = info == null ? null : graphqlFields(info);
  if (query instanceof Query)
    return autoPopulateQuery(query, returnFields);
  else if (query instanceof Model)
    return autoPopulateModel(query, returnFields);
}

module.exports = autoPopulate;
