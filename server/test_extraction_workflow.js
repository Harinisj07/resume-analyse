import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { extractResumeDocumentText, ExtractionError } from './src/services/textExtraction.service.js';
import Resume from './src/models/resume.model.js';

async function runTests() {
  console.log('=== TEST SUITE: RESUME TEXT EXTRACTION ===');

  // Test 1: Valid PDF
  console.log('\n--- 1. Testing Valid PDF Extraction ---');
  const validPdfPath = 'd:/project/scratch/real_sample_resume.pdf';
  const pdfRes = await extractResumeDocumentText(validPdfPath, 'real_sample_resume.pdf');
  console.log('✓ PDF extracted successfully:');
  console.log('  Word count:', pdfRes.wordCount);
  console.log('  Character count:', pdfRes.characterCount);
  console.log('  Pages count:', pdfRes.pagesCount);
  console.log('  Preview snippet:', pdfRes.text.substring(0, 100).replace(/\n/g, ' '));
  if (!pdfRes.text.includes('Alex Morgan')) throw new Error('PDF missing expected name');

  // Test 2: Valid DOCX
  console.log('\n--- 2. Testing Valid DOCX Extraction ---');
  const validDocxPath = 'd:/project/server/node_modules/mammoth/test/test-data/single-paragraph.docx';
  const docxRes = await extractResumeDocumentText(validDocxPath, 'single-paragraph.docx');
  console.log('✓ DOCX extracted successfully:');
  console.log('  Word count:', docxRes.wordCount);
  console.log('  Character count:', docxRes.characterCount);
  console.log('  Text:', docxRes.text);
  if (!docxRes.text.includes('Walking on imported air')) throw new Error('DOCX missing expected content');

  // Test 3: Empty DOCX Document
  console.log('\n--- 3. Testing Empty DOCX Document Error Handling ---');
  const emptyDocxPath = 'd:/project/server/node_modules/mammoth/test/test-data/empty.docx';
  try {
    await extractResumeDocumentText(emptyDocxPath, 'empty.docx');
    throw new Error('Should have thrown on empty docx');
  } catch (err) {
    console.log('✓ Caught expected empty document error:', err.code, '-', err.message);
    if (err.code !== 'EMPTY_DOCUMENT') throw new Error('Wrong error code: ' + err.code);
  }

  // Test 4: Empty PDF Document
  console.log('\n--- 4. Testing Empty PDF Document Error Handling ---');
  const emptyPdfPath = 'd:/project/scratch/empty_test.pdf';
  try {
    await extractResumeDocumentText(emptyPdfPath, 'empty_test.pdf');
    throw new Error('Should have thrown on empty pdf');
  } catch (err) {
    console.log('✓ Caught expected empty document error:', err.code, '-', err.message);
    if (err.code !== 'EMPTY_DOCUMENT') throw new Error('Wrong error code: ' + err.code);
  }

  // Test 5: Corrupted PDF
  console.log('\n--- 5. Testing Corrupted PDF Error Handling ---');
  const corruptPdfPath = 'd:/project/scratch/corrupt.pdf';
  fs.writeFileSync(corruptPdfPath, 'This is completely corrupted and not a pdf');
  try {
    await extractResumeDocumentText(corruptPdfPath, 'corrupt.pdf');
    throw new Error('Should have thrown on corrupted pdf');
  } catch (err) {
    console.log('✓ Caught expected corrupted PDF error:', err.code, '-', err.message);
    if (err.code !== 'CORRUPTED_PDF') throw new Error('Wrong error code: ' + err.code);
  }

  // Test 6: Corrupted DOCX
  console.log('\n--- 6. Testing Corrupted DOCX Error Handling ---');
  const corruptDocxPath = 'd:/project/scratch/corrupt.docx';
  fs.writeFileSync(corruptDocxPath, 'Corrupted fake docx data');
  try {
    await extractResumeDocumentText(corruptDocxPath, 'corrupt.docx');
    throw new Error('Should have thrown on corrupted docx');
  } catch (err) {
    console.log('✓ Caught expected corrupted DOCX error:', err.code, '-', err.message);
    if (err.code !== 'CORRUPTED_DOCX') throw new Error('Wrong error code: ' + err.code);
  }

  // Test 7: Unsupported File Format
  console.log('\n--- 7. Testing Unsupported File Format Error Handling ---');
  const unsupportedPath = 'd:/project/scratch/resume.png';
  fs.writeFileSync(unsupportedPath, 'fake image data');
  try {
    await extractResumeDocumentText(unsupportedPath, 'resume.png');
    throw new Error('Should have thrown on unsupported format');
  } catch (err) {
    console.log('✓ Caught expected unsupported format error:', err.code, '-', err.message);
    if (err.code !== 'UNSUPPORTED_FORMAT') throw new Error('Wrong error code: ' + err.code);
  }

  // Test 8: End-to-End Database Workflow
  console.log('\n--- 8. Testing MongoDB Database Save & Status Transitions ---');
  await mongoose.connect('mongodb://127.0.0.1:27017/resume_analyzer');
  console.log('Connected to MongoDB.');

  // Create initial 'uploaded' record
  const newResume = await Resume.create({
    fileName: 'test_candidate_extraction.pdf',
    filePath: validPdfPath,
    fileType: 'application/pdf',
    extractedText: '',
    analysisStatus: 'uploaded',
    fileSize: fs.statSync(validPdfPath).size,
  });
  console.log('Step 1 (Upload): Saved initial resume doc with status:', newResume.analysisStatus, 'ID:', newResume._id);

  // Transition to 'processing'
  newResume.analysisStatus = 'processing';
  await newResume.save();
  console.log('Step 2 (Processing): Updated status to:', newResume.analysisStatus);

  // Perform extraction and save to DB
  const extData = await extractResumeDocumentText(newResume.filePath, newResume.fileName);
  newResume.extractedText = extData.text;
  newResume.wordCount = extData.wordCount;
  newResume.analysisStatus = 'completed';
  await newResume.save();
  console.log('Step 3 (Save in DB): Updated status to:', newResume.analysisStatus);

  // Verify reload from DB
  const reloaded = await Resume.findById(newResume._id);
  console.log('Step 4 (Verify DB): Reloaded record from MongoDB:');
  console.log('  Status:', reloaded.analysisStatus);
  console.log('  Extracted text length:', reloaded.extractedText.length);
  console.log('  Word count in DB:', reloaded.wordCount);
  if (reloaded.analysisStatus !== 'completed' || !reloaded.extractedText) {
    throw new Error('Database verification failed!');
  }

  // Clean up test document
  await Resume.findByIdAndDelete(newResume._id);
  await mongoose.disconnect();

  console.log('\n==========================================');
  console.log('>>> ALL 8 EXTRACTION WORKFLOW TESTS PASSED! <<<');
  console.log('==========================================');
}

runTests().catch(err => {
  console.error('\n❌ TEST RUNNER FAILED:', err);
  process.exit(1);
});
