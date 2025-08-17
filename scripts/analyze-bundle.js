#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes the Next.js bundle and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Analyzing bundle size and optimization opportunities...\n');

// Check if .next directory exists
const nextDir = path.join(process.cwd(), '.next');
if (!fs.existsSync(nextDir)) {
  console.log('❌ .next directory not found. Please run "pnpm build" first.');
  process.exit(1);
}

try {
  // Run Next.js bundle analyzer
  console.log('📊 Running Next.js bundle analysis...');
  execSync('npx next build --analyze', { stdio: 'inherit' });
  
  console.log('\n✅ Bundle analysis complete!');
  console.log('\n📋 Optimization Recommendations:');
  
  const recommendations = [
    '1. 🚀 Dynamic Imports: Use dynamic imports for large components',
    '2. 📦 Tree Shaking: Remove unused imports and exports',
    '3. 🖼️  Image Optimization: Use Next.js Image component',
    '4. 📚 Code Splitting: Split large pages into smaller chunks',
    '5. 🗜️  Compression: Enable gzip/brotli compression',
    '6. 🎯 Lazy Loading: Implement lazy loading for non-critical components',
    '7. 📱 Progressive Loading: Load mobile-specific code conditionally',
    '8. 🔄 Service Workers: Cache static assets efficiently',
  ];
  
  recommendations.forEach(rec => console.log(rec));
  
  console.log('\n🔧 Next Steps:');
  console.log('• Review the bundle analyzer output in your browser');
  console.log('• Identify large dependencies that can be code-split');
  console.log('• Consider lazy loading heavy components');
  console.log('• Optimize third-party library imports');
  
} catch (error) {
  console.error('❌ Error running bundle analysis:', error.message);
  
  console.log('\n🛠️  Manual optimization checklist:');
  console.log('1. Check for duplicate dependencies in package.json');
  console.log('2. Use dynamic imports for heavy components');
  console.log('3. Optimize third-party library imports');
  console.log('4. Remove unused dependencies');
  console.log('5. Enable compression in production');
}

// Check for common optimization opportunities in the codebase
console.log('\n🔎 Scanning codebase for optimization opportunities...');

const scanResults = {
  dynamicImportCandidates: [],
  unusedDependencies: [],
  largeComponents: [],
  imageOptimizations: []
};

// Scan for large component files that could benefit from dynamic imports
function scanForLargeComponents(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      scanForLargeComponents(filePath, results);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const size = stat.size;
      if (size > 10000) { // Files larger than 10KB
        results.push({
          file: filePath.replace(process.cwd(), '.'),
          size: Math.round(size / 1024) + 'KB'
        });
      }
    }
  }
  
  return results;
}

try {
  const srcDir = path.join(process.cwd(), 'src');
  if (fs.existsSync(srcDir)) {
    scanResults.largeComponents = scanForLargeComponents(srcDir);
    
    if (scanResults.largeComponents.length > 0) {
      console.log('\n📁 Large components that could benefit from code splitting:');
      scanResults.largeComponents
        .sort((a, b) => parseInt(b.size) - parseInt(a.size))
        .slice(0, 10)
        .forEach(comp => {
          console.log(`   ${comp.file} (${comp.size})`);
        });
    }
  }
} catch (error) {
  console.log('⚠️  Could not scan components:', error.message);
}

console.log('\n✨ Bundle optimization analysis complete!');
console.log('💡 Consider implementing the recommendations above for better performance.');