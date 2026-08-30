class ValidationAgent {
  static async validate(node, output) {
    console.log(`ValidationAgent: validating output for node ${node.id}`);
    
    if (!output || !output.success) {
      return { isValid: false, error: 'MISSING_FIELDS' };
    }
    
    return { isValid: true };
  }
}

module.exports = ValidationAgent;
