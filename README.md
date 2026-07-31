## Deployment

This website is deployed directly to an Amazon S3 bucket using **Static Website Hosting**.

There is no build step or framework. The website uses plain HTML, CSS, and JavaScript.

### Deployment Steps

1. Upload all files **inside the `public/` folder** to the root of the S3 bucket.

   Do not upload the `public` folder itself, as this will cause the file paths to break.

2. Go to **Permissions** and turn off **Block all public access**.

3. Add the following bucket policy. Replace `my-homepage-2026` with your actual bucket name:

```json
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
```

4. Go to **Properties** and enable **Static website hosting**.

5. Set the following values:

   - Index document: `index.html`
   - Error document: `index.html`

## Updating the Website

To update the website, upload the changed file or files again through the S3 console.

Uploading a file with the same name will overwrite the existing file. The changes should appear without running another build or redeploying the entire website.
