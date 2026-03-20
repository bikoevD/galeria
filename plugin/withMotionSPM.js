const { withXcodeProject } = require("@expo/config-plugins");

const MOTION_REPO_URL = "https://github.com/b3ll/Motion.git";

module.exports = (config) =>
  withXcodeProject(config, (config) => {
    const proj = config.modResults;
    const objects = proj.hash.project.objects;
    const rootProject = objects.PBXProject[proj.hash.project.rootObject];

    const alreadyAdded = Object.values(
      objects.XCRemoteSwiftPackageReference ?? {}
    ).some(
      (ref) => typeof ref === "object" && ref.repositoryURL === MOTION_REPO_URL
    );

    if (alreadyAdded) return config;

    objects.XCRemoteSwiftPackageReference ??= {};
    const pkgUUID = proj.generateUuid();
    objects.XCRemoteSwiftPackageReference[pkgUUID] = {
      isa: "XCRemoteSwiftPackageReference",
      repositoryURL: MOTION_REPO_URL,
      requirement: { kind: "branch", branch: "main" },
    };
    objects.XCRemoteSwiftPackageReference[`${pkgUUID}_comment`] =
      'XCRemoteSwiftPackageReference "Motion"';

    rootProject.packageReferences ??= [];
    rootProject.packageReferences.push({ value: pkgUUID, comment: "Motion" });

    const appTarget = Object.entries(objects.PBXNativeTarget).find(
      ([, v]) =>
        typeof v === "object" &&
        v.productType === '"com.apple.product-type.application"'
    );

    if (appTarget) {
      objects.XCSwiftPackageProductDependency ??= {};
      const depUUID = proj.generateUuid();
      objects.XCSwiftPackageProductDependency[depUUID] = {
        isa: "XCSwiftPackageProductDependency",
        package: pkgUUID,
        productName: "Motion",
      };
      objects.XCSwiftPackageProductDependency[`${depUUID}_comment`] = "Motion";

      appTarget[1].packageProductDependencies ??= [];
      appTarget[1].packageProductDependencies.push({
        value: depUUID,
        comment: "Motion",
      });
    }

    return config;
  });
