#!/usr/bin/env node

/**
 * Fix Remaining Issues Script
 * Helps developers systematically address remaining code quality issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing remaining code quality issues...\n');

// Define issue categories with examples and solutions
const issueCategories = {
  'typescript-any': {
    title: '🔴 TypeScript `any` Types',
    priority: 'HIGH',
    count: 200,
    description: 'Replace `any` types with proper TypeScript types',
    examples: [
      'function process(data: any) → function process(data: Record<string, unknown>)',
      'const result: any = api.call() → const result: ApiResponse = api.call()',
      'props: any → props: ComponentProps'
    ],
    solution: `
1. Identify the actual shape of the data
2. Create proper interfaces or types
3. Use generic types where appropriate
4. Consider using 'unknown' instead of 'any' for safer typing
    `
  },
  'accessibility': {
    title: '🔴 Accessibility Issues',
    priority: 'HIGH',
    count: 50,
    description: 'Add keyboard handlers and ARIA attributes',
    examples: [
      'Add onKeyDown handlers for clickable divs',
      'Add role="button" and tabIndex={0} for interactive elements',
      'Add aria-label for better screen reader support'
    ],
    solution: `
1. Add keyboard event handlers (Enter/Space keys)
2. Add proper ARIA roles and labels
3. Ensure all interactive elements are focusable
4. Test with screen readers
    `
  },
  'unused-variables': {
    title: '🟡 Unused Variables',
    priority: 'MEDIUM',
    count: 100,
    description: 'Remove or properly use unused variables and imports',
    examples: [
      'Remove unused imports',
      'Remove unused function parameters',
      'Use variables that are assigned but never read'
    ],
    solution: `
1. Run 'pnpm lint:fix' for automatic fixes
2. Manually review complex cases
3. Remove dead code
4. Consider if variables are needed for future development
    `
  },
  'react-hooks': {
    title: '🟡 React Hooks Dependencies',
    priority: 'MEDIUM',
    count: 30,
    description: 'Fix dependency arrays to prevent stale closures',
    examples: [
      'Add missing dependencies to useEffect',
      'Add missing dependencies to useCallback',
      'Consider using useCallback for functions passed as props'
    ],
    solution: `
1. Add missing dependencies to dependency arrays
2. Use useCallback for functions that are dependencies
3. Consider using refs for values that shouldn't trigger re-renders
4. Use ESLint react-hooks/exhaustive-deps rule
    `
  },
  'image-optimization': {
    title: '🟡 Image Optimization',
    priority: 'MEDIUM',
    count: 20,
    description: 'Replace <img> tags with Next.js Image component',
    examples: [
      '<img src="..." /> → <Image src="..." width={} height={} />',
      'Add proper alt text for accessibility',
      'Use responsive images with different sizes'
    ],
    solution: `
1. Import Image from 'next/image'
2. Add width and height props
3. Consider using fill prop for responsive images
4. Add proper alt text
    `
  }
};

// Helper functions
function printIssueCategory(category, data) {
  console.log(`\n${data.title}`);
  console.log(`Priority: ${data.priority} | Estimated issues: ${data.count}`);
  console.log(`Description: ${data.description}\n`);
  
  console.log('Examples:');
  data.examples.forEach(example => {
    console.log(`  • ${example}`);
  });
  
  console.log(`\nSolution:${data.solution}`);
  console.log('─'.repeat(80));
}

function runLintCheck() {
  try {
    console.log('📊 Running lint check to identify current issues...\n');
    const result = execSync('pnpm lint', { encoding: 'utf8' });
    console.log('✅ No linting errors found!');
    return true;
  } catch (error) {
    const output = error.stdout || error.message;
    const lines = output.split('\n').filter(line => line.trim());
    
    // Count different types of issues
    const issues = {
      'no-explicit-any': 0,
      'no-unused-vars': 0,
      'exhaustive-deps': 0,
      'accessibility': 0,
      'no-img-element': 0
    };
    
    lines.forEach(line => {
      if (line.includes('no-explicit-any')) issues['no-explicit-any']++;
      if (line.includes('no-unused-vars')) issues['no-unused-vars']++;
      if (line.includes('exhaustive-deps')) issues['exhaustive-deps']++;
      if (line.includes('jsx-a11y')) issues['accessibility']++;
      if (line.includes('no-img-element')) issues['no-img-element']++;
    });
    
    console.log('📈 Current issue counts:');
    console.log(`  • TypeScript 'any' types: ${issues['no-explicit-any']}`);
    console.log(`  • Unused variables: ${issues['no-unused-vars']}`);
    console.log(`  • React hooks deps: ${issues['exhaustive-deps']}`);
    console.log(`  • Accessibility: ${issues['accessibility']}`);
    console.log(`  • Image optimization: ${issues['no-img-element']}`);
    
    return false;
  }
}

function generateFixPlan() {
  console.log('\n🎯 RECOMMENDED FIX PLAN\n');
  console.log('Phase 1 - Critical Issues (Week 1-2):');
  console.log('1. Fix TypeScript `any` types in core utilities (lib/, types/)');
  console.log('2. Add keyboard handlers to interactive components');
  console.log('3. Run automated fixes: pnpm lint:fix\n');
  
  console.log('Phase 2 - Important Issues (Week 3-4):');
  console.log('4. Fix React hooks dependencies');
  console.log('5. Replace img tags with Next.js Image component');
  console.log('6. Remove unused variables and imports\n');
  
  console.log('Phase 3 - Optimization (Week 5-6):');
  console.log('7. Implement code splitting for large components');
  console.log('8. Add proper error boundaries');
  console.log('9. Optimize bundle size\n');
}

function createFixingTools() {
  console.log('🛠️  Creating helper tools...\n');
  
  // Create a TypeScript any-finder script
  const anyFinderScript = `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function findAnyTypes(dir) {
  const files = fs.readdirSync(dir);
  const results = [];
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      results.push(...findAnyTypes(filePath));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\\n');
      
      lines.forEach((line, index) => {
        if (line.includes(': any') || line.includes('<any>') || line.includes('as any')) {
          results.push({
            file: filePath.replace(process.cwd(), '.'),
            line: index + 1,
            content: line.trim()
          });
        }
      });
    }
  }
  
  return results;
}

const anyTypes = findAnyTypes('./src');
console.log(\`Found \${anyTypes.length} 'any' types:\`);
anyTypes.forEach(result => {
  console.log(\`\${result.file}:\${result.line} - \${result.content}\`);
});
`;

  fs.writeFileSync('./scripts/find-any-types.js', anyFinderScript);
  console.log('✅ Created scripts/find-any-types.js');
  
  // Create accessibility checker
  const a11yScript = `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function findA11yIssues(dir) {
  const files = fs.readdirSync(dir);
  const results = [];
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      results.push(...findA11yIssues(filePath));
    } else if (file.endsWith('.tsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\\n');
      
      lines.forEach((line, index) => {
        // Check for clickable divs without keyboard handlers
        if (line.includes('onClick') && line.includes('<div') && !line.includes('onKeyDown')) {
          results.push({
            file: filePath.replace(process.cwd(), '.'),
            line: index + 1,
            issue: 'Clickable div without keyboard handler',
            content: line.trim()
          });
        }
        
        // Check for missing alt text
        if (line.includes('<img') && !line.includes('alt=')) {
          results.push({
            file: filePath.replace(process.cwd(), '.'),
            line: index + 1,
            issue: 'Image without alt text',
            content: line.trim()
          });
        }
      });
    }
  }
  
  return results;
}

const issues = findA11yIssues('./src');
console.log(\`Found \${issues.length} accessibility issues:\`);
issues.forEach(result => {
  console.log(\`\${result.file}:\${result.line} - \${result.issue}\`);
  console.log(\`  \${result.content}\\n\`);
});
`;

  fs.writeFileSync('./scripts/find-a11y-issues.js', a11yScript);
  console.log('✅ Created scripts/find-a11y-issues.js');
}

// Main execution
console.log('🚀 Starting comprehensive code quality improvement process...\n');

// Print all issue categories
Object.entries(issueCategories).forEach(([key, data]) => {
  printIssueCategory(key, data);
});

// Run lint check
const hasNoLintErrors = runLintCheck();

if (!hasNoLintErrors) {
  generateFixPlan();
  createFixingTools();
  
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Run: node scripts/find-any-types.js');
  console.log('2. Run: node scripts/find-a11y-issues.js');
  console.log('3. Run: pnpm lint:fix');
  console.log('4. Fix issues systematically following the plan above');
  console.log('5. Run: pnpm type-check');
  console.log('6. Test accessibility with screen readers');
  
  console.log('\n💡 TIP: Focus on one category at a time for best results!');
} else {
  console.log('\n🎉 All major code quality issues have been resolved!');
  console.log('Consider running the bundle analyzer to check for optimization opportunities:');
  console.log('  pnpm build:analyze');
}

console.log('\n✨ Code quality improvement analysis complete!');