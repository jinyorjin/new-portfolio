How it's deployed

Uploaded straight to an S3 bucket with static website hosting turned on. No build step, no framework, just plain HTML/CSS/JS.

Steps if you're setting this up again:

Upload everything inside public/ to the bucket root (don't upload the public folder itself, or paths break)
Turn off "Block public access" in bucket permissions
Add this bucket policy (swap in your bucket name):
json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::my-homepage-2026/*"
       }
     ]
   }
Enable Static website hosting under Properties
Index document: index.html
Error document: index.html
Updating the site

Just re-upload the changed file(s) in the S3 console — overwrites take effect immediately, no redeploy needed.
