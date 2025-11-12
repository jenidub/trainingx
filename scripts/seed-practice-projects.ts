/**
 * Seed Practice Projects
 * 
 * This script seeds the legacy practiceProjects table with data from projects-seed.json
 * Run this before running Phase 1 migrations
 * 
 * Usage:
 * 1. In Convex dashboard, go to Functions
 * 2. Run practiceProjects:seedProjects with the projects array from data/projects-seed.json
 * 
 * OR use this script to automate it
 */

import projectsData from '../data/projects-seed.json';

console.log('Practice Projects Seed Data');
console.log('===========================');
console.log(`Total projects: ${projectsData.length}`);
console.log('\nTo seed:');
console.log('1. Copy the projects-seed.json content');
console.log('2. Go to Convex Dashboard → Functions');
console.log('3. Run: practiceProjects:seedProjects');
console.log('4. Paste the JSON array as the "projects" argument');
console.log('\nOr use the Convex CLI:');
console.log('npx convex run practiceProjects:seedProjects --arg projects=@data/projects-seed.json');
