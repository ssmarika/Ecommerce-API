const checkMongoIdsEquality = (id1, id2) => {
  const equals = id1.equals(id2);
  return equals;
};

export default checkMongoIdsEquality;
