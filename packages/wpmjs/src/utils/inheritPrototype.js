// 寄生方式继承父类原型
module.exports = function inheritPrototype(child, parent) {
  // 创建父类原型的副本
  var prototype = Object.create(parent.prototype);
  // 设置子类原型，包括 constructor 属性
  prototype.constructor = child;
  child.prototype = prototype;
}